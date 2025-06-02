import {Box, Flex, HStack, IconButton, Image, Text, useToast, VStack, useBreakpointValue} from "@chakra-ui/react";
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
    isGrouped?: boolean;
    groupedReservations?: ReservationItemData[];
    totalGuests?: number;
    reservationIds?: string[];
    tourId?: string;
    createdAt?: string | number | Date;
    tour?: {
        minPerEventLimit?: number;
        maxPerEventLimit?: number;
        id?: string;
        name?: string;
        StandardOperation?: string;
        imageUrl?: string;
    };
    waiverCount?: number;
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
    const isMobile = useBreakpointValue({ base: true, md: false });
    const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

    const [groupedReservations, setGroupedReservations] = useState<ReservationItemData[]>([]);

    const fetchTourInfo = useCallback(async (tourId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${tourId}`, {
                credentials: "include",
            });
            return await response.json();
        } catch (error) {
            console.error(`Error fetching tour data for ${tourId}:`, error);
            return null;
        }
    }, []);
    
    useEffect(() => {
        if (reservations.some(res => res.isGrouped)) {
            setGroupedReservations([...reservations]);
            return;
        }
        
        const processTours = async () => {
            const tourIds = [...new Set(
                reservations
                    .map(reservation => {
                        const tourId = reservation.tourId || 
                                      (reservation.tour && 'id' in reservation.tour ? reservation.tour.id : '');
                        return tourId || '';
                    })
                    .filter(id => id !== '')
            )];
            
            const tourLimits: Record<string, {
                minPerEventLimit: number;
                maxPerEventLimit: number;
            }> = {};
            
            if (tourIds.length > 0) {
                await Promise.all(tourIds.map(async (tourId) => {
                    const tourData = await fetchTourInfo(tourId);
                    if (tourData) {
                        tourLimits[tourId] = {
                            minPerEventLimit: tourData.minPerEventLimit || 0,
                            maxPerEventLimit: tourData.maxPerEventLimit || 0
                        };
                    }
                }));
            }
            
            const preGroupedReservations: Record<string, ReservationItemData[]> = {};
            
            reservations.forEach(reservation => {
                const tourId = reservation.tourId || 
                              (reservation.tour && 'id' in reservation.tour ? reservation.tour.id : '');
                const key = `${tourId}_${reservation.time}`;
                
                if (!preGroupedReservations[key]) {
                    preGroupedReservations[key] = [reservation];
                } else {
                    preGroupedReservations[key].push(reservation);
                }
            });
            
            const newGrouped: ReservationItemData[] = [];
            
            Object.entries(preGroupedReservations).forEach(([key, reservationsInGroup]) => {
                const tourId = key.split('_')[0];
                const tourLimit = tourId ? tourLimits[tourId] : undefined;
                
                const maxLimit = tourLimit?.maxPerEventLimit || 0;
                
                if (maxLimit === 0 || reservationsInGroup.length === 1) {
                    processReservationsGroup(reservationsInGroup, tourLimit, newGrouped);
                } else {
                    const sortedReservations = [...reservationsInGroup].sort((a, b) => {
                        const dateA = a.createdAt 
                            ? new Date(a.createdAt as string | number | Date).getTime() 
                            : 0;
                        const dateB = b.createdAt 
                            ? new Date(b.createdAt as string | number | Date).getTime() 
                            : 0;
                        return dateA - dateB;
                    });
                    
                    const subgroups: ReservationItemData[][] = [];
                    let currentSubgroup: ReservationItemData[] = [];
                    let currentTotal = 0;
                    
                    sortedReservations.forEach(reservation => {
                        const guestCount = reservation.guestQuantity || 0;
                        
                        if (maxLimit > 0 && currentTotal + guestCount > maxLimit && currentSubgroup.length > 0) {
                            subgroups.push(currentSubgroup);
                            currentSubgroup = [reservation];
                            currentTotal = guestCount;
                        } else {
                            currentSubgroup.push(reservation);
                            currentTotal += guestCount;
                        }
                    });
                    
                    if (currentSubgroup.length > 0) {
                        subgroups.push(currentSubgroup);
                    }
                    
                    subgroups.forEach(subgroup => {
                        processReservationsGroup(subgroup, tourLimit, newGrouped);
                    });
                }
            });
            
            setGroupedReservations(newGrouped);
        };
        
        const processReservationsGroup = (
            group: ReservationItemData[], 
            tourLimit: { minPerEventLimit: number, maxPerEventLimit: number } | undefined,
            outputArray: ReservationItemData[]
        ) => {
            if (group.length > 1 && (tourLimit?.minPerEventLimit || group[0].tour?.minPerEventLimit)) {
                const totalGuests = group.reduce((sum, res) => sum + (res.guestQuantity || 0), 0);
                const baseReservation = { ...group[0] };
                
                if (tourLimit && (!baseReservation.tour || !baseReservation.tour.minPerEventLimit)) {
                    baseReservation.tour = {
                        ...(baseReservation.tour || {}),
                        minPerEventLimit: tourLimit.minPerEventLimit,
                        maxPerEventLimit: tourLimit.maxPerEventLimit
                    };
                }
                
                baseReservation.isGrouped = true;
                baseReservation.groupedReservations = group;
                baseReservation.totalGuests = totalGuests;
                baseReservation.reservationIds = group.map(res => res.id);
                
                outputArray.push(baseReservation);
            } else {
                const singleReservation = { ...group[0] };
                
                if (tourLimit && (!singleReservation.tour || !singleReservation.tour.minPerEventLimit)) {
                    singleReservation.tour = {
                        ...(singleReservation.tour || {}),
                        minPerEventLimit: tourLimit.minPerEventLimit,
                        maxPerEventLimit: tourLimit.maxPerEventLimit
                    };
                }
                
                outputArray.push(singleReservation);
            }
        };
        
        processTours();
    }, [reservations, fetchTourInfo]);

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
                        email: item.guide.email || ""
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
            id: guide.id,
            name: guide.name,
            email: ""
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
            {groupedReservations.map((item, index) => {
                const isGroupWithMinLimit = item.isGrouped && item.tour?.minPerEventLimit > 0;
                const minReached = isGroupWithMinLimit && item.totalGuests >= item.tour.minPerEventLimit;
                const guestsNeeded = isGroupWithMinLimit ? item.tour.minPerEventLimit - item.totalGuests : 0;
                
                return (
                    <Flex
                        key={index}
                        bg="white"
                        p={{base: 3, md: 3}}
                        borderRadius="md"
                        align="center"
                        justify="space-between"
                        boxShadow="sm"
                        cursor="pointer"
                        onClick={() => onSelectReservation(item)}
                        flexWrap={{base: "wrap", md: "nowrap"}}
                        mb={isMobile ? 4 : 0}
                        borderLeft={isGroupWithMinLimit ? (minReached ? "4px solid green" : "4px solid orange") : undefined}
                    >
                        <HStack spacing={{base: 3, md: 3}} flexShrink={0} w={isMobile ? "100%" : "auto"}>
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
                                boxSize={isMobile ? "80px" : "70px"}
                                borderRadius="md"
                                alt="Tour Icon"
                                objectFit="fill"
                            />
                            {!isCompactView && (
                                <Box flex="1" maxW={isTablet ? "120px" : "auto"}>
                                    <Text 
                                        fontWeight="semibold" 
                                        fontSize="sm"
                                        isTruncated={isTablet}
                                        maxW={isTablet ? "120px" : "auto"}
                                        title={item.title}
                                    >
                                        {item.title}
                                    </Text>
                                    <HStack spacing={{base: 2, md: 3}} fontSize={{base: "xs", md: "xs"}} color="gray.500">
                                        <Text>{item.available}</Text>
                                        <Text>{item.reservedDetails}</Text>
                                    </HStack>
                                    
                                    {isGroupWithMinLimit && (
                                        <Text 
                                            fontSize="xs" 
                                            color={minReached ? "green.500" : "orange.500"}
                                            fontWeight="medium"
                                        >
                                            {minReached 
                                                ? "Min. guests reached" 
                                                : `Need ${guestsNeeded} more guest${guestsNeeded !== 1 ? 's' : ''}`}
                                        </Text>
                                    )}
                                    
                                    {item.isGrouped && item.groupedReservations?.length > 1 && (
                                        <Text fontSize="xs" color="blue.500">
                                            {item.groupedReservations.length} bookings
                                        </Text>
                                    )}
                                </Box>
                            )}
                        </HStack>

                        {!isCompactView && !isMobile && (
                            <HStack spacing={4} align="center">
                                <Box boxSize="8px" borderRadius="full" bg={item.statusColor}/>
                                <Flex
                                    w={{md: "100%", lg: "600px"}}
                                    maxW={{md: "350px", lg: "600px"}}
                                    display="flex"
                                    alignItems="center"
                                    p={2}
                                >
                                    <HStack spacing={1} width={isTablet ? "70px" : "auto"} minW="70px" justifyContent="flex-start">
                                        <FaPencilAlt
                                            color="gray"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Text fontSize="xs">
                                            {isGroupWithMinLimit 
                                                ? `${item.totalGuests}/${item.tour.minPerEventLimit}` 
                                                : item.capacity}
                                        </Text>
                                    </HStack>
                                    <Flex 
                                        justify="center" 
                                        align="center" 
                                        flex="1" 
                                        minW={{md: "140px"}}
                                        maxW={{md: "140px", lg: "100%"}}
                                    >
                                        <AiOutlineCompass size="14px"/>
                                        <Text
                                            marginLeft={"5px"}
                                            fontSize="xs"
                                            color="green.600"
                                            textAlign="left"
                                            onClick={(e) => handleOpenGuideModal(e, item)}
                                            cursor="pointer"
                                            _hover={{color: "blue.500"}}
                                            isTruncated
                                            maxW={{md: "110px", lg: "100%"}}
                                            title={displayGuideText(item)}
                                        >
                                            {displayGuideText(item)}
                                        </Text>
                                    </Flex>
                                    <Flex align="center" justify="flex-end" minW="80px">
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
                                            <Box width="32px" height="32px"/>
                                        )}
                                        <Box>
                                            <DashBoardMenu reservation={item} />
                                        </Box>
                                    </Flex>
                                </Flex>
                            </HStack>
                        )}

                        {(isMobile && !isCompactView) && (
                            <Flex 
                                mt={3}
                                w="100%"
                                direction="column"
                                borderTop="1px solid"
                                borderColor="gray.100"
                                pt={3}
                            >
                                <Flex justify="space-between" align="center" mb={2}>
                                    <HStack spacing={2}>
                                        <Box boxSize="8px" borderRadius="full" bg={item.statusColor}/>
                                        <HStack spacing={1}>
                                            <FaPencilAlt size="12px" color="gray"/>
                                            <Text fontSize="xs">
                                                {isGroupWithMinLimit 
                                                    ? `${item.totalGuests}/${item.tour.minPerEventLimit}` 
                                                    : item.capacity}
                                            </Text>
                                        </HStack>
                                    </HStack>
                                    
                                    <HStack>
                                        {item.hasNotes && (
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
                                        )}
                                        <DashBoardMenu reservation={item} isMobile={true} />
                                    </HStack>
                                </Flex>
                                
                                {item.isGrouped && (
                                    <Flex 
                                        p={2}
                                        bg="gray.50"
                                        borderRadius="md"
                                        direction="column"
                                        mb={2}
                                    >
                                        {isGroupWithMinLimit && (
                                            <Text 
                                                fontSize="xs" 
                                                color={minReached ? "green.500" : "orange.500"}
                                                fontWeight="medium"
                                            >
                                                {minReached 
                                                    ? "Minimum guests reached" 
                                                    : `Need ${guestsNeeded} more guest${guestsNeeded !== 1 ? 's' : ''}`}
                                            </Text>
                                        )}
                                        
                                        {item.groupedReservations?.length > 1 && (
                                            <Box mt={1}>
                                                <Text fontSize="xs" fontWeight="medium" color="blue.500">
                                                    {item.groupedReservations.length} bookings grouped:
                                                </Text>
                                                {item.groupedReservations.map((reservation, idx) => (
                                                    <Text key={idx} fontSize="xs" color="gray.600">
                                                        {reservation.user?.name || 'Guest'} ({reservation.guestQuantity} guest{reservation.guestQuantity !== 1 ? 's' : ''})
                                                    </Text>
                                                ))}
                                            </Box>
                                        )}
                                    </Flex>
                                )}
                                
                                <Flex 
                                    p={2}
                                    bg="gray.50"
                                    borderRadius="md"
                                    align="center"
                                    onClick={(e) => handleOpenGuideModal(e, item)}
                                    cursor="pointer"
                                >
                                    <AiOutlineCompass size="16px" color="#2D3748"/>
                                    <Text
                                        marginLeft="8px"
                                        fontSize="sm"
                                        color="gray.700"
                                        fontWeight="medium"
                                    >
                                        Guides:
                                    </Text>
                                    <Text
                                        marginLeft="5px"
                                        fontSize="sm"
                                        color="green.600"
                                        flex="1"
                                    >
                                        {displayGuideText(item)}
                                    </Text>
                                </Flex>
                            </Flex>
                        )}
                    </Flex>
                );
            })}
            
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
