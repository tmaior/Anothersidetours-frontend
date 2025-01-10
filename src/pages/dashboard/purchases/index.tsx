import React, {useEffect, useRef, useState} from 'react';
import {
    Badge,
    Box,
    Button,
    Center,
    CircularProgress,
    Divider,
    Flex,
    HStack,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    Link,
    Spacer,
    Text,
    VStack
} from '@chakra-ui/react';
import {CheckCircleIcon, EmailIcon, PhoneIcon, SearchIcon} from '@chakra-ui/icons';
import DashboardLayout from "../../../components/DashboardLayout";
import {CiCalendar, CiClock2, CiLocationArrow1} from "react-icons/ci";
import {IoPersonOutline} from "react-icons/io5";
import {RiRefund2Line} from "react-icons/ri";
import {AiOutlineMail} from "react-icons/ai";
import {BsBox2} from "react-icons/bs";
import {PiPencilSimpleLineDuotone} from "react-icons/pi";

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

const PurchaseList = ({onSelectReservation, selectedReservation}) => {
    const [reservations, setReservations] = useState([]);
    const [displayedReservations, setDisplayedReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const PAGE_LIMIT = 10;

    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    "http://localhost:9000/reservations/with-users/byTenantId/3d259f0d-33ea-4aef-b430-3aed2c35aa37"
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
        fetchReservations();
    }, []);

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
                setDisplayedReservations((prev) => [...prev, ...nextReservations]);
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
            {displayedReservations.map((purchase, index) => (
                <GuestItem
                    key={index}
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
                    src={reservation.tour.imageUrl ||"https://via.placeholder.com/1000x300"}
                    alt={reservation.tour.name}
                    style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        backgroundColor: "gray.300",
                    }}
                />
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    color="white"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="start"
                    p={4}
                >
                    <Text fontSize="xl" fontWeight="bold">The Beverly Hills Segway Tour</Text>
                    <HStack>
                        <HStack>
                            <CiCalendar size={18}/>
                            <Text> January 14, 2025</Text>
                        </HStack>
                        <HStack>
                            <CiClock2/>
                            <Text> 2:00 PM</Text>
                        </HStack>
                    </HStack>
                </Box>
            </Box>

            <Box flex="1" p={6} marginTop={"-50px"} marginLeft={"-70px"}>
                <HStack spacing={6} mt={6} wrap="nowrap">
                    <HStack>
                        <CiCalendar size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Arrival</Link>
                    </HStack>
                    <HStack>
                        <IoPersonOutline size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Guests</Link>
                    </HStack>
                    <HStack>
                        <BsBox2 size={15}/>
                        <Link style={{whiteSpace: "nowrap"}}>Add-ons</Link>
                    </HStack>
                    <HStack>
                        <RiRefund2Line size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Refund</Link>
                    </HStack>
                    <HStack>
                        <CiLocationArrow1 size={18}/>
                        <Link style={{whiteSpace: "nowrap"}}>Message Guests</Link>
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
                </HStack>
                <Box mt={8} marginLeft={"-30px"} marginTop={"50px"}>

                    <Text fontSize="2xl" fontWeight="bold">Reservation Confirmation</Text>
                    <Badge colorScheme="green" mt={2}><CheckCircleIcon/> Confirmed</Badge>

                    <Box mt={6}>
                        <Text fontWeight="bold">Contact Information</Text>
                        <VStack align="start" spacing={1}>
                            <HStack><Text>👤 Matthew Prue</Text></HStack>
                            <HStack><EmailIcon/> <Text>matthew.prue@owenscorning.com</Text></HStack>
                            <HStack><PhoneIcon/> <Text>(805) 310-6256</Text></HStack>
                        </VStack>
                    </Box>
                </Box>
            </Box>
        </VStack>
    );
};

const PaymentSummary = ({reservation}) => {


    return (
        <Box bg="gray.100" borderRadius="md" boxShadow="sm" width="150%" marginTop={"-270px"} marginLeft={"200px"}
             padding={"20px"}>
            <Text fontSize="xl" fontWeight="bold">Purchase Summary</Text>
            <VStack spacing={4} align="stretch" mt={4}>
                <HStack justifyContent="space-between">
                    <Text>6% Booking Fee</Text>
                    <Text>$71.52</Text>
                </HStack>
                <HStack justifyContent="space-between">
                    <Text>Guests (149 x 8)</Text>
                    <Text>${reservation.total_price}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                    <Text>Gratuity: 18%</Text>
                    <Text>$214.56</Text>
                </HStack>
                <Divider/>
                <HStack justifyContent="space-between">
                    <Text fontWeight="bold">Total</Text>
                    <Text fontWeight="bold">$1,478.08</Text>
                </HStack>
                <Button size={"sm"} mt={1} w="70px">Modify</Button>
            </VStack>

            <Box mt={8}>
                <Text fontSize="xl" fontWeight="bold">Payment Summary</Text>
                <HStack justifyContent="space-between" mt={4}>
                    <Text>💳 Payment *2833</Text>
                    <Text>01/07/2025</Text>
                </HStack>
                <HStack justifyContent="space-between">
                    <Text>Paid</Text>
                    <Text fontWeight="bold">$1,478.08</Text>
                </HStack>
            </Box>
        </Box>
    );
};

const PurchasesPage = () => {
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleSelectReservation = (reservation) => {
        setSelectedReservation(reservation);
    };

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch(
                    "http://localhost:9000/reservations/with-users/byTenantId/3d259f0d-33ea-4aef-b430-3aed2c35aa37"
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

        fetchReservations();
    }, [selectedReservation]);

    if (isLoading) {
        return (
            <Center width="100vw" height="100vh">
                <CircularProgress isIndeterminate color="blue.500" />
            </Center>
        );
    }

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
                                // value={searchTerm}
                                // onChange={handleSearch}
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
                            // onClick={handlePurchaseClick}
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
                        />
                    </Box>
                    <Box
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
                    </Box>
                </HStack>
            </DashboardLayout>
        </Box>
    );
};

export default PurchasesPage;
