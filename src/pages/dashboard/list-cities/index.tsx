import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    Checkbox,
    Flex,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";

export default function ListCities() {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [filteredCities, setFilteredCities] = useState([]);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchCities() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`);
                const data = await response.json();
                setCities(Array.isArray(data) ? data : []);
                setFilteredCities(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching cities:", error);
                toast({
                    title: "Error",
                    description: "Failed to load cities.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        fetchCities();
    }, [toast]);

    useEffect(() => {
        let filtered = cities;

        if (searchName) {
            filtered = filtered.filter((city) =>
                city.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredCities(filtered);
    }, [searchName, cities]);

    const handleSelectCity = (id) => {
        setSelectedCity(selectedCity === id ? null : id);
    };

    const handleDelete = async () => {
        if (selectedCity) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${selectedCity}`, {
                    method: "DELETE",
                });
                setCities(cities.filter((city) => city.id !== selectedCity));
                setSelectedCity(null);
                toast({
                    title: "City Deleted",
                    description: "The selected city has been deleted.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error deleting city:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete the city.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleEdit = () => {
        if (selectedCity) {
            router.push(`/dashboard/edit-city/${selectedCity}`);
        }
    };

    return (
        <DashboardLayout>
            <Box bg={bgColor} p={8} borderRadius="md" color="black">
                <HStack mb={4} spacing={4}>
                    <Input
                        placeholder="Search by name"
                        bg={inputBgColor}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </HStack>
                <VStack spacing={6} align="stretch">
                    {filteredCities.map((city) => (
                        <Flex
                            key={city.id}
                            p={4}
                            bg="gray.700"
                            borderRadius="md"
                            boxShadow="md"
                            align="center"
                        >
                            <Checkbox
                                isChecked={selectedCity === city.id}
                                onChange={() => handleSelectCity(city.id)}
                                colorScheme="teal"
                                mr={4}
                            />
                            <Text color="white" fontSize="lg" fontWeight="bold">
                                {city.name}
                            </Text>
                        </Flex>
                    ))}
                </VStack>
                <HStack mt={4} spacing={4}>
                    <Button
                        colorScheme="blue"
                        onClick={handleEdit}
                        isDisabled={!selectedCity}
                    >
                        Edit
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleDelete}
                        isDisabled={!selectedCity}
                    >
                        Delete
                    </Button>
                </HStack>
            </Box>
        </DashboardLayout>
    );
}