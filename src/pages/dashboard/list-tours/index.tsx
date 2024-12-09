import {
    Box,
    VStack,
    HStack,
    Input,
    Checkbox,
    Button,
    Badge,
    Text,
    Image,
    Heading,
    Flex,
    useColorModeValue,
    useToast, InputLeftElement, InputGroup, Divider, Center,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";
import {SearchIcon} from "@chakra-ui/icons";

export default function ListTours() {
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [tours, setTours] = useState([]);
    const [selectedTour, setSelectedTour] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [filteredTours, setFilteredTours] = useState([]);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const toursResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tours`
                );
                const toursData = await toursResponse.json();
                setTours(Array.isArray(toursData) ? toursData : []);
                setFilteredTours(Array.isArray(toursData) ? toursData : []);

                // const tenantsResponse = await fetch(
                //     `${process.env.NEXT_PUBLIC_API_URL}/tenants`
                // );
                // const tenantsData = await tenantsResponse.json();
                // setTenants(Array.isArray(tenantsData) ? tenantsData : []);
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


        if (searchName) {
            filtered = filtered.filter((tour) =>
                tour.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredTours(Array.isArray(filtered) ? filtered : []);
    }, [searchName, tours]);

    const handleSelectTour = (id) => {
        setSelectedTour(selectedTour === id ? null : id);
    };

    // const handleDelete = async () => {
    //     if (selectedTour) {
    //         try {
    //             const response = await fetch(
    //                 `${process.env.NEXT_PUBLIC_API_URL}/tours/${selectedTour}`,
    //                 {
    //                     method: "PUT",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                     },
    //                     body: JSON.stringify({
    //                         isDeleted: true,
    //                     }),
    //                 }
    //             );
    //
    //             if (!response.ok) {
    //                 const errorData = await response.json();
    //                 throw new Error(errorData.message || "Failed to delete the tour.");
    //             }
    //
    //             setTours(tours.filter((tour) => tour.id !== selectedTour));
    //             setSelectedTour(null);
    //             toast({
    //                 title: "Tour Deleted",
    //                 description: "The selected tour has been deleted.",
    //                 status: "success",
    //                 duration: 3000,
    //                 isClosable: true,
    //             });
    //         } catch (error) {
    //             console.error("Error deleting tour:", error);
    //             toast({
    //                 title: "Error",
    //                 description: error.message,
    //                 status: "error",
    //                 duration: 5000,
    //                 isClosable: true,
    //             });
    //         }
    //     }
    // };

    // const handleEdit = () => {
    //     if (selectedTour) {
    //         router.push(`/dashboard/edit-tour/${selectedTour}`);
    //     }
    // };
    //
    // const handleCreate = () => {
    //     router.push("/dashboard/create-tour");
    // };

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
            {/*<Box bg={bgColor} p={8} borderRadius="md" color="black">*/}
                <HStack mb={4} spacing={4}>
                    <Text fontSize="4xl" fontWeight="medium" textAlign="center">
                        Products
                    </Text>
                    <Center height='50px'>
                        <Divider orientation='vertical' borderWidth="1px" />
                    </Center>
                    <HStack>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search by name"
                                bg={inputBgColor}
                                value={searchName}
                                w={"1200px"}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                        </InputGroup>
                    </HStack>
                    <Button
                        colorScheme="blue"
                        onClick={() => router.push("/dashboard/create-tours")}
                    >
                        + Create Product
                    </Button>
                </HStack>
            <Divider orientation='horizontal' borderWidth="1px" color={"black"} />
                <VStack spacing={6} align="stretch">
                    {filteredTours.map((tour) => (
                        <Flex
                            key={tour.id}
                            p={4}
                            bg="gray.50"
                            borderRadius="lg"
                            boxShadow="lg"
                            align="center"
                            justify="space-between"
                            flexWrap="wrap"
                        >
                            <HStack spacing={4} align="center">
                                <Image
                                    src={tour.imageUrl || "https://via.placeholder.com/300x200"}
                                    alt={tour.name}
                                    boxSize="100px"
                                    borderRadius="md"
                                />
                                <Box>
                                    <Heading fontSize="lg">{tour.name}</Heading>
                                    <Text color="gray.600" noOfLines={2}>
                                        {tour.description}
                                    </Text>
                                    <HStack mt={2}>
                                        {tour.isPrivate && (
                                            <Badge colorScheme="yellow">Private</Badge>
                                        )}
                                        {tour.isHidden && (
                                            <Badge colorScheme="gray">Hidden</Badge>
                                        )}
                                    </HStack>
                                    <Text mt={2} fontSize="sm" color="gray.500">
                                        Price: ${tour.price.toFixed(2)}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Duration: {formatDuration(tour.duration)}
                                    </Text>
                                </Box>
                            </HStack>
                            <Checkbox
                                isChecked={selectedTour === tour.id}
                                onChange={() => handleSelectTour(tour.id)}
                                colorScheme="teal"
                            />
                        </Flex>
                    ))}
                </VStack>
            {/*</Box>*/}
        </DashboardLayout>
    );
}
