import React from 'react';
import { Box, VStack, HStack, Text, Avatar, Divider, Button, Badge } from '@chakra-ui/react';
import { CheckCircleIcon, EmailIcon, PhoneIcon } from '@chakra-ui/icons';

const purchases = [
    { name: 'Matthew Prue', date: 'Jan 14', guests: 8, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Deanne Tallon', date: 'Jan 7', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
    { name: 'Kathleen Davis', date: 'Feb 8', guests: 2, avatarUrl: 'https://via.placeholder.com/40' },
];

const GuestItem = ({ name, date, guests, avatarUrl }) => (
    <HStack
        p={3}
        borderRadius="md"
        _hover={{ bg: 'blue.50' }}
        justifyContent="space-between"
        width="100%"
    >
        <HStack>
            <Avatar src={avatarUrl} name={name} />
            <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{name}</Text>
                <Text fontSize="sm">⦿ {guests} Guests</Text>
            </VStack>
        </HStack>
        <Text fontSize="sm" color="gray.500">{date}</Text>
    </HStack>
);

const PurchaseList = () => (
    <VStack
        spacing={4}
        width="30%"
        borderRight="1px solid #E2E8F0"
        height="100vh"
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
        {purchases.map((purchase, index) => (
            <GuestItem key={index} {...purchase} />
        ))}
    </VStack>
);


const PurchaseDetails = () => (
    <Box flex="1" p={6}>
        <Box borderRadius="lg" overflow="hidden">
            <img src="https://via.placeholder.com/1000x300" alt="Tour" />
            <VStack align="start" p={4}>
                <Text fontSize="xl" fontWeight="bold">The Beverly Hills Segway Tour</Text>
                <HStack>
                    <Text>📅 January 14, 2025</Text>
                    <Text>⏰ 2:00 PM</Text>
                </HStack>
            </VStack>
        </Box>

        <HStack spacing={4} mt={6}>
            <Button>Arrival</Button>
            <Button>Guests</Button>
            <Button>Add-ons</Button>
            <Button>Refund</Button>
            <Button>Message Guests</Button>
        </HStack>

        <Box mt={8}>
            <Text fontSize="2xl" fontWeight="bold">Reservation Confirmation</Text>
            <Badge colorScheme="green" mt={2}><CheckCircleIcon /> Confirmed</Badge>

            <Box mt={6}>
                <Text fontWeight="bold">Contact Information</Text>
                <VStack align="start" spacing={1}>
                    <HStack><Text>👤 Matthew Prue</Text></HStack>
                    <HStack><EmailIcon /> <Text>matthew.prue@owenscorning.com</Text></HStack>
                    <HStack><PhoneIcon /> <Text>(805) 310-6256</Text></HStack>
                </VStack>
            </Box>
        </Box>
    </Box>
);

const PaymentSummary = () => (
    <Box bg="gray.50" p={6} borderRadius="md" boxShadow="sm" width="30%">
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
            <Divider />
            <HStack justifyContent="space-between">
                <Text fontWeight="bold">Total</Text>
                <Text fontWeight="bold">$1,478.08</Text>
            </HStack>
            <Button mt={4}>Modify</Button>
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
    <HStack height="100vh" width="100%">
        <PurchaseList />
        <PurchaseDetails />
        <PaymentSummary />
    </HStack>
);

export default PurchasesPage;
