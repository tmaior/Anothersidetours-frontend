import {
    Box,
    VStack,
    HStack,
    Input,
    Select,
    Checkbox,
    Button,
    Text,
    Image,
    Heading,
    Flex,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";

export default function ListTours() {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [tours, setTours] = useState([]);
    const [selectedTour, setSelectedTour] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [filterTenant, setFilterTenant] = useState("");
    const [searchName, setSearchName] = useState("");
    const [filteredTours, setFilteredTours] = useState([]);
    const toast = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                const toursResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tours`
                );
                const toursData = await toursResponse.json();
                setTours(Array.isArray(toursData) ? toursData : []);
                setFilteredTours(Array.isArray(toursData) ? toursData : []);

                const tenantsResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tenants`
                );
                const tenantsData = await tenantsResponse.json();
                setTenants(Array.isArray(tenantsData) ? tenantsData : []);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load tours or tenants.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        fetchData();
    }, [toast]);

    useEffect(() => {
        let filtered = tours;

        if (filterTenant) {
            filtered = filtered.filter((tour) => tour.tenantId === filterTenant);
        }

        if (searchName) {
            filtered = filtered.filter((tour) =>
                tour.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredTours(Array.isArray(filtered) ? filtered : []);
    }, [filterTenant, searchName, tours]);

    const handleSelectTour = (id) => {
        setSelectedTour(selectedTour === id ? null : id);
    };

    const handleDelete = async () => {
        if (selectedTour) {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tours/${selectedTour}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to delete the tour.");
                }

                setTours(tours.filter((tour) => tour.id !== selectedTour));
                setSelectedTour(null);
                toast({
                    title: "Tour Deleted",
                    description: "The selected tour has been deleted.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error deleting tour:", error);
                toast({
                    title: "Error",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const router = useRouter();

    const handleEdit = () => {
        if (selectedTour) {
            router.push(`/dashboard/edit-tour/${selectedTour}`);
        }
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes > 0) {
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${hours}h`;
    };

    return (
        <DashboardLayout>
            <Box bg={bgColor} p={8} borderRadius="md" color="black">
                <HStack mb={4} spacing={4}>
                    <Select
                        placeholder="Select City"
                        bg={inputBgColor}
                        onChange={(e) => setFilterTenant(e.target.value)}
                    >
                        {tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                                {tenant.name}
                            </option>
                        ))}
                    </Select>
                    <Input
                        placeholder="Search by name"
                        bg={inputBgColor}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </HStack>
                <VStack spacing={6} align="stretch">
                    {filteredTours.map((tour) => (
                        <Flex
                            key={tour.id}
                            p={4}
                            bg="gray.700"
                            borderRadius="md"
                            boxShadow="md"
                            align="center"
                        >
                            <Checkbox
                                isChecked={selectedTour === tour.id}
                                onChange={() => handleSelectTour(tour.id)}
                                colorScheme="teal"
                                mr={4}
                            />
                            <Image
                                src={tour.imageUrl || "https://via.placeholder.com/300x200"}
                                alt={tour.name}
                                boxSize="150px"
                                borderRadius="md"
                                mr={4}
                            />
                            <Box>
                                <Heading fontSize="lg" color="white">
                                    {tour.name}
                                </Heading>
                                <Text color="gray.300">{tour.description}</Text>
                                <Text color="gray.400">
                                    Price: ${tour.price.toFixed(2)}
                                </Text>
                                <Text color="gray.400">
                                    Duration: {formatDuration(tour.duration)}
                                </Text>
                            </Box>
                        </Flex>
                    ))}
                </VStack>
                <HStack mt={4} spacing={4}>
                    <Button
                        colorScheme="blue"
                        onClick={handleEdit}
                        isDisabled={!selectedTour}
                    >
                        Edit
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleDelete}
                        isDisabled={!selectedTour}
                    >
                        Delete
                    </Button>
                </HStack>
            </Box>
        </DashboardLayout>
    );
}
