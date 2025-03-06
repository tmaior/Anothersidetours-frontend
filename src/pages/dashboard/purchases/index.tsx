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
    VStack
} from '@chakra-ui/react';
import {SearchIcon} from '@chakra-ui/icons';
import DashboardLayout from "../../../components/DashboardLayout";
import {CiCalendar, CiClock2, CiLocationArrow1} from "react-icons/ci";
import {IoPersonOutline} from "react-icons/io5";
import {RiRefund2Line} from "react-icons/ri";
import {AiOutlineMail} from "react-icons/ai";
import {BsBox2, BsTelephone, BsThreeDots} from "react-icons/bs";
import {PiPencilSimpleLineDuotone} from "react-icons/pi";
import {useRouter} from "next/router";
import {HiOutlineMail} from "react-icons/hi";
import {RxPerson} from "react-icons/rx";
import {useGuest} from "../../../contexts/GuestContext";
import ChangeGuestQuantityModal from "../../../components/ChangeGuestQuantityModal";
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
import withAuth from "../../../utils/withAuth";

type GuestItemProps = {
    name: string;
    date: string;
    guests: string | number;
    avatarUrl: string;
    onClick?: () => void;
    isSelected?: boolean;
};

const GuestItem: React.FC<GuestItemProps> = ({name, date, guests, avatarUrl, onClick, isSelected}) => (
    <HStack
        p={3}
        borderRadius="md"
        bg={isSelected ? 'blue.100' : 'white'}
        _hover={{bg: 'blue.50', cursor: 'pointer'}}
        justifyContent="space-between"
        width="100%"
        onClick={onClick}
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

const PurchaseList = ({onSelectReservation, selectedReservation, searchTerm}) => {
    const [reservations, setReservations] = useState([]);
    const [displayedReservations, setDisplayedReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const PAGE_LIMIT = 10;
    const {tenantId} = useGuest();

    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/with-users/byTenantId/${tenantId}`
                );
                const data = await response.json();
                setReservations(data);
                setDisplayedReservations(data.slice(0, PAGE_LIMIT));
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (tenantId) {
            fetchReservations();
        }
    }, [tenantId,]);

    const normalizePhoneNumber = (phone) => {
        return phone.replace(/[^\d]/g, '');
    };

    const filteredDisplayedReservations = displayedReservations.filter((reservation) => {
        const user = reservation.user || {};
        const normalizedSearchTerm = normalizePhoneNumber(searchTerm);
        const normalizedPhone = normalizePhoneNumber(user.phone || '');

        return (
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            normalizedPhone.includes(normalizedSearchTerm)
        );
    });

    const loadMoreReservations = useCallback(() => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);

        setTimeout(() => {
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

            setIsLoading(false);
        }, 500);
    }, [hasMore, isLoading, displayedReservations, reservations, PAGE_LIMIT]);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;

        if (container) {
            const isAtBottom =
                container.scrollHeight - container.scrollTop === container.clientHeight;

            if (isAtBottom && !isLoading && hasMore) {
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

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }
        return () => {
            container?.removeEventListener("scroll", handleScroll);
        };
    }, [displayedReservations, hasMore, isLoading, handleScroll]);

    return (
        <VStack
            marginTop={"-100px"}
            marginLeft={"-40px"}
            ref={containerRef}
            spacing={4}
            width="30%"
            borderRight="1px solid #E2E8F0"
            height="calc(100vh - 100px)"
            w={"300px"}
            p={4}
            onScroll={handleScroll}
            overflowY="auto"
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
            {filteredDisplayedReservations.map((purchase) => (
                <GuestItem
                    key={purchase.id}
                    name={purchase.user?.name || 'Unknown'}
                    avatarUrl={purchase.tour.imageUrl || 'https://via.placeholder.com/50'}
                    guests={purchase.guestQuantity || 'N/A'}
                    date={formatDate(purchase.reservation_date)}
                    isSelected={selectedReservation?.id === purchase.id}
                    onClick={() => onSelectReservation(purchase)}
                />
            ))}
            {isLoading && (
                <CircularProgress
                    isIndeterminate
                    size="50px"
                    thickness="6px"
                    color="blue.500"
                />
            )}
            {!hasMore && (
                <Text fontSize="sm" color="gray.500">
                    No more items to load
                </Text>
            )}
        </VStack>
    );
};


const PurchaseDetails = ({reservation}) => {

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

    const {
        onClose: onConfirmClose,
    } = useDisclosure();

    const {
        onOpen: onCancelOpen,
    } = useDisclosure();

    const handleConfirmCancel = () => {
        onConfirmClose();
        onCancelOpen();
    };

    const windowWidth = useWindowWidth();

    const isVisible = (minWidth, maxWidth) => {
        return windowWidth >= minWidth && windowWidth <= maxWidth;
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

    const [isChangeGuestQuantityModalOpen, setChangeGuestQuantityModalOpen] = useState(false);
    const [isChangeArrivalonOpen, setChangeArrivalOpen] = useState(false);
    const [isSendMessageModalOpen, setSendMessageModalOpen] = useState(false);
    const [isChangeAddonsModalOpen, setChangeAddonsModalOpen] = useState(false);
    const [guestCount, setGuestCount] = useState(reservation?.guestQuantity || 0);
    const [isCancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);

    if (!reservation) {
        return <Text>No reservation Available</Text>;
    }

    return (
        <VStack>
            <Box
                position="relative"
                width={{base: "30%", md: "90%", xl: "100%", "2xl": "175%"}}
                maxWidth={{base: "none", md: "none", xl: "none"}}
                borderRadius="lg"
                overflowY="auto"
                marginTop={{base: "0", md: "-5px"}}
                marginLeft={{base: "0", md: "10px"}}
            >
                <Image
                    src={reservation.tour.imageUrl || "https://via.placeholder.com/1000x300"}
                    alt={reservation.tour.name}
                    width="100%"
                    height="200px"
                    objectFit="cover"
                    bg="gray.300"
                />
            </Box>

            <Box flex="1" p={6} marginTop={"-50px"} marginLeft={"15px"}>
                <HStack spacing={3} mt={5} wrap="nowrap">
                    {visibleItems.map((item, idx) => (
                        <HStack key={idx}>
                            {item.icon}
                            <Link style={{whiteSpace: "nowrap"}} onClick={item.onClick}>
                                {item.label}
                            </Link>
                        </HStack>
                    ))}
                    {hiddenItems.length > 0 && (
                        <Menu placement="left-start" offset={[-50, 0]}>
                            <MenuButton
                                as={IconButton}
                                icon={<BsThreeDots/>}
                                variant="outline"
                                aria-label="Options"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
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
                <Box
                    mt={{base: "50px", xl: "15px", "2xl": "50px"}}
                    ml={{base: "50px", xl: "-30px", "2xl": "-10px"}}
                >
                    <Text fontSize="xl" fontWeight="bold">
                        {reservation.tour.name}
                    </Text>

                    <HStack>
                        <HStack>
                            <CiCalendar size={18}/>
                            <Text>{formatDate(datePart)}</Text>
                        </HStack>
                        <HStack>
                            <CiClock2/>
                            <Text>{timePart}</Text>
                        </HStack>
                    </HStack>

                    <Box mt={6}>
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
                booking={reservation}
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
                isOpen={isCancelConfirmationOpen}
                onClose={() => setCancelConfirmationOpen(false)}
                onConfirm={handleConfirmCancel}
                booking={{
                    title: reservation.tour.name,
                    dateFormatted: formatDate(datePart),
                    time: timePart,
                    user: reservation.user
                }}
            />
        </VStack>
    );
};

const PaymentSummary = ({reservation}) => {
    const [cardDetails, setCardDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reservationAddons, setReservationAddons] = useState([]);
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(true);

    useEffect(() => {
        const fetchAddons = async () => {
            if (!reservation?.id || !reservation?.tourId) return;

            try {
                const reservationAddonsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${reservation.id}`
                );

                const allAddonsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${reservation.tour.id}`
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

    const addonsTotalPrice = combinedAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity || 0),
        0
    );

    const finalTotalPrice = ((reservation?.total_price || 0) + addonsTotalPrice).toFixed(2);

    useEffect(() => {
        const fetchCardDetails = async () => {
            if (!reservation?.paymentMethodId) return;
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${reservation.paymentMethodId}`
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

    if (isLoading) {
        if (!reservation) {
            return null;
        }
        return (
            <Center h="350px">
                <Spinner size="xl" color="blue.500"/>
            </Center>
        );
    }

    function formatDateToAmerican(date) {
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year}`;
    }

    return (


        <Box
            bg="gray.100"
            borderRadius="md"
            boxShadow="sm"
            marginTop={{base: "0", md: "0", lg: "-270px"}}
            marginLeft={{base: "0", md: "0", lg: "200px"}}
            padding={{base: "10px", md: "20px"}}
            position="relative"
            left={{base: "0", md: "0"}}
            width={{base: "100%", xl: "100%", "2xl": "150%"}}
            maxWidth={{base: "100%", md: "90%", lg: "100%", "2xl": "130%"}}
            overflow="hidden"
        >
            <Text fontSize="xl" fontWeight="bold">Purchase Summary</Text>
            <VStack spacing={4} align="stretch" mt={4}>
                {/*<HStack justifyContent="space-between">*/}
                {/*    <Text>6% Booking Fee</Text>*/}
                {/*    <Text>$71.52</Text>*/}
                {/*</HStack>*/}
                <HStack justifyContent="space-between">
                    <Text>Guests (${reservation.tour.price} x {reservation.guestQuantity})</Text>
                    {/*<Text>${reservation.total_price}</Text>*/}
                    <Text>${((reservation.valuePerGuest || reservation.tour?.price) * reservation.guestQuantity).toFixed(2)}</Text>
                </HStack>
                {/*<HStack justifyContent="space-between">*/}
                {/*    <Text>Gratuity: 18%</Text>*/}
                {/*    <Text>$214.56</Text>*/}
                {/*</HStack>*/}
                {isLoadingAddons ? (
                    <HStack justifyContent="center">
                        <Spinner size="sm"/>
                        <Text>Loading Add-ons...</Text>
                    </HStack>
                ) : (
                    combinedAddons.map((addon) => (
                        <HStack key={addon.id} justifyContent="space-between">
                            <Text>{addon.label} (${addon.price} x {addon.quantity})</Text>
                            <Text>${(addon.price * addon.quantity).toFixed(2)}</Text>
                        </HStack>
                    ))
                )}
                <Divider/>
                <HStack justifyContent="space-between">
                    <Text fontWeight="bold">Total</Text>
                    <Text fontWeight="bold">${finalTotalPrice}</Text>
                </HStack>
                <Button size={"sm"} mt={1} w="70px">Modify</Button>
            </VStack>

            <Box mt={8}>
                <Text fontSize="xl" fontWeight="bold">Payment Summary</Text>
                <HStack justifyContent="space-between" mt={4}>
                    <Box as="span" role="img" aria-label="Card Icon" fontSize="lg">
                        💳
                    </Box>
                    <Text>
                        Payment
                        <Box
                            as="span"
                            bg="white"
                            px={1}
                            py={1}
                            borderRadius="md"
                            boxShadow="sm"
                        >
                            *{cardDetails.last4}
                        </Box>{" "}
                        {formatDateToAmerican(formatDate(cardDetails.paymentDate))}
                    </Text>
                </HStack>
                <HStack justifyContent="space-between">
                    <Text>Paid</Text>
                    <Text fontWeight="bold">${finalTotalPrice}</Text>
                </HStack>
            </Box>
        </Box>
    );
};

const PurchasesPage = () => {
    const router = useRouter();
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const {tenantId} = useGuest();

    const handleSelectReservation = (reservation) => {
        setSelectedReservation(reservation);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/with-users/byTenantId/${tenantId}`
                );
                const data = await response.json();

                if (data.length > 0 && !selectedReservation) {
                    setSelectedReservation(data[0]);
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
    }, [tenantId, selectedReservation]);

    // if (isLoading) {
    //     return (
    //         <Center width="100vw" height="100vh">
    //             <CircularProgress isIndeterminate color="blue.500"/>
    //         </Center>
    //     );
    // }

    const handlePurchaseClick = () => {
        router.push("/dashboard/choose-a-product");
    };

    return (
        <Box
            width="100vw"
            height="100vh"
            overflow="hidden"
        >
            <DashboardLayout>
                <Flex align="center"
                      mb={4}
                      direction={{base: "column", md: "row"}}
                      px={{base: 4, md: 0}}
                >
                    <Text fontSize="2xl" fontWeight="medium" ml={{base: 0, md: "-15px"}}>
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
                <HStack height="100vh" width="100%">
                    <Box>
                        <PurchaseList onSelectReservation={handleSelectReservation}
                                      selectedReservation={selectedReservation}
                                      searchTerm={searchTerm}
                        />
                    </Box>
                    <Box
                        marginRight={"-25px"}
                        flex="1"
                        height="100%"
                        overflowY="auto"
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
                        <Box
                            padding="20px"
                            marginBottom="20px"
                            maxWidth="800px"
                            mx="auto"
                        >
                            <PurchaseDetails reservation={selectedReservation}/>
                        </Box>
                        <Box
                            padding="20px"
                            maxWidth="400px"
                            mx="auto"
                        >
                            <PaymentSummary reservation={selectedReservation}/>
                        </Box>
                        <Divider mb={4}/>
                        <Box>
                            <PurchaseNotes/>
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

export default withAuth(PurchasesPage);