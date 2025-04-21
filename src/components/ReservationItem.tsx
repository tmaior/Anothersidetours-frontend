import {Box, Flex, HStack, IconButton, Image, Text, useToast, VStack,} from "@chakra-ui/react";
import {BsSticky} from "react-icons/bs";
import {FaPencilAlt} from "react-icons/fa";
import React, {useCallback, useEffect, useState} from "react";
import {AiOutlineCompass} from "react-icons/ai";
import ManageGuidesModal from "./ManageGuidesModal";
import {useGuides} from "../hooks/useGuides";
import {useGuideAssignment} from "../hooks/useGuideAssignment";
import DashBoardMenu from "./DashboardMenuList";
import useGuidesStore from "../utils/store";

interface ReservationItemData {
    id: string;
    guestQuantity?: number;
    time: string;
    notes?: string[];
    imageUrl: string;
    title: string;
    available: string;
    reservedDetails: string;
    statusColor: string;
    capacity: string;
    guide: string;
    hasNotes: boolean;
    user?: {
        name: string;
        email: string;
        phone: string;
    };
    [key: string]: unknown;
}

interface ReservationItemProps {
    date: string;
    day: string;
    availableSummary: string;
    reservedSummary: string;
    reservations: ReservationItemData[];
    reservationId?: string;
    onNoteClick: (notes: string[], reservationId: string) => void;
    onSelectReservation: (reservation: ReservationItemData) => void;
    isCompactView: boolean;
}

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
                         }: ReservationItemProps) => {
    const [isGuideModalOpen, setGuideModalOpen] = useState(false);
    const [activeReservationItem, setActiveReservationItem] = useState<ReservationItemData | null>(null);
    const {guidesList, loadingGuides} = useGuides();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {assignGuides, isAssigning,} = useGuideAssignment();
    const toast = useToast();
    const {reservationGuides, setReservationGuides} = useGuidesStore();

    const handleNoteClick = async (item) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${item.id}`,
                {
                    method: "GET",
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
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

    const fetchGuidesForItem = useCallback(async (itemId) => {
        if (itemId) {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${itemId}/guides`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        }
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    const validGuides = data.filter((item) => item.guide?.name);
                    
                    const formattedGuides = validGuides.map(item => ({
                        id: item.guideId,
                        name: item.guide.name,
                        expertise: ""
                    }));
                    
                    setReservationGuides(itemId, formattedGuides);
                } else {
                    throw new Error("Failed to fetch guides");
                }
            } catch (error) {
                console.error("Error fetching guides for item:", error);
            }
        }
    }, [setReservationGuides]);

    useEffect(() => {
        if (reservations && reservations.length > 0) {
            reservations.forEach(item => {
                fetchGuidesForItem(item.id);
            });
        }
    }, [reservations, fetchGuidesForItem]);

    useEffect(() => {
        if (reservationId) {
            console.debug('Reservation ID provided:', reservationId);
        }
    }, [reservationId]);

    const handleGuideSelection = async (selectedGuides: { id: string; name: string }[]) => {
        if (!activeReservationItem) return;
        const itemId = activeReservationItem.id;
        const guideIds = selectedGuides.map((guide) => guide.id);

        const formattedGuides = selectedGuides.map((guide) => ({
            ...guide,
            expertise: "",
            photoUrl: "",
        }));

        setReservationGuides(itemId, formattedGuides);

        try {
            await assignGuides(itemId, guideIds);
            toast({
                title: guideIds.length > 0 ? "Guides Assigned" : "Guides Removed",
                description: guideIds.length > 0
                    ? "Guides successfully assigned to reservation"
                    : "All guides removed from reservation",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            await fetchGuidesForItem(itemId);
        } catch {
            toast({
                title: "Error",
                description: "Failed to update guides",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const displayGuideText = (item) => {
        if (loadingGuides) return "Loading guides...";
        if (guidesList.length === 0) return "No guide available";
        
        if (reservationGuides[item.id]) {
            const guides = reservationGuides[item.id];
            return guides.length > 0 ? guides.map(guide => guide.name).join(", ") : "No guides assigned";
        }
        
        return "No guides assigned";
    };

    const handleOpenGuideModal = (e, item) => {
        e.stopPropagation();
        setActiveReservationItem(item);
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
                    p={{base: 2, md: 3}}
                    borderRadius="md"
                    align="center"
                    justify="space-between"
                    boxShadow="sm"
                    cursor="pointer"
                    onClick={() => onSelectReservation(item)}
                    flexWrap={{base: "wrap", md: "nowrap"}}
                >
                    <HStack spacing={{base: 2, md: 3}} flexShrink={0}>
                        <Box minWidth="40px" textAlign="center">
                            <Text fontWeight="medium" fontSize="sm" color="gray.600">
                                {item.time?.split(' ')[0]}
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
                    <Box flex="1" ml={{base: 2, md: 4}} mt={{base: 2, md: 0}}>
                        {!isCompactView && (
                            <Text fontWeight="semibold" fontSize="sm">
                                {item.title}
                            </Text>
                        )}
                        {!isCompactView && (
                            <HStack spacing={{base: 2, md: 3}} fontSize={{base: "xs", md: "xs"}} color="gray.500">
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
                                        onClick={(e) => handleOpenGuideModal(e, item)}
                                        cursor="pointer"
                                        _hover={{color: "blue.500"}}
                                    >
                                        {displayGuideText(item)}
                                    </Text>
                                </Flex>
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
                        </HStack>
                    )}
                </Flex>
            ))}
            
            {activeReservationItem && (
                <ManageGuidesModal
                    isOpen={isGuideModalOpen}
                    onClose={() => setGuideModalOpen(false)}
                    onSelectGuide={handleGuideSelection}
                    reservationId={activeReservationItem.id}
                />
            )}
        </VStack>
    );
};

export default ReservationItem;
