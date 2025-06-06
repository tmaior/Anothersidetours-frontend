import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Box,
    Button,
    Center,
    CircularProgress,
    Divider,
    Flex,
    HStack,
    IconButton,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    Spinner,
    Text,
    useDisclosure,
    useToast,
    VStack
} from '@chakra-ui/react';
import {ArrowBackIcon, SearchIcon} from '@chakra-ui/icons';
import DashboardLayout from "../../../components/DashboardLayout";
import {CiCalendar, CiClock2, CiLocationArrow1, CiSquarePlus} from "react-icons/ci";
import {IoPersonOutline} from "react-icons/io5";
import {RiRefund2Line} from "react-icons/ri";
import {AiOutlineCompass, AiOutlineMail} from "react-icons/ai";
import {BsBox2, BsCash, BsTelephone, BsThreeDots} from "react-icons/bs";
import {PiPencilSimpleLineDuotone} from "react-icons/pi";
import {useRouter} from "next/router";
import {HiOutlineMail} from "react-icons/hi";
import {RxPerson} from "react-icons/rx";
import {useGuest} from "../../../contexts/GuestContext";
import ChangeGuestQuantityModal, {CollectBalanceModal} from "../../../components/ChangeGuestQuantityModal";
import ChangeArrivalModal from "../../../components/ChangeArrivalModal";
import SendMessageModal from "../../../components/SendMessageModal";
import TimelinePage from "../../../components/TimelinePage";
import StatusBadge from "../../../components/StatusBadge";
import axios from "axios";
import ChangeAddOns from "../../../components/ChangeAddonsModal";
import {FiSend} from "react-icons/fi";
import {MdOutlineCancel, MdOutlineLocalPrintshop, MdOutlineRefresh} from 'react-icons/md';
import CancelConfirmationModal from "../../../components/CancelConfirmationModal";
import PurchaseNotes from "../../../components/PurchaseNotes";
import useWindowWidth from "../../../hooks/useWindowWidth";
import PurchaseSummaryDetailed from "../../../components/PurchaseSummaryDetailed";
import CustomLineItemsModal, {LineItem} from "../../../components/CustomLineItemsModal";
import ApplyCodeModal from '../../../components/ApplyCodeModal';
import ManageGuidesModal from "../../../components/ManageGuidesModal";
import {useGuides} from "../../../hooks/useGuides";
import {useGuideAssignment} from "../../../hooks/useGuideAssignment";
import useGuidesStore from "../../../utils/store";
import RefundModal from "../../../components/RefundModal";
import BookingCancellationModal from "../../../components/BookingCancellationModal";
import ReturnPaymentModal from '../../../components/ReturnPaymentModal';
import {FaRegCreditCard} from 'react-icons/fa';
import {BiCheck} from 'react-icons/bi';
import withPermission from "../../../utils/withPermission";
import {TbClipboardText} from 'react-icons/tb';
import ManageQuestionnairesModal from '../../../components/ManageQuestionnairesModal';
import { WaiverCountBadge, LinkWaiverButton } from "../../../components/waiver";

type GuestItemProps = {
    name: string;
    date: string;
    guests: string | number;
    avatarUrl: string;
    onClick?: () => void;
    isSelected?: boolean;
    toggleDetailedSummary?: () => void;
};

type GroupCardProps = {
    groupId: string;
    items: ReservationItem[];
    isExpanded: boolean;
    onToggle: () => void;
    onSelectReservation: (reservation: ReservationItem) => void;
    selectedReservation: ReservationItem | null;
    formatDate: (dateString: string) => string;
    toggleDetailedSummary?: () => void;
};

interface ReservationItem {
    id: string;
    name?: string;
    createdAt?: string;
    reservation_date?: string;
    isGroupBooking?: boolean;
    groupItems?: ReservationItem[];
    tour?: {
        id: string;
        name: string;
        price: number;
        imageUrl?: string;
    };
    valuePerGuest?: number;
    guestQuantity?: number;
    gratuityAmount?: number;
    gratuityPercent?: number;
    total_price?: number;
    user?: {
        id: string;
        name?: string;
        email?: string;
        phone?: string;
    };
    status?: string;
    tenantId?: string;
    tourId?: string;
    groupId?: string;
    reservationAddons?: Array<{ addonId: string; value: number }>;

    [key: string]: unknown;
}

const GuestItem: React.FC<GuestItemProps> = ({
                                                 name,
                                                 date,
                                                 guests,
                                                 avatarUrl,
                                                 onClick,
                                                 isSelected,
                                             }) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <HStack
            p={3}
            borderRadius="md"
            bg={isSelected ? 'blue.100' : 'white'}
            _hover={{bg: 'blue.50', cursor: 'pointer'}}
            justifyContent="space-between"
            width="100%"
            onClick={handleClick}
            boxShadow="0 1px 2px rgba(0,0,0,0.05)"
            my={1}
            border="none"
        >
            <HStack>
                <Image
                    boxSize="50px"
                    src={avatarUrl || "https://via.placeholder.com/50"}
                    title={name}
                    alt={name ? `Avatar of ${name}` : "Default avatar"}
                    borderRadius="md"
                />
                <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize={"sm"}>{name}</Text>
                    <Text fontSize="sm">⦿ {guests} Guests</Text>
                </VStack>
            </HStack>
            <Text fontSize="xs" color="gray.500">{date}</Text>
        </HStack>
    );
};
const GroupCard: React.FC<GroupCardProps> = ({

                                                 items,
                                                 isExpanded,
                                                 onToggle,
                                                 onSelectReservation,
                                                 selectedReservation,
                                                 formatDate,
                                                 toggleDetailedSummary
                                             }) => {
    const totalGuests = items.reduce((sum, item) => sum + (item.guestQuantity || 0), 0);
    const earliestDate = items.reduce((earliest: string | null, item) => {
        if (!item.reservation_date) return earliest;

        const currentDate = new Date(item.reservation_date);

        if (!earliest) return item.reservation_date;

        return new Date(earliest) < currentDate ? earliest : item.reservation_date;
    }, null);
    const groupImage = items[0]?.tour?.imageUrl || 'https://via.placeholder.com/50';

    const handleGroupClick = () => {
        onToggle();

        if (toggleDetailedSummary && items.length > 0) {
            const groupReservation = {
                ...items[0],
                user: items[0].user,
                isGroupBooking: true,
                groupItems: items
            };
            onSelectReservation(groupReservation);
            toggleDetailedSummary();
        }
    };
    return (
        <Box
            borderWidth="1px"
            borderRadius="md"
            mb={2}
            overflow="hidden"
            bg="white"
            w={"100%"}
            border="none"
            boxShadow="0 1px 2px rgba(0,0,0,0.05)"
        >
            <HStack
                p={3}
                justifyContent="space-between"
                width="100%"
                onClick={handleGroupClick}
                cursor="pointer"
                bg={isExpanded ? 'blue.50' : 'white'}
                _hover={{bg: 'blue.50'}}
            >
                <HStack>
                    <Box position="relative">
                        <Image
                            boxSize="50px"
                            src={groupImage}
                            alt="Group tours"
                            borderRadius="md"
                        />
                        <Box
                            position="absolute"
                            top="-8px"
                            right="-8px"
                            bg="blue.500"
                            color="white"
                            borderRadius="full"
                            width="22px"
                            height="22px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="bold"
                            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                            border="2px solid white"
                            zIndex="1"
                        >
                            {items.length}
                        </Box>
                    </Box>
                    <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm">{items[0]?.user?.name || 'Group Booking'}</Text>
                        <Text fontSize="sm">⦿ {totalGuests} Total Guests</Text>
                    </VStack>
                </HStack>
                <Box>
                    <Text fontSize="xs" color="gray.500">
                        {earliestDate ? formatDate(earliestDate) : 'N/A'}
                    </Text>
                </Box>
            </HStack>

            {isExpanded && (
                <VStack
                    p={3}
                    pt={0}
                    spacing={2}
                    align="stretch"
                    bg="gray.50"
                    borderTop="1px dashed"
                    borderColor="gray.200"
                >
                    {items.map((item) => (
                        <GuestItem
                            key={item.id}
                            name={item.tour?.name || 'Unknown Tour'}
                            avatarUrl={item.tour?.imageUrl || 'https://via.placeholder.com/50'}
                            guests={item.guestQuantity || 'N/A'}
                            date={formatDate(item.reservation_date)}
                            isSelected={selectedReservation?.id === item.id}
                            onClick={() => onSelectReservation(item)}
                            toggleDetailedSummary={toggleDetailedSummary}
                        />
                    ))}
                </VStack>
            )}
        </Box>
    );
};

