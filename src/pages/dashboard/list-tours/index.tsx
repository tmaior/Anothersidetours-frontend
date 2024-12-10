import {
    Badge,
    Box,
    Button,
    Center,
    Divider,
    Grid,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    Text,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";
import {EditIcon, SearchIcon, ViewIcon} from "@chakra-ui/icons";

export default function ListTours() {
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [tours, setTours] = useState([]);
    const [filteredTours, setFilteredTours] = useState([]);
    const [searchName, setSearchName] = useState("");
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const toursResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tours/allBytenant/471ce85b-0598-41a8-972c-d6a56de5fdf1`
                );
                const toursData = await toursResponse.json();
                setTours(Array.isArray(toursData) ? toursData : []);
                setFilteredTours(Array.isArray(toursData) ? toursData : []);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load tours.",
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
        setFilteredTours(filtered);
    }, [searchName, tours]);

    const handleEdit = (tourId) => {
        router.push(`/dashboard/edit-tour/${tourId}`);
    };

    return (
        <DashboardLayout>
            <Box p={2}>
                <HStack mb={4} spacing={4}>
                    <Text fontSize="2xl" fontWeight="medium" textAlign="center">
                        Products
                    </Text>
                    <Center height="50px">
                        <Divider orientation="vertical" borderWidth="1px"/>
                    </Center>
                    <HStack>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400"/>
                            </InputLeftElement>
                            <Input
                                placeholder="Search by name"
                                bg={inputBgColor}
                                value={searchName}
                                w="1200px"
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

                <Divider orientation="horizontal" borderWidth="1px" color={"black"}/>

                <Grid
                    templateColumns="repeat(2, 1fr)"
                    gap={6}
                    justifyContent="center"
                    mt={4}
                    marginTop={"60px"}
                >
                    {filteredTours.map((tour) => (
                        <GridItem
                            key={tour.id}
                            p={4}
                            bg="gray.50"
                            borderRadius="lg"
                            boxShadow="lg"
                        >
                            <HStack spacing={4} align="start">
                                <Image
                                    src={tour.imageUrl || "https://via.placeholder.com/150x100"}
                                    alt={tour.name}
                                    boxSize="150px"
                                    borderRadius="md"
                                    objectFit="cover"
                                />
                                <Box flex="1">
                                    <HStack justify="space-between" mt={2}>
                                        <Heading fontSize="lg" noOfLines={1} maxW="200px">
                                            {tour.name}
                                        </Heading>
                                        <Box display="flex" alignItems="center">
                                            <IconButton
                                                aria-label="Edit"
                                                icon={<EditIcon/>}
                                                colorScheme="blue"
                                                size="sm"
                                                variant="ghost"
                                                _hover={{display: "block"}}
                                                display="none"
                                                onClick={() => handleEdit(tour.id)}
                                            />
                                            <IconButton
                                                aria-label="More options"
                                                icon={<ViewIcon/>}
                                                size="sm"
                                                variant="ghost"
                                                _hover={{display: "block"}}
                                                display="block"
                                            />
                                        </Box>
                                    </HStack>
                                    <Text mt={2} color="gray.600" noOfLines={2} maxW="300px">
                                        {tour.description}
                                    </Text>

                                    <HStack mt={2} justify="space-between">
                                        {tour.isPrivate && <Badge colorScheme="yellow">Private</Badge>}
                                        {tour.isHidden && <Badge colorScheme="gray">Hidden</Badge>}
                                    </HStack>
                                </Box>
                            </HStack>
                        </GridItem>
                    ))}
                </Grid>
            </Box>
        </DashboardLayout>
    );
}