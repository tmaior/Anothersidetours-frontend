import {
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    useToast,
    VStack,
} from "@chakra-ui/react";
import {BsSticky, BsThreeDots} from "react-icons/bs";
import {FaPencilAlt} from "react-icons/fa";
import React, {useEffect, useState} from "react";
import {AiOutlineCompass} from "react-icons/ai";
import ManageGuidesModal from "./ManageGuidesModal";
import {useGuides} from "../hooks/useGuides";
import {useGuideAssignment} from "../hooks/useGuideAssignment";
import {useReservationGuides} from "../hooks/useReservationGuides";

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

    return (
        <VStack align="stretch" spacing={4} bg="gray.50" p={4} borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                {date} {day} &nbsp;&nbsp; {availableSummary} - {reservedSummary}
            </Text>
            {reservations.map((item, index) => (
                <Flex
                    key={index}
                    bg="white"
                    p={3}
                    borderRadius="md"
                    align="center"
                    justify="space-between"
                    boxShadow="sm"
                    cursor="pointer"
                    onClick={() => onSelectReservation(item)}
                >
                    <HStack spacing={3}>
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
                    <Box flex="1" ml={4}>
                        {!isCompactView && (
                            <Text fontWeight="semibold" fontSize="sm">
                                {item.title}
                            </Text>
                        )}
                        {!isCompactView && (
                            <HStack spacing={3} fontSize="xs" color="gray.500">
                                <Text>{item.available}</Text>
                                <Text>{item.reservedDetails}</Text>
                            </HStack>
                        )}
                    </Box>

                    {!isCompactView && (
                        <HStack spacing={4} align="center">
                            <Box boxSize="8px" borderRadius="full" bg={item.statusColor}/>
                            <Flex
                                w={"900px"}
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
                                    onSelectGuide={handleGuideSelection} reservationId={reservationId}                                />
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
                                                onNoteClick(item);
                                            }}
                                        />
                                    ) : (
                                        <Box width="20px"/>
                                    )}
                                </Flex>
                            </Flex>
                            <Menu>
                                <MenuButton
                                    as={IconButton}
                                    icon={<BsThreeDots/>}
                                    variant="ghost"
                                    aria-label="Options"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <MenuList>
                                    <MenuItem>Download</MenuItem>
                                    <MenuItem>Create a Copy</MenuItem>
                                    <MenuItem>Mark as Draft</MenuItem>
                                    <MenuItem>Delete</MenuItem>
                                    <MenuItem>Attend a Workshop</MenuItem>
                                </MenuList>
                            </Menu>
                            <Button
                                variant="outline"
                                colorScheme="green"
                                size="xs"
                                onClick={(e) => e.stopPropagation()}
                            >
                                +
                            </Button>
                        </HStack>
                    )}
                </Flex>
            ))}
        </VStack>
    );
};

export default ReservationItem;
