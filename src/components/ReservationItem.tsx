import {Box, Button, Flex, HStack, IconButton, Image, Text, useToast, VStack,} from "@chakra-ui/react";
import {BsSticky} from "react-icons/bs";
import {FaPencilAlt} from "react-icons/fa";
import React, {useEffect, useState} from "react";
import {AiOutlineCompass} from "react-icons/ai";
import ManageGuidesModal from "./ManageGuidesModal";
import {useGuides} from "../hooks/useGuides";
import {useGuideAssignment} from "../hooks/useGuideAssignment";
import {useReservationGuides} from "../hooks/useReservationGuides";
import DashBoardMenu from "./DashboardMenuList";

const ReservationItem = ({
                             date,
                             day,
                             availableSummary,
                             reservedSummary,
                             reservations,
                             reservationId,
                             onNoteClick,
                             onSelectReservation,
                             isCompactView,
                         }) => {
    const [isGuideModalOpen, setGuideModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedGuideIds, setSelectedGuideIds] = useState<string[]>([]);
    const {guidesList, loadingGuides} = useGuides();
    const [selectedGuideNames, setSelectedGuideNames] = useState<string>("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {assignGuides, isAssigning,} = useGuideAssignment();
    const toast = useToast();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {guides, loading} = useReservationGuides(reservationId);

    useEffect(() => {
        if (guides.length > 0) {
            const guideNames = guides.map((guide) => guide.name).join(", ");
            setSelectedGuideNames(guideNames);
            setSelectedGuideIds(guides.map((guide) => guide.id));
        }
    }, [guides]);

    const handleNoteClick = async (item) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${item.id}`);
            const data = await response.json();
            onNoteClick(data, item.id);
        } catch (error) {
            console.error("Error fetching notes:", error);
            toast({
                title: "Error",
                description: "Failed to load notes.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchGuidesForReservation();
    }, [reservationId]);

    const fetchGuidesForReservation = async () => {
        if (reservationId) {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservationId}/guides`
                );
                if (response.ok) {
                    const data = await response.json();
                    const validGuides = data.filter((item) => item.guide?.name);
                    const guideNames = validGuides.map((item) => item.guide.name).join(", ");
                    setSelectedGuideNames(guideNames || "No guides assigned");
                    setSelectedGuideIds(validGuides.map((item) => item.guideId));
                } else {
                    throw new Error("Failed to fetch guides");
                }
            } catch (error) {
                console.error("Error fetching guides:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch guides for the reservation.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const handleGuideSelection = async (selectedGuides: { id: string; name: string }[]) => {
        const guideIds = selectedGuides.map((guide) => guide.id);
        setSelectedGuideIds(guideIds);
        setSelectedGuideNames(selectedGuides.map((guide) => guide.name).join(", "));

        if (reservationId) {
            try {
                await assignGuides(reservationId, guideIds);
                toast({
                    title: guideIds.length > 0 ? "Guides Assigned" : "Guides Removed",
                    description: guideIds.length > 0
                        ? "Guides successfully assigned to reservation"
                        : "All guides removed from reservation",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                await fetchGuidesForReservation();
            } catch {
                toast({
                    title: "Error",
                    description: "Failed to update guides",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const displayGuideText = () => {
        if (loadingGuides) return "Loading guides...";
        if (guidesList.length === 0) return "No Guide available";
        return selectedGuideNames || "No Guide selected";
    };

    const handleOpenGuideModal = (e) => {
        e.stopPropagation();
        setGuideModalOpen(true);
    };

    function formatDateToAmerican(date) {
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year}`;
    }

    return (
        <VStack align="stretch" spacing={4} bg="gray.50" p={4} borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                {formatDateToAmerican(date)} {day} &nbsp;&nbsp; {availableSummary} - {reservedSummary}
            </Text>
            {reservations.map((item, index) => (
                <Flex
                    key={index}
                    bg="white"
                    p={{ base: 2, md: 3 }}
                    borderRadius="md"
                    align="center"
                    justify="space-between"
                    boxShadow="sm"
                    cursor="pointer"
                    onClick={() => onSelectReservation(item)}
                    flexWrap={{ base: "wrap", md: "nowrap" }}
                >
                    <HStack spacing={{ base: 2, md: 3 }} flexShrink={0}>
                        <Box minWidth="40px" textAlign="center">
                            <Text fontWeight="medium" fontSize="sm" color="gray.600">
                                {item.time.split(' ')[0]}
                            </Text>
                            <Text fontWeight="light" fontSize="xs" color="gray.500" mt="-1">
                                {item.time.split(' ')[1]}
                            </Text>
                        </Box>
                        <Image
                            src={item.imageUrl}
                            boxSize="70px"
                            borderRadius="md"
                            alt="Tour Icon"
                            objectFit="fill"
                        />
                    </HStack>
                    <Box flex="1" ml={{ base: 2, md: 4 }} mt={{ base: 2, md: 0 }}>
                        {!isCompactView && (
                            <Text fontWeight="semibold" fontSize="sm">
                                {item.title}
                            </Text>
                        )}
                        {!isCompactView && (
                            <HStack spacing={{ base: 2, md: 3 }} fontSize={{ base: "xs", md: "xs" }} color="gray.500">
                                <Text>{item.available}</Text>
                                <Text>{item.reservedDetails}</Text>
                            </HStack>
                        )}
                    </Box>

                    {!isCompactView && (
                        <HStack spacing={4} align="center">
                            <Box boxSize="8px" borderRadius="full" bg={item.statusColor}/>
                            <Flex
                                w={"600px"}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p={2}
                            >
                                <HStack spacing={1}>
                                    <FaPencilAlt
                                        color="gray"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Text fontSize="xs">{item.capacity}</Text>
                                </HStack>
                                <Flex justify="center" align="center" flex="1">
                                    <AiOutlineCompass/>
                                    <Text
                                        marginLeft={"5px"}
                                        fontSize="xs"
                                        color="green.600"
                                        textAlign="center"
                                        onClick={handleOpenGuideModal}
                                        cursor="pointer"
                                        _hover={{color: "blue.500"}}
                                    >
                                        {displayGuideText()}
                                    </Text>
                                </Flex>
                                <ManageGuidesModal
                                    isOpen={isGuideModalOpen}
                                    onClose={() => setGuideModalOpen(false)}
                                    onSelectGuide={handleGuideSelection} reservationId={reservationId}
                                />
                                <Flex align="center" justify="center">
                                    {item.hasNotes ? (
                                        <IconButton
                                            icon={<BsSticky/>}
                                            variant="ghost"
                                            aria-label="Notes"
                                            size="sm"
                                            color="orange.500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNoteClick(item);
                                            }}
                                        />
                                    ) : (
                                        <Box width="20px"/>
                                    )}
                                </Flex>
                            </Flex>
                            <DashBoardMenu reservation={item}/>
                            {/*<Button*/}
                            {/*    variant="outline"*/}
                            {/*    colorScheme="green"*/}
                            {/*    size="xs"*/}
                            {/*    onClick={(e) => e.stopPropagation()}*/}
                            {/*>*/}
                            {/*    +*/}
                            {/*</Button>*/}
                        </HStack>
                    )}
                </Flex>
            ))}
        </VStack>
    );
};

export default ReservationItem;