const PurchaseList = ({
                          onSelectReservation,
                          selectedReservation,
                          searchTerm,
                          toggleDetailedSummary = () => {
                          }
                      }) => {
    const [reservations, setReservations] = useState([]);
    const [displayedReservations, setDisplayedReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const PAGE_LIMIT = 10;
    const {tenantId} = useGuest();
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/with-users/byTenantId/${tenantId}`,
                    {
                        credentials: "include",
                    }
                );
                const data = await response.json();

                const sortedReservations = [...data].sort((a, b) => {
                    const dateA = new Date(String(a.created_at || a.createdAt || '')).getTime();
                    const dateB = new Date(String(b.created_at || b.createdAt || '')).getTime();

                    if (dateA === dateB) {
                        return String(a.id).localeCompare(String(b.id));
                    }

                    return dateB - dateA;
                });
                
                setReservations(sortedReservations);
                setDisplayedReservations(sortedReservations.slice(0, PAGE_LIMIT));
                setHasMore(sortedReservations.length > PAGE_LIMIT);
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (tenantId) {
            fetchReservations();
        }
    }, [tenantId]);

    const filteredDisplayedReservations = displayedReservations.filter((reservation) => {
        if (!searchTerm) return true;

        const user = reservation.user || {};
        const searchTermLower = searchTerm.toLowerCase();

        return (
            user.name?.toLowerCase().includes(searchTermLower) ||
            user.email?.toLowerCase().includes(searchTermLower) ||
            user.phone?.toLowerCase().includes(searchTermLower) ||
            reservation.id?.toLowerCase().includes(searchTermLower)
        );
    });

    const loadMoreReservations = useCallback(() => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        
        const currentLength = displayedReservations.length;
        const nextReservations = reservations.slice(
            currentLength,
            currentLength + PAGE_LIMIT
        );

        if (nextReservations.length === 0) {
            setHasMore(false);
        } else {
            setDisplayedReservations((prev) => [
                ...prev,
                ...nextReservations.filter(
                    (newItem) => !prev.some((existingItem) => existingItem.id === newItem.id)
                ),
            ]);
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    }, [hasMore, isLoading, displayedReservations, reservations]);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;

        if (container) {
            const scrollPosition = container.scrollTop + container.clientHeight;
            const scrollThreshold = container.scrollHeight - 50;
            if (scrollPosition >= scrollThreshold && !isLoading && hasMore) {
                loadMoreReservations();
            }
        }
    }, [isLoading, hasMore, loadMoreReservations]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {month: 'short', day: '2-digit'}).format(date);
    };

    const groupReservations = (reservations: ReservationItem[]) => {
        const grouped: { [groupId: string]: ReservationItem[] } = {};
        const ungrouped: ReservationItem[] = [];

        const sortedReservations = [...reservations].sort((a, b) => {
            const dateA = new Date(String(a.created_at || a.createdAt || '')).getTime();
            const dateB = new Date(String(b.created_at || b.createdAt || '')).getTime();
            if (dateA === dateB) {
                return String(a.id).localeCompare(String(b.id));
            }
            return dateB - dateA;
        });

        sortedReservations.forEach(reservation => {
            if (reservation.groupId) {
                if (!grouped[reservation.groupId]) {
                    grouped[reservation.groupId] = [];
                }
                grouped[reservation.groupId].push(reservation);
            } else {
                ungrouped.push(reservation);
            }
        });

        Object.keys(grouped).forEach(groupId => {
            grouped[groupId].sort((a, b) => {
                const dateA = new Date(String(a.created_at || a.createdAt || '')).getTime();
                const dateB = new Date(String(b.created_at || b.createdAt || '')).getTime();
                if (dateA === dateB) {
                    return String(a.id).localeCompare(String(b.id));
                }
                return dateB - dateA;
            });
        });

        return {grouped, ungrouped};
    };

    const toggleGroupExpansion = (groupId) => {
        setExpandedGroupId(prev => prev === groupId ? null : groupId);
    };
    const {grouped, ungrouped} = groupReservations(filteredDisplayedReservations);

    return (
        <VStack
            marginTop={{ base: "-70px", md: "-100px" }}
            marginLeft={{ base: "0", md: "-40px" }}
            ref={containerRef}
            spacing={0}
            width={{ base: "100%", md: "25%" }}
            borderRight={{ base: "none", md: "1px solid #E2E8F0" }}
            height="calc(100vh - 100px)"
            w={{ base: "100%", md: "270px" }}
            p={{ base: "4px 0px 4px 4px", md: 4 }}
            onScroll={handleScroll}
            overflowY="auto"
            position="relative"
            bg="white"
            _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                bg: "white",
                zIndex: 2
            }}
            _after={{
                content: '""',
                position: "absolute",
                top: "1px",
                left: 0,
                right: 0,
                height: "4px",
                bg: "white",
                zIndex: 2
            }}
            css={{
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    marginRight: '-6px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(0, 0, 0, 0.5)',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                'scrollbar-gutter': 'stable',
                '&::-webkit-scrollbar-thumb:vertical': {
                    visibility: 'hidden',
                },
                '&:hover::-webkit-scrollbar-thumb:vertical': {
                    visibility: 'visible',
                }
            }}
        >
            {Object.entries(grouped).map(([groupId, items]) => (
                <GroupCard
                    key={groupId}
                    groupId={groupId}
                    items={items}
                    isExpanded={expandedGroupId === groupId}
                    onToggle={() => toggleGroupExpansion(groupId)}
                    onSelectReservation={onSelectReservation}
                    selectedReservation={selectedReservation}
                    formatDate={formatDate}
                    toggleDetailedSummary={toggleDetailedSummary}
                />
            ))}
            {ungrouped.map((purchase) => (
                <GuestItem
                    key={purchase.id}
                    name={purchase.user?.name || 'Unknown'}
                    avatarUrl={purchase.tour.imageUrl || 'https://via.placeholder.com/50'}
                    guests={purchase.guestQuantity || 'N/A'}
                    date={formatDate(purchase.reservation_date)}
                    isSelected={selectedReservation?.id === purchase.id}
                    onClick={() => onSelectReservation(purchase)}
                    toggleDetailedSummary={toggleDetailedSummary}
                />
            ))}
            {isLoading && (
                <Box py={4} textAlign="center" w="100%">
                    <Spinner size="md" color="blue.500" />
                </Box>
            )}
            {hasMore && !isLoading && filteredDisplayedReservations.length > 0 && (
                <Button 
                    onClick={loadMoreReservations}
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                    w="90%"
                    my={4}
                    mx="auto"
                >
                    Load More
                </Button>
            )}
            {!hasMore && filteredDisplayedReservations.length > 0 && (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
                    No more items to load
                </Text>
            )}
            {filteredDisplayedReservations.length === 0 && !isLoading && (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                    No results found
                </Text>
            )}
        </VStack>
    );
};


const PurchaseDetails = ({reservation, onBack}) => {
    const toast = useToast();
    const {
        onClose: onConfirmClose,
    } = useDisclosure();

    const {
        onOpen: onCancelOpen,
    } = useDisclosure();
    const windowWidth = useWindowWidth();
    const [isChangeGuestQuantityModalOpen, setChangeGuestQuantityModalOpen] = useState(false);
    const [isChangeArrivalonOpen, setChangeArrivalOpen] = useState(false);
    const [isSendMessageModalOpen, setSendMessageModalOpen] = useState(false);
    const [isChangeAddonsModalOpen, setChangeAddonsModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [isBookingCancellationOpen, setBookingCancellationOpen] = useState(false);
    const [guestCount, setGuestCount] = useState(reservation?.guestQuantity || 0);
    const [isCancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
    const [isGuideModalOpen, setGuideModalOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState([]);
    const {guidesList, loadingGuides} = useGuides();
    const {assignGuides, isAssigning} = useGuideAssignment();
    const {reservationGuides, setReservationGuides} = useGuidesStore();
    const guides = reservationGuides[reservation?.id] || [];
    const loading = false;
    const [localGuides, setLocalGuides] = useState([]);
    const [isReturnPaymentModalOpen, setIsReturnPaymentModalOpen] = useState(false);
    const [isQuestionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);

    useEffect(() => {
        if (reservation?.id) {
            setLocalGuides(reservationGuides[reservation.id] || []);
        }
    }, [reservation, reservationGuides]);

    useEffect(() => {
        if (reservation?.id && (!reservationGuides[reservation.id] || reservationGuides[reservation.id].length === 0)) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservation.id}/guides`,
                {
                    credentials: 'include',
                })
                .then(response => {
                    if (response.ok) return response.json();
                    throw new Error('Failed to fetch guides');
                })
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        const formattedGuides = data.map(item => ({
                            id: item.guideId,
                            name: item.guide.name,
                            email: item.guide.email || ''
                        }));
                        setReservationGuides(reservation.id, formattedGuides);
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch guides for reservation:", error);
                });
        }
    }, [reservation?.id, reservationGuides, setReservationGuides]);

    if (!reservation) {
        return <Text>No reservation Available</Text>;
    }

    if (!reservation.tour) {
        return <Text>No tour details available for this reservation</Text>;
    }

    const dateObject = reservation?.reservation_date
        ? new Date(reservation.reservation_date)
        : new Date();

    const datePart = dateObject.toISOString().split("T")[0];

    const utcHours = dateObject.getUTCHours();
    const utcMinutes = dateObject.getUTCMinutes();
    const period = utcHours >= 12 ? "PM" : "AM";
    const hours12 = utcHours % 12 || 12;

    const timePart = `${hours12.toString().padStart(2, "0")}:${utcMinutes
        .toString()
        .padStart(2, "0")} ${period}`;

    const formatDate = (dateString: string): string => {
        const [year, month, day] = dateString.split('-').map(Number);

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[month - 1]} ${day}, ${year}`;
    };


    const handleConfirmCancel = () => {
        setCancelConfirmationOpen(false);
        setBookingCancellationOpen(true);
    };

    const isVisible = (minWidth, maxWidth) => {
        return windowWidth >= minWidth && windowWidth <= maxWidth;
    };

    const formatBookingData = () => {
        if (!reservation) return null;

        const dateObject = reservation?.reservation_date
            ? new Date(reservation.reservation_date)
            : new Date();

        const localDate = new Date(dateObject.getTime() + dateObject.getTimezoneOffset() * 60000);

        const utcHours = localDate.getHours();
        const utcMinutes = localDate.getMinutes();
        const period = utcHours >= 12 ? "PM" : "AM";
        const hours12 = utcHours % 12 || 12;
        const time = `${hours12.toString().padStart(2, "0")}:${utcMinutes.toString().padStart(2, "0")} ${period}`;

        const paymentIntentId = reservation.PaymentTransaction?.[0]?.paymentIntentId ||
            reservation.PaymentTransaction?.[0]?.stripe_payment_id ||
            reservation.paymentIntentId;
        const paymentMethodId = reservation.PaymentTransaction?.[0]?.paymentMethodId ||
            reservation.paymentMethodId;

        return {
            id: reservation.id,
            title: reservation.tour?.name,
            imageUrl: reservation.tour?.imageUrl,
            dateFormatted: localDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC'
            }),
            time: time,
            user: reservation.user,
            total_price: reservation.total_price,
            paymentIntentId: paymentIntentId,
            paymentMethodId: paymentMethodId,
            setupIntentId: reservation.setupIntentId
        };
    };

    const handleRefundOptionSelect = (option: 'reduce' | 'return' | 'change') => {
        console.log('Handling refund option:', option);
        console.log('Current reservation data:', {
            id: reservation?.id,
            paymentIntentId: reservation?.paymentIntentId,
            paymentMethodId: reservation?.paymentMethodId,
            setupIntentId: reservation?.setupIntentId
        });

        setIsRefundModalOpen(false);
        switch (option) {
            case 'reduce':
                setBookingCancellationOpen(true);
                break;
            case 'return':
                const bookingData = formatBookingData();
                console.log('Formatted booking data for return payment:', bookingData);
                setIsReturnPaymentModalOpen(true);
                break;
            case 'change':
                setChangeGuestQuantityModalOpen(true);
                break;
        }
    };

    const ACTION_ITEMS = [
        {
            label: "Arrival",
            icon: <CiCalendar size={18}/>,
            // minBreakpoint: "lg",
            isVisible: isVisible(480, 2560),
            onClick: (e) => {
                e.stopPropagation();
                setChangeArrivalOpen(true);
            },
        },
        {
            label: "Guests",
            icon: <IoPersonOutline size={18}/>,
            // minBreakpoint: "lg",
            isVisible: isVisible(480, 2560),
            onClick: (e) => {
                e.stopPropagation();
                setChangeGuestQuantityModalOpen(true);
            },
        },
        {
            label: "Add-ons",
            icon: <BsBox2 size={15}/>,
            // minBreakpoint: "lg",
            isVisible: isVisible(480, 2560),
            onClick: (e) => {
                e.stopPropagation();
                setChangeAddonsModalOpen(true);
            },
        },
        {
            label: "Refund",
            icon: <RiRefund2Line size={18}/>,
            // minBreakpoint: "lg",
            isVisible: isVisible(480, 2560),
            onClick: (e) => {
                e.stopPropagation();
                setIsRefundModalOpen(true);
            },
        },
        {
            label: "Message Guests",
            icon: <CiLocationArrow1 size={18}/>,
            // minBreakpoint: "lg",
            isVisible: isVisible(480, 2560),
            onClick: (e) => {
                e.stopPropagation();
                setSendMessageModalOpen(true);
            },
        },
        {
            label: "Resend Confirmation",
            icon: <AiOutlineMail size={18}/>,
            // minBreakpoint: "lg",
            isVisible: isVisible(480, 2560),
            onClick: (e) => {
                e.stopPropagation();
            },
        },
        {
            label: "Resend Gratuity Notification",
            icon: <AiOutlineMail size={18}/>,
            // minBreakpoint: "2xl",
            isVisible: isVisible(1538, 2560),
            onClick: (e) => {
                e.stopPropagation();
            },
        },
        {
            label: "Resend Waiver Email",
            icon: <PiPencilSimpleLineDuotone size={18}/>,
            // minBreakpoint: "2xl",
            isVisible: isVisible(1728, 2560),
            onClick: (e) => {
                e.stopPropagation();
            },
        },
        // {
        //     label: "Switch Experience",
        //     icon: <MdOutlineRefresh size={18} />,
        //     minBreakpoint: "lg",
        //     maxBreakpoint: "lg",
        //     onClick: (e) => {
        //         e.stopPropagation();
        //     },
        // },
        // {
        //     label: "Switch Experience",
        //     icon: <MdOutlineRefresh size={18} />,
        //     minBreakpoint: "2xl",
        //     onClick: (e) => {
        //         e.stopPropagation();
        //     },
        // },
        {
            label: "Switch Experience",
            icon: <MdOutlineRefresh size={18}/>,
            isVisible: isVisible(1880, 2560),
            onClick: (e) => {
                e.stopPropagation();
            },
        },
        {
            label: "Print Receipt",
            icon: <MdOutlineLocalPrintshop size={18}/>,
            // minBreakpoint: "lg",
            // maxBreakpoint: "lg",
            isVisible: isVisible(2560, 2560),
            onClick: (e) => {
                e.stopPropagation();
            },
        },
        {
            label: "Email Receipt",
            icon: <AiOutlineMail size={18}/>,
            // minBreakpoint: "lg",
            // maxBreakpoint: "lg",
            isVisible: isVisible(2560, 2560),
            onClick: (e) => {
                e.stopPropagation();
            },
        },
        {
            label: "Rebook Organizer",
            icon: <FiSend size={18}/>,
            // minBreakpoint: "lg",
            // maxBreakpoint: "lg",
            isVisible: isVisible(2560, 2560),
            onClick: (e) => {
                e.stopPropagation();
            },
        },
        {
            label: "Cancel Reservations",
            icon: <MdOutlineCancel size={18}/>,
            // minBreakpoint: "lg",
            // maxBreakpoint: "lg",
            isVisible: isVisible(2560, 2560),
            onClick: (e) => {
                e.stopPropagation();
                setCancelConfirmationOpen(true);
            },
        }
    ];

    const visibleItems = ACTION_ITEMS.filter((item) => item.isVisible);
    const hiddenItems = ACTION_ITEMS.filter((item) => !item.isVisible);

    // const currentBreakpoint = useBreakpointValue({
    //     base: "base",
    //     sm: "sm",
    //     md: "md",
    //     lg: "lg",
    //     xl: "xl",
    //     "2xl": "2xl",
    // }) || "base";
    //
    // function isVisibleInCurrentBreakpointWithRanges(item, currentBp) {
    //     const order = ["base", "sm", "md", "lg", "xl", "2xl"];
    //     const currentIndex = order.indexOf(currentBp);
    //
    //     return item.ranges.some(range => {
    //         const minIndex = range.minBreakpoint
    //             ? order.indexOf(range.minBreakpoint)
    //             : 0;
    //         const maxIndex = range.maxBreakpoint
    //             ? order.indexOf(range.maxBreakpoint)
    //             : order.length - 1;
    //
    //         return currentIndex >= minIndex && currentIndex <= maxIndex;
    //     });
    // }
    //
    // const visibleItems = ACTION_ITEMS.filter((item) =>
    //     isVisibleInCurrentBreakpointWithRanges(item, currentBreakpoint)
    // );
    //
    // const hiddenItems = ACTION_ITEMS.filter((item) => !visibleItems.includes(item));

    const displayGuideText = () => {
        if (loading) return "Loading guides...";
        if (!localGuides || localGuides.length === 0) return "No Guide assigned";
        return localGuides.map((guide) => guide.name).join(", ");
    };

    const handleSaveGuides = async (guides) => {
        const guideIds = guides.map((guide) => guide.id);
        setReservationGuides(reservation.id, guides);
        setLocalGuides(guides);

        try {
            await assignGuides(reservation.id, guideIds);
            toast({
                title: "Guides Updated",
                description: guideIds.length > 0
                    ? "Guides successfully assigned to reservation"
                    : "All guides removed from reservation",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch {
            const previousGuides = reservationGuides[reservation.id] || [];
            setReservationGuides(reservation.id, previousGuides);
            setLocalGuides(previousGuides);
            toast({
                title: "Error",
                description: "Failed to update guides",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <VStack>
            {onBack && (
                <Button 
                    leftIcon={<ArrowBackIcon />} 
                    alignSelf="flex-start" 
                    variant="ghost" 
                    onClick={onBack}
                    mb={4}
                    display={{ base: "flex", md: "none" }}
                >
                    Back to list
                </Button>
            )}
            <Box
                position="relative"
                width={{base: "100%", sm:   "40%",md:  "100%",lg:  "165%",xl:  "170%",}}
                maxWidth={{base: "none", md: "none", xl: "none"}}
                borderRadius="lg"
                overflow="hidden"
                marginTop={{base: "0", md: "-5px"}}
                marginX={{base: "0", md: "auto"}}
                px={{ base: 0, md: 4 }}
            >
                <Box
                    position="relative"
                    height="200px"
                    overflow="hidden"
                    mx={{ base: "-16px", md: 0 }}
                    width={{ base: "calc(100% + 32px)", md: "100%" }}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="md"
                >
                    <Image
                        src={reservation.tour.imageUrl || "https://via.placeholder.com/1000x300"}
                        alt={reservation.tour.name}
                        width="100%"
                        // filter="blur(4px) brightness(0.8)"
                        height="100%"
                        objectFit="cover"
                        objectPosition="center"
                        bg="gray.300"
                    />
                </Box>
            </Box>
            
            <Box
                width={{base: "100%", md: "95%", xl: "120%", "2xl": "175%"}}
                maxWidth={{base: "none", md: "none", xl: "none"}}
                marginX={{base: "0", md: "auto"}}
                px={{ base: 0, md: 4 }}
            >
                <HStack 
                    spacing={1}
                    wrap="wrap" 
                    justifyContent="flex-start"
                    overflow="visible"
                    width="100%"
                    px={{ base: 4, md: 0 }}
                >
                    {visibleItems.map((item, idx) => (
                        <HStack key={idx} my={1} mr={2}>
                            {item.icon}
                            <Link style={{whiteSpace: "nowrap"}} onClick={item.onClick}>
                                {item.label}
                            </Link>
                        </HStack>
                    ))}
                    {hiddenItems.length > 0 && (
                        <Menu placement="bottom-end">
                            <MenuButton
                                as={IconButton}
                                icon={<BsThreeDots/>}
                                variant="outline"
                                aria-label="Options"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                my={1}
                            />
                            <MenuList p={0} borderRadius="md" boxShadow="lg">
                                {hiddenItems.map((item, idx) => (
                                    <MenuItem
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            item.onClick?.(e);
                                        }}
                                    >
                                        <HStack spacing={2}>
                                            {item.icon}
                                            <Text>{item.label}</Text>
                                        </HStack>
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
                    )}
                </HStack>
            </Box>
            
            <Box
                width={{base: "100%", md: "95%", xl: "120%", "2xl": "175%"}}
                maxWidth={{base: "none", md: "none", xl: "none"}}
                marginX={{base: "0", md: "auto"}}
                px={{ base: 0, md: 4 }}
                p={0}
                marginTop={0}
            >
                <Box 
                    p={{base: 4, md: 6}}
                    marginTop={0}
                    textAlign="left"
                    width="100%"
                    overflow="hidden"
                >
                    <Box
                        mt={{base: "0", md: "0"}}
                        textAlign="left"
                        width="100%"
                    >
                        <Text fontSize="xl" fontWeight="bold">
                            {reservation.tour.name}
                        </Text>

                        <HStack justifyContent="flex-start">
                            <HStack>
                                <CiCalendar size={18}/>
                                <Text>{formatDate(datePart)}</Text>
                            </HStack>
                            <HStack>
                                <CiClock2/>
                                <Text>{timePart}</Text>
                            </HStack>
                        </HStack>

                        <Box mt={6} width="100%">
                            <Text fontSize="2xl" fontWeight="bold">
                                Reservation Confirmation
                            </Text>
                            <StatusBadge status={reservation.status}/>

                            <Box mt={6}>
                                <Text fontWeight="bold">Contact Information</Text>
                                <VStack align="start" spacing={1}>
                                    <HStack>
                                        <RxPerson/>
                                        <Text>{reservation.user.name}</Text>
                                    </HStack>
                                    <HStack>
                                        <HiOutlineMail/>
                                        <Text>{reservation.user.email}</Text>
                                    </HStack>
                                    <HStack>
                                        <BsTelephone/>
                                        <Text>{reservation.user.phone}</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                            {/*
                            //TODO uncomment to finalize waivers
                            */}
                            {/*<Box mt={4}>*/}
                            {/*    <Text fontWeight="bold">Waivers</Text>*/}
                            {/*    <HStack mt={2}>*/}
                            {/*        <WaiverCountBadge*/}
                            {/*            reservationId={reservation.id}*/}
                            {/*            signedCount={reservation.waiverCount || 0}*/}
                            {/*            totalGuests={reservation.guestQuantity || 0}*/}
                            {/*        />*/}
                            {/*        <LinkWaiverButton*/}
                            {/*            reservationId={reservation.id}*/}
                            {/*            totalGuests={reservation.guestQuantity || 0}*/}
                            {/*            size="sm"*/}
                            {/*            width="120px"*/}
                            {/*            isCompact={true}*/}
                            {/*        />*/}
                            {/*    </HStack>*/}
                            {/*</Box>*/}

                            <HStack spacing={8} mt={4} justifyContent="flex-start">
                                <Box mt={6}>
                                    <HStack spacing={2} justifyContent="flex-start">
                                        <AiOutlineCompass/>
                                        <Text fontSize="xl" fontWeight="bold">Guide</Text>
                                    </HStack>
                                    <Text fontSize="sm" color="black.500">
                                        {displayGuideText()}
                                    </Text>

                                    <Button
                                        variant="link"
                                        size="xs"
                                        onClick={() => setGuideModalOpen(true)}
                                        color="black"
                                        fontWeight={"bold"}
                                    >
                                        <CiSquarePlus size={"17px"}/>
                                        Manage Guides
                                    </Button>
                                </Box>
                                <Box mt={6}>
                                    <HStack spacing={2} justifyContent="flex-start">
                                        <TbClipboardText/>
                                        <Text fontSize="xl" fontWeight="bold">Questionnaire</Text>
                                    </HStack>
                                    <Text fontSize="sm" color="black.500">
                                        Click to manage responses
                                    </Text>

                                    <Button
                                        variant="link"
                                        size="xs"
                                        onClick={() => setQuestionnaireModalOpen(true)}
                                        color="black"
                                        fontWeight={"bold"}
                                    >
                                        <CiSquarePlus size={"17px"}/>
                                        Manage Questionnaire
                                    </Button>
                                </Box>
                            </HStack>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <ChangeGuestQuantityModal
                booking={reservation}
                isOpen={isChangeGuestQuantityModalOpen}
                onClose={() => setChangeGuestQuantityModalOpen(false)}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
            />

            <ChangeArrivalModal
                booking={{
                    ...reservation,
                    id: reservation?.id,
                    tourId: reservation?.tourId || reservation?.tour?.id,
                    reservation_date: reservation?.reservation_date,
                    time: reservation?.reservation_date ? 
                        new Date(reservation.reservation_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                    dateFormatted: reservation?.reservation_date ? 
                        new Date(reservation.reservation_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }) : '',
                    paymentMethodId: reservation?.PaymentTransaction?.[0]?.paymentMethodId || reservation?.paymentMethodId,
                    valuePerGuest: reservation?.valuePerGuest,
                    guestQuantity: reservation?.guestQuantity,
                    total_price: reservation?.total_price,
                }}
                isOpen={isChangeArrivalonOpen}
                onClose={() => setChangeArrivalOpen(false)}
            />

            <SendMessageModal
                isOpen={isSendMessageModalOpen}
                onClose={() => setSendMessageModalOpen(false)}
                eventDetails={{
                    title: reservation.tour.name,
                    dateTime: reservation.reservation_date,
                    image: reservation.tour.imageUrl,
                    name: reservation.user.name,
                    email: reservation.user.email,
                    phone: reservation.user.phone,
                }}
            />

            <ChangeAddOns
                booking={reservation}
                isOpen={isChangeAddonsModalOpen}
                onClose={() => setChangeAddonsModalOpen(false)}
            />

            <CancelConfirmationModal
                booking={formatBookingData()}
                isOpen={isCancelConfirmationOpen}
                onClose={() => setCancelConfirmationOpen(false)}
                onConfirm={handleConfirmCancel}
            />

            <BookingCancellationModal
                booking={formatBookingData()}
                isOpen={isBookingCancellationOpen}
                onClose={() => setBookingCancellationOpen(false)}
                onStatusChange={() => {
                }}
            />

            <RefundModal
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                onOptionSelect={handleRefundOptionSelect}
            />

            <ReturnPaymentModal
                isOpen={isReturnPaymentModalOpen}
                onClose={() => setIsReturnPaymentModalOpen(false)}
                booking={{
                    id: reservation?.id,
                    title: reservation?.tour?.name,
                    imageUrl: reservation?.tour?.imageUrl,
                    dateFormatted: new Date(reservation?.reservation_date || new Date()).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    time: reservation?.reservation_date ?
                        new Date(reservation.reservation_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                    user: reservation?.user,
                    total_price: reservation?.total_price,
                    paymentIntentId: reservation?.PaymentTransaction?.[0]?.paymentIntentId ||
                        reservation?.PaymentTransaction?.[0]?.stripe_payment_id ||
                        reservation?.paymentIntentId,
                    paymentMethodId: reservation?.PaymentTransaction?.[0]?.paymentMethodId ||
                        reservation?.paymentMethodId,
                    setupIntentId: reservation?.setupIntentId
                }}
            />

            <ManageGuidesModal
                isOpen={isGuideModalOpen}
                onClose={() => setGuideModalOpen(false)}
                onSelectGuide={(selected) => {
                    setSelectedGuide(selected);
                    setGuideModalOpen(false);
                    handleSaveGuides(selected);
                }}
                reservationId={reservation?.id || ''}
            />

            <ManageQuestionnairesModal
                isOpen={isQuestionnaireModalOpen}
                onClose={() => setQuestionnaireModalOpen(false)}
                tourId={reservation?.tourId || reservation?.tour?.id}
                reservationId={reservation?.id || ''}
            />
        </VStack>
    );
};

const PaymentSummary = ({reservation, isPurchasePage = true}) => {
    const [cardDetails, setCardDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reservationAddons, setReservationAddons] = useState([]);
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(true);
    const isGroupBooking = reservation?.groupId;
    const [, setGroupReservations] = useState([]);
    const [, setIsLoadingGroup] = useState(false);
    const [isChangeGuestQuantityModalOpen, setChangeGuestQuantityModalOpen] = useState(false);
    const [guestCount, setGuestCount] = useState(reservation?.guestQuantity || 0);
    const [isCustomLineItemsModalOpen, setIsCustomLineItemsModalOpen] = useState(false);
    const [customLineItems, setCustomLineItems] = useState<LineItem[]>([]);
    const toast = useToast();
    const [isApplyCodeModalOpen, setIsApplyCodeModalOpen] = useState(false);
    const [tierPricing, setTierPricing] = useState(null);
    const [isLoadingTierPricing, setIsLoadingTierPricing] = useState(false);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [isLoadingPendingBalance, setIsLoadingPendingBalance] = useState(true);
    const [isRefundTransaction, setIsRefundTransaction] = useState(false);
    const [guestAdjustments, setGuestAdjustments] = useState([]);
    const [voucherTransactions, setVoucherTransactions] = useState([]);
    const [isLoadingAdjustments, setIsLoadingAdjustments] = useState(true);
    const {
        isOpen: isCollectBalanceOpen,
        onOpen: onCollectBalanceOpen,
        onClose: onCollectBalanceClose
    } = useDisclosure();
    const [bookingChanges, setBookingChanges] = useState(null);
    const [isReturnPaymentModalOpen, setIsReturnPaymentModalOpen] = useState(false);
    const [completedTransactions, setCompletedTransactions] = useState([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

    useEffect(() => {
        const fetchTierPricing = async () => {
            if (!reservation?.tour?.id) return;

            setIsLoadingTierPricing(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${reservation.tour.id}`,
                    {
                        withCredentials: true,
                    }
                );

                if (response.data && response.data.length > 0) {
                    setTierPricing(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching tier pricing data:', error);
            } finally {
                setIsLoadingTierPricing(false);
            }
        };

        if (reservation?.tour?.id) {
            fetchTierPricing();
        }
    }, [reservation?.tour?.id]);

    useEffect(() => {
        const fetchGroupReservations = async () => {
            if (!isGroupBooking) return;

            setIsLoadingGroup(true);
            try {
                const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/reservations/byGroupId/${reservation.groupId}`,
                        {
                            withCredentials: true,
                        }
                    )
                ;
                setGroupReservations(response.data);
            } catch (error) {
                console.error('Error fetching group reservations:', error);
            } finally {
                setIsLoadingGroup(false);
            }
        };

        if (isGroupBooking) {
            fetchGroupReservations();
        }
    }, [isGroupBooking, reservation?.groupId]);

    useEffect(() => {
        const fetchCompletedTransactions = async () => {
            if (!reservation?.id) return;

            setIsLoadingTransactions(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${reservation.id}`,
                    {
                        withCredentials: true,
                        params: {payment_status: 'completed'}
                    }
                );

                if (response.data && response.data.length > 0) {
                    const filteredTransactions = response.data.filter(transaction =>
                        transaction.payment_status === 'completed' &&
                        (transaction.transaction_direction === 'charge' ||
                            transaction.transaction_direction === 'refund')
                    );

                    const transactionsWithCardDetails = await Promise.all(
                        filteredTransactions.map(async (transaction) => {
                            if (
                                transaction.payment_method?.toLowerCase().includes('card') &&
                                transaction.paymentMethodId
                            ) {
                                try {
                                    const cardResponse = await axios.get(
                                        `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${transaction.paymentMethodId}`,
                                        {
                                            withCredentials: true,
                                        }
                                    );
                                    if (cardResponse.data?.last4) {
                                        return {
                                            ...transaction,
                                            cardLast4: cardResponse.data.last4
                                        };
                                    }
                                } catch (error) {
                                    console.error("Error fetching card details for transaction:", error);
                                }
                            }
                            return transaction;
                        })
                    );
                    setCompletedTransactions(transactionsWithCardDetails);
                }
            } catch (error) {
                console.error('Error fetching completed transactions:', error);
            } finally {
                setIsLoadingTransactions(false);
            }
        };

        if (reservation?.id) {
            fetchCompletedTransactions();
        }
    }, [reservation?.id]);

    useEffect(() => {
        const fetchAdjustments = async () => {
            if (!reservation?.id) return;
            
            setIsLoadingAdjustments(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${reservation.id}`,
                    {
                        withCredentials: true,
                    }
                );
                
                if (response.data && response.data.length > 0) {
                    const guestAdjustmentTransactions = response.data.filter(transaction =>
                        (transaction.transaction_type === 'GUEST_QUANTITY_CHANGE' ||
                            transaction.transaction_type === 'GUEST_QUANTITY_REFUND')
                    );

                    const processedAdjustments = guestAdjustmentTransactions.map(transaction => {
                        let metadata = transaction.metadata;
                        if (typeof metadata === 'string') {
                            try {
                                metadata = JSON.parse(metadata);
                            } catch (error) {
                                console.error("Error parsing metadata:", error);
                                metadata = {};
                            }
                        }
                        
                        return {
                            id: transaction.id,
                            amount: transaction.amount,
                            date: transaction.created_at || transaction.updated_at,
                            isRefund: transaction.transaction_direction === 'refund',
                            originalGuestQuantity: metadata?.originalGuestQuantity,
                            newGuestQuantity: metadata?.newGuestQuantity,
                            status: transaction.payment_status,
                            createdAt: new Date(transaction.created_at || new Date())
                        };
                    });

                    const sortedAdjustments = processedAdjustments.sort((a, b) => {
                        const dateA = a.createdAt.getTime();
                        const dateB = b.createdAt.getTime();
                        if (dateA === dateB) {
                            return String(a.id).localeCompare(String(b.id));
                        }
                        return dateA - dateB;
                    });
                    setGuestAdjustments(sortedAdjustments);
                    const vouchers = response.data.filter(transaction => {
                        let metadata = transaction.metadata;
                        if (typeof metadata === 'string') {
                            try {
                                metadata = JSON.parse(metadata);
                            } catch (error) {
                                return false;
                            }
                        }

                        return metadata &&
                            typeof metadata === 'object' &&
                            'voucherCode' in metadata;
                    });

                    const processedVouchers = vouchers.map(transaction => {
                        let metadata = transaction.metadata;
                        if (typeof metadata === 'string') {
                            try {
                                metadata = JSON.parse(metadata);
                            } catch (error) {
                                metadata = {};
                            }
                        }
                        
                        return {
                            id: transaction.id,
                            amount: transaction.amount,
                            date: transaction.created_at || transaction.updated_at,
                            voucherCode: metadata.voucherCode,
                            isRefund: transaction.transaction_direction === 'refund',
                            status: transaction.payment_status,
                            createdAt: new Date(transaction.created_at || new Date())
                        };
                    });
                    const sortedVouchers = processedVouchers.sort((a, b) => {
                        const dateA = a.createdAt.getTime();
                        const dateB = b.createdAt.getTime();
                        if (dateA === dateB) {
                            return String(a.id).localeCompare(String(b.id));
                        }
                        return dateA - dateB;
                    });
                    
                    setVoucherTransactions(sortedVouchers);
                }
            } catch (error) {
                console.error('Error fetching adjustment transactions:', error);
            } finally {
                setIsLoadingAdjustments(false);
            }
        };
        
        fetchAdjustments();
    }, [reservation?.id]);

    useEffect(() => {
        if (reservation) {
            setGuestCount(reservation.guestQuantity || 0);
        }
    }, [reservation]);
    useEffect(() => {
        const fetchAddons = async () => {
            if (!reservation?.id || !reservation?.tourId || !reservation?.tour?.id) return;

            try {
                const reservationAddonsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${reservation.id}`,
                    {
                        withCredentials: true,
                    }
                );

                const allAddonsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${reservation.tour.id}`,
                    {
                        withCredentials: true,
                    }
                );

                setReservationAddons(reservationAddonsResponse.data);
                setAllAddons(allAddonsResponse.data);
            } catch (error) {
                console.error('Error fetching add-ons:', error);
            } finally {
                setIsLoadingAddons(false);
            }
        };

        fetchAddons();
    }, [reservation?.tour?.id, reservation?.id, reservation?.tourId]);

    const combinedAddons = reservation?.reservationAddons?.map((selectedAddon) => {
        const addonDetails = allAddons.find(
            (addon) => addon.id === selectedAddon.addonId
        );
        return {
            ...addonDetails,
            quantity: selectedAddon.value,
        };
    }) || [];

    useEffect(() => {
        const fetchCustomLineItems = async () => {
            if (!reservation?.id) return;

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/custom-items/reservation/${reservation.id}`,
                    {
                        withCredentials: true,
                    }
                );

                const customItems = response.data.map(item => ({
                    id: item.id,
                    name: item.label,
                    type: item.description as 'Charge' | 'Discount',
                    amount: Number(item.amount),
                    quantity: Number(item.quantity)
                }));

                setCustomLineItems(customItems);
            } catch (error) {
                console.error('Error fetching custom line items:', error);
            }
        };

        fetchCustomLineItems();
    }, [reservation?.id]);

    const handleSaveCustomLineItems = async (items: LineItem[]) => {
        if (!reservation?.id || !reservation?.tenantId || !reservation?.tourId) {
            toast({
                title: "Error",
                description: "Reservation details incomplete",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setCustomLineItems(items);

        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/custom-items/reservation/${reservation.id}`,
                {
                    withCredentials: true,
                }
            );
            if (items.length > 0) {
                const customItemsPayload = items.map(item => ({
                    tenantId: reservation.tenantId,
                    tourId: reservation.tourId,
                    label: item.name || 'Unnamed Item',
                    description: item.type || 'Charge',
                    amount: item.amount || 0,
                    quantity: item.quantity || 1,
                }));

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/custom-items`,
                    {items: customItemsPayload, reservationId: reservation.id},{
                        withCredentials: true,
                    }
                );
            }
            toast({
                title: "Custom line items updated",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            window.location.reload();
        } catch (error) {
            console.error("Error saving custom line items:", error);
            toast({
                title: "Error",
                description: "Failed to update custom line items",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const calculateTourPrice = () => {
        const guestQty = reservation?.guestQuantity || 0;

        if (tierPricing) {
            if (tierPricing.pricingType === 'tiered' && tierPricing.tierEntries?.length > 0) {
                const sortedTiers = [...tierPricing.tierEntries].sort((a, b) => b.quantity - a.quantity);
                const applicableTier = sortedTiers.find(tier => guestQty >= tier.quantity);

                if (applicableTier) {
                    return applicableTier.price * guestQty;
                }
                return tierPricing.basePrice * guestQty;
            } else {
                return tierPricing.basePrice * guestQty;
            }
        }

        return (reservation?.valuePerGuest || reservation?.tour?.price || 0) * guestQty;
    };

    const tourPrice = calculateTourPrice();

    const addonsTotalPrice = combinedAddons && combinedAddons.length > 0
        ? combinedAddons.reduce(
            (sum, addon) => sum + ((addon?.price || 0) * (addon?.quantity || 0)),
            0
        )
        : 0;

    const customLineItemsTotal = customLineItems && customLineItems.length > 0
        ? customLineItems.reduce((sum, item) => {
            if (!item) return sum;
            const itemTotal = (item.amount || 0) * (item.quantity || 0);
            return item.type === "Discount" ? sum - itemTotal : sum + itemTotal;
        }, 0)
        : 0;

    const finalTotalPrice = parseFloat((tourPrice + addonsTotalPrice + customLineItemsTotal).toFixed(2));

    useEffect(() => {
        const fetchCardDetails = async () => {
            if (!reservation?.paymentMethodId) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${reservation.paymentMethodId}`,
                    {
                        withCredentials: true,
                    }
                );
                setCardDetails(response.data);
            } catch (error) {
                console.error("Failed to fetch card details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCardDetails();
    }, [reservation?.paymentMethodId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    };

    const handleApplyCode = (code) => {
        console.log('Applying code:', code);
    };

    useEffect(() => {
        const fetchPendingTransactions = async () => {
            if (!reservation?.id) return;

            setIsLoadingPendingBalance(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${reservation.id}`,
                    {
                        withCredentials: true,
                        params: {
                            payment_status: 'pending'
                        }
                    }
                );

                if (response.data && response.data.length > 0) {
                    const filteredTransactions = response.data.filter(
                        transaction => transaction.transaction_type !== 'CREATE'
                    );
                    
                    let totalPending = 0;
                    let isRefund = false;
                    
                    filteredTransactions.forEach(transaction => {
                        if (transaction.transaction_direction === 'refund') {
                            isRefund = true;
                            totalPending -= transaction.amount;
                        } else {
                            totalPending += transaction.amount;
                        }
                    });
                    if (totalPending < 0) {
                        isRefund = true;
                        totalPending = Math.abs(totalPending);
                    }

                    setPendingBalance(totalPending);
                    setIsRefundTransaction(isRefund);

                    if (totalPending > 0) {
                        setBookingChanges({
                            originalGuestQuantity: reservation.guestQuantity,
                            newGuestQuantity: reservation.guestQuantity,
                            originalPrice: isRefund ? reservation.total_price + totalPending : reservation.total_price - totalPending,
                            newPrice: reservation.total_price,
                            priceDifference: totalPending,
                            isRefund: isRefund
                        });
                    }
                } else {
                    setPendingBalance(0);
                    setIsRefundTransaction(false);
                }
            } catch (error) {
                console.error('Error fetching pending transactions:', error);
                setPendingBalance(0);
                setIsRefundTransaction(false);
            } finally {
                setIsLoadingPendingBalance(false);
            }
        };

        fetchPendingTransactions();
    }, [reservation?.id, reservation?.guestQuantity, reservation?.total_price]);

    const paidTotal = parseFloat(reservation?.total_price || '0') - pendingBalance;
    const totalBalanceDue = pendingBalance;

    if (isLoading || isLoadingTransactions) {
        if (!reservation) {
            return null;
        }
        return (
            <Center h="350px">
                <Spinner size="xl" color="blue.500"/>
            </Center>
        );
    }

    if (!reservation || !reservation.tour) {
        return (
            <Box p={5} textAlign="center">
                <Text>No reservation details available</Text>
            </Box>
        );
    }

    function formatDateToAmerican(date) {
        if (!date) return '';
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year}`;
    }

    const getPricePerGuest = (tierPricingData, guestCount) => {
        if (!tierPricingData || !tierPricingData.tierEntries || tierPricingData.tierEntries.length === 0) {
            return tierPricingData?.basePrice || 0;
        }
        const sortedTiers = [...tierPricingData.tierEntries].sort((a, b) => b.quantity - a.quantity);
        const applicableTier = sortedTiers.find(tier => guestCount >= tier.quantity);

        if (applicableTier) {
            return applicableTier.price;
        }
        return tierPricingData.basePrice;
    };

    const getPaymentMethodIcon = (method) => {
        const methodLower = method ? method.toLowerCase() : '';
        if (methodLower.includes('card') || methodLower.includes('credit')) {
            return <FaRegCreditCard/>;
        } else if (methodLower.includes('cash')) {
            return <BsCash/>;
        } else if (methodLower.includes('check')) {
            return <BiCheck/>;
        } else {
            return <FiSend/>;
        }
    };

    const formatPaymentDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'});
    };

    return (
        <Box
            bg="gray.100"
            borderRadius="md"
            boxShadow="sm"
            padding={{base: "10px", md: "20px"}}
            width="100%"
            overflow="hidden"
        >
            <Text fontSize="xl" fontWeight="bold">Purchase Summary</Text>
            <VStack spacing={4} align="stretch" mt={4}>
                <HStack justifyContent="space-between">
                    {isLoadingTierPricing ? (
                        <Spinner size="sm"/>
                    ) : (
                        <>
                            <Text>
                                Guests ({tierPricing?.pricingType === 'tiered'
                                ? `$${getPricePerGuest(tierPricing, reservation?.guestQuantity || 0)}`
                                : `$${tierPricing?.basePrice || reservation?.valuePerGuest || 0}`} x {reservation?.guestQuantity || 0})
                            </Text>
                            <Text>${tourPrice.toFixed(2)}</Text>
                        </>
                    )}
                </HStack>
                {isLoadingAddons ? (
                    <HStack justifyContent="center">
                        <Spinner size="sm"/>
                        <Text>Loading Add-ons...</Text>
                    </HStack>
                ) : (
                    combinedAddons && combinedAddons.map((addon) => (
                        addon && <HStack key={addon.id} justifyContent="space-between">
                            <Text>{addon.label || 'Unnamed Add-on'} (${addon.price || 0} x {addon.quantity || 0})</Text>
                            <Text>${((addon.price || 0) * (addon.quantity || 0)).toFixed(2)}</Text>
                        </HStack>
                    ))
                )}
                {customLineItems && customLineItems.map((item) => (
                    item && <HStack key={item.id} justifyContent="space-between">
                        <Text>
                            {item.name || 'Unnamed'} (${item.amount || 0} x {item.quantity || 0})
                            {item.type === "Discount" && " - Discount"}
                        </Text>
                        <Text>
                            {item.type === "Discount" ? "-" : ""}
                            ${((item.amount || 0) * (item.quantity || 0)).toFixed(2)}
                        </Text>
                    </HStack>
                ))}

                {/*{isLoadingAdjustments ? (*/}
                {/*    <HStack justifyContent="center">*/}
                {/*        <Spinner size="sm"/>*/}
                {/*        <Text>Loading Adjustments...</Text>*/}
                {/*    </HStack>*/}
                {/*) : (*/}
                {/*    guestAdjustments && guestAdjustments.map((adjustment) => (*/}
                {/*        <HStack key={adjustment.id} justifyContent="space-between">*/}
                {/*            <Text>*/}
                {/*                Guest Adjustment ({adjustment.originalGuestQuantity} → {adjustment.newGuestQuantity})*/}
                {/*                {adjustment.status === 'pending'}*/}
                {/*                {adjustment.status === 'archived'}*/}
                {/*            </Text>*/}
                {/*            <Text color={adjustment.isRefund ? "red.500" : "green.500"}>*/}
                {/*                {adjustment.isRefund ? "-" : "+"}${adjustment.amount.toFixed(2)}*/}
                {/*            </Text>*/}
                {/*        </HStack>*/}
                {/*    ))*/}
                {/*)}*/}

                {!isLoadingAdjustments && voucherTransactions && voucherTransactions.map((voucher) => (
                    <HStack key={voucher.id} justifyContent="space-between">
                        <Text>
                            Voucher (Code: {voucher.voucherCode})
                            {voucher.status === 'pending' && " (Pending)"}
                            {voucher.status === 'archived' && " (Archived)"}
                        </Text>
                        <Text color="red.500">
                            -${voucher.amount.toFixed(2)}
                        </Text>
                    </HStack>
                ))}
                
                <Divider/>
                <HStack justifyContent="space-between">
                    <Text fontWeight="bold">Total</Text>
                    <Text fontWeight="bold">${finalTotalPrice.toFixed(2)}</Text>
                </HStack>
                <Menu>
                    <Box mt={4}>
                        <Button
                            size="sm"
                            variant="outline"
                            height="28px"
                            fontSize="sm"
                            fontWeight="normal"
                            borderRadius="md"
                            background="white"
                        >
                            <MenuButton>
                                Modify
                            </MenuButton>
                        </Button>
                    </Box>


                    <MenuList zIndex={1000}>
                        <MenuItem
                            icon={<IoPersonOutline size={18}/>}
                            onClick={() => setChangeGuestQuantityModalOpen(true)}
                        >
                            Guests
                        </MenuItem>
                        <MenuItem
                            icon={<BsBox2 size={15}/>}
                            onClick={() => setIsCustomLineItemsModalOpen(true)}
                        >
                            Custom Line Items
                        </MenuItem>
                    </MenuList>
                </Menu>
            </VStack>

            <Box mt={8}>
                <Text fontSize="xl" fontWeight="bold">Payment Summary</Text>
                
                {completedTransactions && completedTransactions.length > 0 ? (
                    <>
                        {completedTransactions.map((transaction, index) => (
                            <HStack key={index} justifyContent="space-between" mt={2}>
                                <HStack>
                                    {getPaymentMethodIcon(transaction.payment_method)}
                                    <Text fontSize="sm">
                                        {transaction.transaction_direction === 'refund' ? 'Refund' : 'Payment'} {transaction.payment_method && transaction.payment_method.toLowerCase().includes('card') ?
                                        <>
                                            <Box
                                                as="span"
                                                bg="white"
                                                px={1}
                                                py={1}
                                                borderRadius="md"
                                                boxShadow="sm"
                                            >
                                                *{transaction.cardLast4 || 'Card'}
                                            </Box>{" "}
                                        </> :
                                        transaction.payment_method
                                    } {formatPaymentDate(transaction.updated_at || transaction.created_at)}
                                    </Text>
                                </HStack>
                                <Text fontWeight="bold"
                                      color={transaction.transaction_direction === 'refund' ? 'red.500' : 'inherit'}>
                                    {transaction.transaction_direction === 'refund' ? '-' : ''}${transaction.amount.toFixed(2)}
                                </Text>
                            </HStack>
                        ))}
                        <HStack justifyContent="space-between" mt={2}>
                            <Text>Paid</Text>
                            <Text fontWeight="bold">${paidTotal.toFixed(2)}</Text>
                        </HStack>
                    </>
                ) : (
                    <HStack justifyContent="space-between" mt={4}>
                        <Text color="gray.600">No payment method information available</Text>
                    </HStack>
                )}

                <Box mt={4}>
                    <Button
                        size="sm"
                        variant="outline"
                        height="28px"
                        fontSize="sm"
                        fontWeight="normal"
                        borderRadius="md"
                        background="white"
                        onClick={() => setIsApplyCodeModalOpen(true)}
                    >
                        <Text fontWeight="medium">
                            Apply Code
                        </Text>
                    </Button>
                </Box>

                {isPurchasePage && !isLoadingPendingBalance && totalBalanceDue > 0 && !isRefundTransaction && (
                    <Box mt={4}>
                        <HStack justifyContent="space-between">
                            <Text fontWeight="bold" color="red.500" fontSize="xl">Balance Due</Text>
                            <Text fontWeight="bold" color="red.500"
                                  fontSize="xl">${totalBalanceDue.toFixed(2)}</Text>
                        </HStack>

                        <Flex justifyContent="flex-end" mt={2}>
                            <Box height="36px" width="auto" display="inline-block">
                                <Button
                                    colorScheme="green"
                                    height="100%"
                                    width="100%"
                                    px={6}
                                    fontSize="sm"
                                    onClick={onCollectBalanceOpen}
                                >
                                    Collect Balance
                                </Button>
                            </Box>
                        </Flex>
                    </Box>
                )}
                
                {isPurchasePage && !isLoadingPendingBalance && totalBalanceDue > 0 && isRefundTransaction && (
                    <Box mt={4}>
                        <HStack justifyContent="space-between">
                            <Text fontWeight="bold" color="green.500" fontSize="xl">Refund</Text>
                            <Text fontWeight="bold" color="green.500"
                                  fontSize="xl">${totalBalanceDue.toFixed(2)}</Text>
                        </HStack>

                        <Flex justifyContent="flex-end" mt={2}>
                            <Box height="36px" width="auto" display="inline-block">
                                <Button
                                    colorScheme="green"
                                    height="100%"
                                    width="100%"
                                    px={6}
                                    fontSize="sm"
                                    onClick={() => setIsReturnPaymentModalOpen(true)}
                                >
                                    Refund Excess Payment
                                </Button>
                            </Box>
                        </Flex>
                    </Box>
                )}
            </Box>

            <ChangeGuestQuantityModal
                booking={reservation}
                isOpen={isChangeGuestQuantityModalOpen}
                onClose={() => setChangeGuestQuantityModalOpen(false)}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
            />

            <CustomLineItemsModal
                isOpen={isCustomLineItemsModalOpen}
                onClose={() => setIsCustomLineItemsModalOpen(false)}
                onSave={handleSaveCustomLineItems}
                initialItems={customLineItems}
                basePrice={tierPricing?.pricingType === 'tiered'
                    ? getPricePerGuest(tierPricing, reservation?.guestQuantity || 0)
                    : (tierPricing?.basePrice || reservation?.valuePerGuest || reservation?.tour?.price || 0)}
                quantity={reservation?.guestQuantity || 1}
                reservationId={reservation?.id}
            />

            <ApplyCodeModal
                isOpen={isApplyCodeModalOpen}
                onClose={() => setIsApplyCodeModalOpen(false)}
                onApply={handleApplyCode}
                purchaseSummary={{
                    items: [
                        ...(reservationAddons?.length > 0 ? reservationAddons.map(addon => {
                            const addonDetails = allAddons.find(
                                a => a.id === addon.addonId
                            );
                            return {
                                name: addonDetails?.label || 'Add-on',
                                price: Number(addonDetails?.price || 0) * Number(addon.value || 0)
                            };
                        }) : []),
                        ...(customLineItems?.length > 0 ? customLineItems.map(item => ({
                            name: item.name,
                            price: (item.amount || 0) * (item.quantity || 0)
                        })) : []),
                        {
                            name: `Guests (${reservation.tour?.price || 0} x ${reservation.guestQuantity || 0})`,
                            price: (reservation.valuePerGuest || reservation.tour?.price || 0) * (reservation.guestQuantity || 0)
                        }
                    ],
                    total: finalTotalPrice
                }}
                paymentSummary={{
                    last4: cardDetails?.last4,
                    date: cardDetails ? formatDateToAmerican(formatDate(cardDetails.paymentDate)) : undefined,
                    amount: finalTotalPrice
                }}
            />

            {isPurchasePage && (
                <CollectBalanceModal
                    isOpen={isCollectBalanceOpen}
                    onClose={onCollectBalanceClose}
                    bookingChanges={{
                        originalGuestQuantity: reservation?.guestQuantity,
                        newGuestQuantity: reservation?.guestQuantity,
                        originalPrice: paidTotal,
                        newPrice: finalTotalPrice,
                        priceDifference: totalBalanceDue
                    }}
                    booking={reservation}
                />
            )}
            
            <ReturnPaymentModal
                isOpen={isReturnPaymentModalOpen}
                onClose={() => setIsReturnPaymentModalOpen(false)}
                booking={{
                    id: reservation?.id,
                    title: reservation?.tour?.name,
                    imageUrl: reservation?.tour?.imageUrl,
                    dateFormatted: new Date(reservation?.reservation_date || new Date()).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    time: reservation?.reservation_date ?
                        new Date(reservation.reservation_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '',
                    user: reservation?.user,
                    total_price: reservation?.total_price,
                    paymentIntentId: reservation?.PaymentTransaction?.[0]?.paymentIntentId ||
                        reservation?.PaymentTransaction?.[0]?.stripe_payment_id ||
                        reservation?.paymentIntentId,
                    paymentMethodId: reservation?.PaymentTransaction?.[0]?.paymentMethodId ||
                        reservation?.paymentMethodId,
                    setupIntentId: reservation?.setupIntentId
                }}
                refundAmount={totalBalanceDue}
            />
        </Box>
    );
};

const PurchasesPage = () => {
    const router = useRouter();
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const {tenantId} = useGuest();
    const [showDetailedSummary, setShowDetailedSummary] = useState(false);
    const [detailedSummaryData, setDetailedSummaryData] = useState({
        tours: [],
        payments: []
    });

    const [isMobileDetailView, setIsMobileDetailView] = useState(false);
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    const fetchAddonsForReservation = useCallback(async (reservationId: string, tourId?: string) => {
        try {
            const reservationAddonsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${reservationId}`,
                {
                    withCredentials: true,
                }
            );

            const allAddonsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${tourId}`,
                {
                    withCredentials: true,
                }
            );

            const reservationAddons = reservationAddonsResponse.data;
            const allAddons = allAddonsResponse.data;

            return reservationAddons.map((selectedAddon: { addonId: string; value: number }) => {
                const addonDetails = allAddons.find(
                    (addon: { id: string; price: number; label: string }) => addon.id === selectedAddon.addonId
                );
                return {
                    name: addonDetails?.label || 'Add-on',
                    price: Number(addonDetails?.price || 0),
                    quantity: Number(selectedAddon.value || 0)
                };
            });
        } catch (error) {
            console.error(`Error fetching add-ons for reservation ${reservationId}:`, error);
            return [];
        }
    }, []);

    const handleSelectReservation = useCallback(async (reservation: ReservationItem) => {
        setSelectedReservation(reservation);
        setShowDetailedSummary(!!reservation.isGroupBooking);

        if (isMobile) {
            setIsMobileDetailView(true);
        }

        if (reservation) {
            const formattedDate = new Date(reservation.createdAt || reservation.reservation_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });

            try {
                if (reservation.isGroupBooking && reservation.groupItems) {
                    const groupToursPromises = reservation.groupItems.map(async (item) => {
                        let tourPrice = 0;
                        try {
                            const tierResponse = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${item.tour?.id}`,
                                { withCredentials: true }
                            );
                            if (tierResponse.data && tierResponse.data.length > 0) {
                                const tierData = tierResponse.data[0];
                                const itemGuestCount = Number(item.guestQuantity || 0);
                                
                                if (tierData.pricingType === 'tiered' && tierData.tierEntries?.length > 0) {
                                    const sortedTiers = [...tierData.tierEntries].sort((a, b) => b.quantity - a.quantity);
                                    const applicableTier = sortedTiers.find(tier => itemGuestCount >= tier.quantity);
                                    if (applicableTier) {
                                        tourPrice = applicableTier.price;
                                    } else {
                                        tourPrice = tierData.basePrice;
                                    }
                                } else {
                                    tourPrice = tierData.basePrice;
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching tier pricing:', error);
                        }
                        if (tourPrice <= 0) {
                            tourPrice = Number(item.valuePerGuest || item.tour?.price || 0);
                        }
                        const guestCount = Number(item.guestQuantity || 0);
                        const gratuityAmount = Number(item.gratuityAmount || 0);
                        const addons = await fetchAddonsForReservation(item.id, item.tour?.id);
                        const addonsTotal = addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
                        const tourTotal = (tourPrice * guestCount) + gratuityAmount + addonsTotal;

                        return {
                            name: item.tour?.name || 'Unknown Tour',
                            bookingFeePercent: 6,
                            pricePerGuest: tourPrice,
                            guestCount: guestCount,
                            gratuityAmount: gratuityAmount,
                            gratuityPercent: Number(item.gratuityPercent || 18),
                            addons: addons,
                            total: tourTotal
                        };
                    });

                    const groupTours = await Promise.all(groupToursPromises);
                    const totalAmount = groupTours.reduce((sum, tour) => sum + (tour.total || 0), 0);

                    setDetailedSummaryData({
                        tours: groupTours,
                        payments: [{
                            date: formattedDate,
                            amount: totalAmount
                        }]
                    });
                } else {
                    let tourPrice = 0;
                    try {
                        const tierResponse = await axios.get(
                            `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${reservation.tour?.id}`,
                            { withCredentials: true }
                        );
                        
                        if (tierResponse.data && tierResponse.data.length > 0) {
                            const tierData = tierResponse.data[0];
                            const singleGuestCount = Number(reservation.guestQuantity || 0);
                            
                            if (tierData.pricingType === 'tiered' && tierData.tierEntries?.length > 0) {
                                const sortedTiers = [...tierData.tierEntries].sort((a, b) => b.quantity - a.quantity);
                                const applicableTier = sortedTiers.find(tier => singleGuestCount >= tier.quantity);
                                
                                if (applicableTier) {
                                    tourPrice = applicableTier.price;
                                } else {
                                    tourPrice = tierData.basePrice;
                                }
                            } else {
                                tourPrice = tierData.basePrice;
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching tier pricing for single reservation:', error);
                    }
                    if (tourPrice <= 0) {
                        tourPrice = Number(reservation.valuePerGuest || reservation.tour?.price || 0);
                    }
                    const guestCount = Number(reservation.guestQuantity || 0);
                    const gratuityAmount = Number(reservation.gratuityAmount || 0);
                    const addons = await fetchAddonsForReservation(reservation.id, reservation.tour?.id);
                    const addonsTotal = addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
                    const tourTotal = (tourPrice * guestCount) + gratuityAmount + addonsTotal;

                    setDetailedSummaryData({
                        tours: [{
                            name: reservation.tour?.name || 'Unknown Tour',
                            bookingFeePercent: 6,
                            pricePerGuest: tourPrice,
                            guestCount: guestCount,
                            gratuityAmount: gratuityAmount,
                            gratuityPercent: Number(reservation.gratuityPercent || 18),
                            addons: addons,
                            total: tourTotal
                        }],
                        payments: [{
                            date: formattedDate,
                            amount: Number(reservation.total_price || tourTotal)
                        }]
                    });
                }
            } catch (error) {
                console.error("Error preparing detailed summary data:", error);
            }
        }
    }, [fetchAddonsForReservation, setDetailedSummaryData, setSelectedReservation, setShowDetailedSummary, isMobile]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/with-users/byTenantId/${tenantId}`,
                    {
                        credentials: 'include',
                    }
                );
                const data = await response.json();

                if (data.length > 0 && !selectedReservation) {
                    await handleSelectReservation(data[0]);
                    setShowDetailedSummary(false);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (tenantId) {
            fetchReservations();
        }
    }, [tenantId, handleSelectReservation, selectedReservation]);

    const handlePurchaseClick = () => {
        router.push("/dashboard/choose-a-product");
    };

    const handleBackToList = () => {
        setIsMobileDetailView(false);
    };

    return (
        <Box
            width="100vw"
            height="100vh"
            overflow="hidden"
            px={{ base: 0, md: "initial" }}
        >
            <DashboardLayout>
                <Flex align="center"
                      mb={4}
                      direction={{base: "column", md: "row"}}
                      px={{base: 4, md: 0}}
                >
                    <Text 
                        fontSize="2xl" 
                        fontWeight="medium" 
                        ml={{base: 0, md: "20px"}}
                        mt={{base: 0, md: "10px"}}
                        mb={{base: 0, md: "10px"}}
                    >
                        Purchases
                    </Text>
                    <Center height="50px"
                            w={{base: "100%", md: "40px"}}
                            display={{base: "none", md: "block"}}>
                        <Divider orientation='vertical'/>
                    </Center>
                    <Flex
                        direction={{base: "column", md: "row"}}
                        align="center"
                        justify="space-between"
                        width="100%"
                    >
                        <InputGroup w={{base: "100%", md: "auto"}} flex="1" mr={2}>
                            <InputLeftElement pointerEvents="none" marginTop={"-3px"}>
                                <SearchIcon color="gray.400"/>
                            </InputLeftElement>
                            <Input
                                placeholder="Name, email, phone or ID"
                                size="sm"
                                border="none"
                                boxShadow="none"
                                focusBorderColor="transparent"
                                w={{base: "100%", md: "auto"}}
                                _placeholder={{fontSize: "lg"}}
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </InputGroup>
                        <Button
                            colorScheme="green"
                            size="md"
                            h={"40px"}
                            w={{base: "100%", md: "250px"}}
                            border={"none"}
                            borderRadius={"4px"}
                            onClick={handlePurchaseClick}
                        >
                            Make a Purchase
                        </Button>
                    </Flex>
                    <Spacer/>
                </Flex>
                <HStack height="100vh" width="100%" spacing={0}>
                    <Box 
                        display={{ 
                            base: isMobileDetailView ? "none" : "block", 
                            md: "block" 
                        }}
                        width={{ base: "100%", md: "auto" }}
                        borderRight={{ base: "none", md: "1px solid #E2E8F0" }}
                        px={{ base: 0, md: "initial" }}
                        mx={{ base: 0, md: "initial" }}
                    >
                        <PurchaseList
                            onSelectReservation={handleSelectReservation}
                            selectedReservation={selectedReservation}
                            searchTerm={searchTerm}
                            toggleDetailedSummary={() => {
                                setShowDetailedSummary(true);
                            }}
                        />
                    </Box>
                    <Box
                        marginRight={"-25px"}
                        flex="1"
                        height="100%"
                        overflowY="auto"
                        display={{ 
                            base: isMobileDetailView ? "block" : "none", 
                            md: "block" 
                        }}
                        width={{ base: "100%", md: "auto" }}
                        css={{
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: 'rgba(0, 0, 0, 0.5)',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                        }}
                    >
                        <Flex direction={{ base: "column", lg: "row" }} width="100%">
                            <Box width={{ base: "100%", lg: "60%" }} pr={{ lg: 4 }}>
                                <Box
                                    padding="20px"
                                    maxWidth={{ base: "100%" }}
                                    textAlign="left"
                                >
                                    <PurchaseDetails 
                                        reservation={selectedReservation} 
                                        onBack={handleBackToList} 
                                    />
                                </Box>
                            </Box>

                            <Box 
                                width={{ base: "100%", lg: "40%" }} 
                                padding="20px"
                                borderRadius="md"
                                mt={{ base: 4, lg: "300px" }}
                                ml={{ lg: "-60px" }}
                                display={{ base: "block", md: "block" }}
                            >
                                {showDetailedSummary ? (
                                    <PurchaseSummaryDetailed
                                        tours={detailedSummaryData.tours}
                                        payments={detailedSummaryData.payments}
                                        onApplyCode={() => console.log("Apply code clicked")}
                                    />
                                ) : (
                                    <PaymentSummary
                                        reservation={selectedReservation}
                                        isPurchasePage={true}
                                    />
                                )}
                            </Box>
                        </Flex>
                        
                        <Divider mb={4} mt={6}/>
                        <Box padding="20px">
                            <PurchaseNotes reservationId={selectedReservation?.id}/>
                        </Box>
                        <Divider mb={4}/>
                        <Box flex="1" overflowY="auto" padding="20px" paddingBottom="50px">
                            {selectedReservation ? (
                                <TimelinePage reservationId={selectedReservation.id}/>
                            ) : (
                                <Text>No reservation Available</Text>
                            )}
                        </Box>
                    </Box>
                </HStack>
            </DashboardLayout>
        </Box>
    );
};

export default withPermission(PurchasesPage, 'RESERVATION_READ');