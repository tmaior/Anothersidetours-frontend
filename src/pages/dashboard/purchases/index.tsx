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

const initialPurchases = [
    {name: 'Matthew Prue', date: 'Jan 14', guests: 8, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Deanne Tallon', date: 'Jan 7', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
    {name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40'},
];


const fetchMorePurchases = (startIndex: number, limit: number) => {
    const morePurchases = [];
    for (let i = startIndex; i < startIndex + limit; i++) {
        morePurchases.push({
            name: `Guest ${i + 1}`,
            date: 'Mar 10',
            guests: Math.floor(Math.random() * 5) + 1,
            avatarUrl: 'https://via.placeholder.com/40'
        });
    }
    return morePurchases;
};

const GuestItem = ({name, date, guests, avatarUrl}) => (
    <HStack
        p={3}
        borderRadius="md"
        _hover={{bg: 'blue.50'}}
        justifyContent="space-between"
        width="100%"
    >
        <HStack>
            <Image
                boxSize="50px"
                src={avatarUrl || "https://via.placeholder.com/50"}
                title={name}
                borderRadius="md"
            />
            <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{name}</Text>
                <Text fontSize="sm">⦿ {guests} Guests</Text>
            </VStack>
        </HStack>
        <Text fontSize="sm" color="gray.500">{date}</Text>
    </HStack>
);

const PurchaseList = () => {
    const [displayedPurchases, setDisplayedPurchases] = useState(initialPurchases);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        const container = containerRef.current;
        if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
            if (isAtBottom && !isLoading && hasMore) {
                loadMore();
            }
        }
    };

    const loadMore = () => {
        setIsLoading(true);
        setTimeout(() => {
            const newItems = fetchMorePurchases(displayedPurchases.length, 5);
            if (newItems.length === 0) {
                setHasMore(false);
            } else {
                setDisplayedPurchases((prev) => [...prev, ...newItems]);
            }
            setIsLoading(false);
        }, 1000);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [isLoading]);

    return (
        <VStack
            marginLeft={"-50px"}
            ref={containerRef}
            spacing={4}
            width="30%"
            borderRight="1px solid #E2E8F0"
            height="100vh"
            w={"300px"}
            p={4}
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
            {displayedPurchases.map((purchase, index) => (
                <GuestItem key={index} {...purchase} />
            ))}
            {isLoading && (
                <CircularProgress
                    isIndeterminate
                    size="50px"
                    thickness="6px"
                    color="blue.500"
                />
            )}
            {!hasMore && <Text fontSize="sm" color="gray.500">No more items to load</Text>}
        </VStack>
    );
};


const PurchaseDetails = () => (
    <VStack>
        <Box
            position="relative"
            width="130%"
            maxWidth="none"
            borderRadius="lg"
            overflowY="auto"
            marginTop={"-400px"}
            marginLeft="30%"
        >
            <img
                src="https://via.placeholder.com/1000x300"
                alt="Tour"
                style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
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
                    <Text>📅 January 14, 2025</Text>
                    <Text>⏰ 2:00 PM</Text>
                </HStack>
            </Box>
        </Box>

        <Box flex="1" p={6} marginTop={"-50px"}>
            <HStack spacing={6} mt={6} wrap="nowrap">
                <Link style={{whiteSpace: "nowrap"}}>Arrival</Link>
                <Link style={{whiteSpace: "nowrap"}}>Guests</Link>
                <Link style={{whiteSpace: "nowrap"}}>Add-ons</Link>
                <Link style={{whiteSpace: "nowrap"}}>Refund</Link>
                <Link style={{whiteSpace: "nowrap"}}>Message Guests</Link>
                <Link style={{whiteSpace: "nowrap"}}>Resend Confirmation</Link>
                <Link style={{whiteSpace: "nowrap"}}>Resend Gratuity Notification</Link>
                <Link style={{whiteSpace: "nowrap"}}>Resend Waiver Email</Link>
            </HStack>

            <Box mt={8}>
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

const PaymentSummary = () => (
    <Box bg="gray.50" p={6} borderRadius="md" boxShadow="sm" width="30%" marginTop={"100px"} marginLeft={"-300px"}>
        <Text fontSize="xl" fontWeight="bold">Purchase Summary</Text>
        <VStack spacing={4} align="stretch" mt={4}>
            <HStack justifyContent="space-between">
                <Text>6% Booking Fee</Text>
                <Text>$71.52</Text>
            </HStack>
            <HStack justifyContent="space-between">
                <Text>Guests (149 x 8)</Text>
                <Text>$1,192.00</Text>
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

const PurchasesPage = () => (
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
            <Divider/>
            <HStack height="100vh" width="100%">
                <PurchaseList/>
                <HStack>
                    <PurchaseDetails/>
                    <PaymentSummary/>
                </HStack>
            </HStack>
        </DashboardLayout>
    </Box>
);

export default PurchasesPage;
