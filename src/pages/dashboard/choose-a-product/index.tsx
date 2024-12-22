import {useState} from 'react';
import {
    Box,
    Divider,
    Flex,
    Heading,
    HStack,
    Image,
    Input,
    InputGroup, InputLeftElement,
    SimpleGrid,
    Text
} from '@chakra-ui/react';
import DashboardLayout from "../../../components/DashboardLayout";
import {SearchIcon} from "@chakra-ui/icons";

const toursData = [
    {
        id: 1,
        name: 'Beyond The Billboards: Hollywood Sign Hike',
        pricePerHour: 149,
        imageUrl: 'https://via.placeholder.com/150'
    },
    {
        id: 2,
        name: 'Step On Guide Service',
        pricePerHour: 249,
        imageUrl: 'https://via.placeholder.com/150'
    },
    {
        id: 3,
        name: 'The Beverly Hills & West Hollywood E-Bike Tour',
        pricePerHour: 149,
        imageUrl: 'https://via.placeholder.com/150'
    },
    {
        id: 4,
        name: 'The Amazing Chase Beverly Hills',
        pricePerHour: 169,
        imageUrl: 'https://via.placeholder.com/150'
    },
];

export default function ToursPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTours = toursData.filter((tour) => {
        const normalizedTourName = tour.name.toLowerCase().trim();
        const normalizedSearch = searchTerm.toLowerCase().trim();

        return normalizedTourName.includes(normalizedSearch);
    });

    return (
        <DashboardLayout>
            <Box maxW="1500px" mx="auto" py={8} px={4}>
                <HStack marginTop={"-60px"}>
                    <Heading as="h1" mb={4} w={"400px"}>
                        Make a Purchase
                    </Heading>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none" marginTop={"20px"}>
                            <SearchIcon color="gray.400"/>
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
                <Divider/>
                <Text fontSize={"lg"} fontWeight={"bold"}>
                    Products
                </Text>

                <SimpleGrid columns={[1, 2, 3]} spacing={6} marginTop={"30px"}>
                    {filteredTours.map((tour) => (
                        <Box
                            key={tour.id}
                            borderWidth="1px"
                            borderRadius="md"
                            overflow="hidden"
                            p={4}
                            _hover={{boxShadow: 'md'}}
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
                                        {`A partir de $${tour.pricePerHour} / hora`}
                                    </Text>
                                </Box>
                            </Flex>
                        </Box>
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
