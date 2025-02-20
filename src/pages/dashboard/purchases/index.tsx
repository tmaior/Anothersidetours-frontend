import React, {useEffect, useRef, useState} from 'react';
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

    const filteredDisplayedReservations = displayedReservations.filter((reservation) => {
        const user = reservation.user || {};
        return (
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.phone?.toLowerCase().includes(searchTerm)
        );
    });

    const handleScroll = () => {
        const container = containerRef.current;

        if (container) {
            const isAtBottom =
                container.scrollHeight - container.scrollTop === container.clientHeight;

            if (isAtBottom && !isLoading && hasMore) {
                loadMoreReservations();
            }
        }
    };

    const loadMoreReservations = () => {
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
    };

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
    }, [displayedReservations, hasMore, isLoading]);

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
                width="175%"
                maxWidth="none"
                borderRadius="lg"
                overflowY="auto"
                marginTop={"-5px"}
                marginLeft={"10px"}
            >
                <img
                    src={reservation.tour.imageUrl || "https://via.placeholder.com/1000x300"}
                    alt={reservation.tour.name}
                    style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        backgroundColor: "gray.300",
                    }}
                />

            </Box>

            <Box flex="1" p={6} marginTop={"-50px"} marginLeft={"15px"}>
                <HStack spacing={3} mt={5} wrap="nowrap">
                    <HStack>
                        <CiCalendar size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setChangeArrivalOpen(true);
                              }}
                        >
                            Arrival
                        </Link>
                    </HStack>
                    <HStack>
                        <IoPersonOutline size={18}/>
                        <Link
                            style={{whiteSpace: "nowrap"}}
                            onClick={(e) => {
                                e.stopPropagation();
                                setChangeGuestQuantityModalOpen(true);
                            }}
                        >
                            Guests
                        </Link>
                    </HStack>
                    <HStack>
                        <BsBox2 size={15}/>
                        <Link style={{whiteSpace: "nowrap"}}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setChangeAddonsModalOpen(true);
                              }}
                        >
                            Add-ons
                        </Link>
                    </HStack>
                    <HStack>
                        <RiRefund2Line size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Refund</Link>
                    </HStack>
                    <HStack>
                        <CiLocationArrow1 size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setSendMessageModalOpen(true);
                              }}
                        >
                            Message Guests
                        </Link>
                    </HStack>
                    <HStack>
                        <AiOutlineMail size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Resend Confirmation</Link>
                    </HStack>
                    <HStack>
                        <AiOutlineMail size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Resend Gratuity Notification</Link>
                    </HStack>
                    <HStack>
                        <PiPencilSimpleLineDuotone size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Resend Waiver Email</Link>
                    </HStack>
                    <HStack>
                        <MdOutlineRefresh size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Switch Experience</Link>
                    </HStack>
                    <HStack>
                        <Menu placement="left-start" offset={[-50, 0]}>
                            <MenuButton
                                as={IconButton}
                                icon={<BsThreeDots/>}
                                variant="outline"
                                aria-label="Options"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <MenuList
                                p={0}
                                borderRadius="md"
                                boxShadow="lg"
                                width="100px"
                                maxWidth="300px"
                                minHeight="100px"
                            >
                                <MenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // setSendMessageModalOpen(true);
                                    }}
                                >
                                    <HStack spacing={2}>
                                        <MdOutlineLocalPrintshop/>
                                        <Text>Print Receipt</Text>
                                    </HStack>
                                </MenuItem>
                                <MenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // setSendMessageModalOpen(true);
                                    }}
                                >
                                    <HStack spacing={2}>
                                        <AiOutlineMail/>
                                        <Text>Email Receipt</Text>
                                    </HStack>
                                </MenuItem>
                                <MenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // setSendMessageModalOpen(true);
                                    }}
                                >
                                    <HStack spacing={2}>
                                        <FiSend/>
                                        <Text>Rebook Organizer</Text>
                                    </HStack>
                                </MenuItem>
                                <MenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelConfirmationOpen(true);
                                    }}
                                >
                                    <HStack spacing={2}>
                                        <MdOutlineCancel/>
                                        <Text>Cancel Reservations</Text>
                                    </HStack>
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </HStack>
                </HStack>
                <Box mt={8} marginLeft={"20px"} marginTop={"50px"}>
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
    }, [reservation?.id, reservation?.tourId]);

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
        <Box bg="gray.100" borderRadius="md" boxShadow="sm" width="150%" marginTop={"-270px"} marginLeft={"200px"}
             padding={"20px"}>
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

    if (isLoading) {
        return (
            <Center width="100vw" height="100vh">
                <CircularProgress isIndeterminate color="blue.500"/>
            </Center>
        );
    }

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
                <Flex align="center" mb={4}>
                    <Text fontSize="2xl" fontWeight="medium" marginLeft={"-15px"}>
                        Purchases
                    </Text>
                    <Center height='50px' w={"40px"}>
                        <Divider orientation='vertical'/>
                    </Center>
                    <HStack spacing={2}>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none" marginTop={"-3px"}>
                                <SearchIcon color="gray.400"/>
                            </InputLeftElement>
                            <Input
                                marginLeft={"5px"}
                                placeholder="Name, email, phone or ID"
                                width="250px"
                                size="sm"
                                border="none"
                                boxShadow="none"
                                focusBorderColor="transparent"
                                w={"1250px"}
                                _placeholder={{fontSize: "lg"}}
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </InputGroup>
                        <Button
                            colorScheme="green"
                            size="md"
                            marginLeft={"-50px"}
                            h={"40px"}
                            w={"200px"}
                            border={"none"}
                            borderRadius={"4px"}
                            onClick={handlePurchaseClick}
                        >
                            Make a Purchase
                        </Button>
                    </HStack>
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

export default PurchasesPage;
