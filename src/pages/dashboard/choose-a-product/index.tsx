import { useState, useEffect } from 'react';
import {
    Box,
    Divider,
    Flex,
    Heading,
    HStack,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Text,
    Spinner,
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/DashboardLayout';
import { SearchIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useGuest } from '../../../components/GuestContext';

export default function ToursPage() {
    const { tenantId } = useGuest();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/allBytenant/${tenantId}`);
                const data = await res.json();
                setTours(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch tours:', error);
                setLoading(false);
            }
        };

        if (tenantId) {
            fetchTours();
        }
    }, [tenantId]);

    const filteredTours = tours.filter((tour) => {
        const normalizedTourName = tour.name.toLowerCase().trim();
        const normalizedSearch = searchTerm.toLowerCase().trim();
        return normalizedTourName.includes(normalizedSearch);
    });

    if (loading) {
        return (
            <DashboardLayout>
                <Box p={8} textAlign="center">
                    <Spinner size="xl" />
                    <Text mt={4}>Loading tours...</Text>
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box maxW="1500px" mx="auto" py={8} px={4}>
                <HStack marginTop={"-60px"}>
                    <Heading as="h1" mb={4} w={"400px"}>
                        Make a Purchase
                    </Heading>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none" marginTop={"20px"}>
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            marginTop={"20px"}
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            mb={6}
                            w={"500px"}
                        />
                    </InputGroup>
                </HStack>
                <Divider />
                <Text fontSize={"lg"} fontWeight={"bold"}>
                    Products
                </Text>

                <SimpleGrid columns={[1, 2, 3]} spacing={6} marginTop={"30px"}>
                    {filteredTours.map((tour) => (
                        <Link href={`/dashboard/make-a-purchase/${tour.id}`} key={tour.id} passHref>
                            <Box
                                key={tour.id}
                                borderWidth="1px"
                                borderRadius="md"
                                overflow="hidden"
                                p={4}
                                _hover={{ boxShadow: 'md', cursor: 'pointer' }}
                            >
                                <Flex align="center">
                                    <Image
                                        src={tour.imageUrl}
                                        alt={tour.name}
                                        boxSize="70px"
                                        objectFit="cover"
                                        borderRadius="md"
                                    />
                                    <Box ml={4}>
                                        <Heading as="h2" size="sm" mb={1}>
                                            {tour.name}
                                        </Heading>
                                        <Text color="gray.600">
                                            {`$${tour.pricePerHour} / hour`}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        </Link>
                    ))}
                </SimpleGrid>

                {filteredTours.length === 0 && searchTerm && (
                    <Text mt={4} textAlign="center">
                        No Products found.
                    </Text>
                )}
            </Box>
        </DashboardLayout>
    );
}
