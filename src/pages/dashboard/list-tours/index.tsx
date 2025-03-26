import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
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
    Menu,
    MenuButton,
    MenuList,
    Text,
    useClipboard,
    useColorModeValue,
    useToast,
    VStack,
    Container,
} from "@chakra-ui/react";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";
import {DeleteIcon, EditIcon, SearchIcon, ViewIcon} from "@chakra-ui/icons";
import {useGuest} from "../../../contexts/GuestContext";
import withAuth from "../../../utils/withAuth";
import {BsThreeDots} from "react-icons/bs";

function ListTours() {
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [tours, setTours] = useState([]);
    const [filteredTours, setFilteredTours] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [tourIdToShow, setTourIdToShow] = useState(null);
    const toast = useToast();
    const router = useRouter();
    const {hasCopied, onCopy} = useClipboard(tourIdToShow);
    const {tenantId} = useGuest();
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const cancelRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const toursResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tours/allBytenant/${tenantId}`
                );
                const toursData = await toursResponse.json();
                const nonDeletedTours = Array.isArray(toursData) 
                    ? toursData.filter(tour => !tour.isDeleted) 
                    : [];
                setTours(nonDeletedTours);
                setFilteredTours(nonDeletedTours);
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

        if (tenantId) {
            fetchData();
        }
    }, [tenantId, toast]);

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

    const handleDeleteClick = (tourId) => {
        setSelectedTourId(tourId);
        setIsDeleting(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedTourId) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tours/${selectedTourId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ isDeleted: true }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete tour");
            }

            setTours((prev) =>
                prev.filter((tour) => tour.id !== selectedTourId)
            );
            toast({
                title: "Tour Deleted",
                description: "The tour has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error deleting tour:", error);
            toast({
                title: "Error",
                description: "Failed to delete the tour. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsDeleting(false);
            setSelectedTourId(null);
        }
    };

    const handleView = (tourId) => {
        setTourIdToShow((prevId) => (prevId === tourId ? null : tourId));
    };

    return (
        <DashboardLayout>
            <Container maxW="container.xl" px={{ base: 2, md: 4 }} centerContent>
                <Box w="full" maxW="1400px">
                    <HStack
                        mb={4}
                        spacing={4}
                        flexWrap="wrap"
                        justify="center"
                        alignItems="center"
                    >
                        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="medium" textAlign="center">
                            Products
                        </Text>
                        <Center height="50px" display={{ base: "none", md: "flex" }}>
                            <Divider orientation="vertical" borderWidth="1px"/>
                        </Center>

                        <InputGroup w={{ base: "100%", md: "600px" }}
                                    flex="1">
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400"/>
                            </InputLeftElement>
                            <Input
                                placeholder="Search by name"
                                bg={inputBgColor}
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                        </InputGroup>

                        <Button
                            w={{ base: "100%", md: "200px" }}
                            colorScheme="blue"
                            onClick={() => router.push("/dashboard/create-tours")}
                        >
                            + Create Product
                        </Button>
                    </HStack>

                    <Divider orientation="horizontal" borderWidth="1px" color={"black"}/>

                    <Grid 
                        templateColumns={{ 
                            base: "1fr", 
                            sm: "1fr",
                            md: "repeat(2, 1fr)", 
                            lg: "repeat(2, 1fr)",
                            xl: "repeat(2, 1fr)"
                        }}
                        gap={{ base: 4, md: 5, lg: 6 }}
                        mt={6}
                        justifyContent="stretch"
                        mx="auto"
                        width="100%"
                    >
                        {filteredTours.map((tour) => (
                            <GridItem
                                key={tour.id}
                                p={{ base: 4, md: 5, lg: 6 }}
                                bg="gray.50"
                                borderRadius="lg"
                                boxShadow="lg"
                                display="flex"
                                flexDirection="column"
                                justifyContent="flex-start"
                                minHeight={{ base: "180px", md: "200px", lg: "220px" }}
                                width="100%"
                                position="relative"
                                transition="all 0.3s ease"
                                _hover={{ 
                                    transform: "translateY(-5px)",
                                    boxShadow: "xl" 
                                }}
                            >
                                <HStack position="absolute" top={4} right={4} spacing={2}>
                                    <Box position="relative" display="inline-block">
                                        <Box
                                            position="relative"
                                            _hover={{
                                                "& > button": {
                                                    opacity: "1",
                                                    visibility: "visible",
                                                },
                                            }}
                                        >
                                            <IconButton
                                                aria-label="View Tour ID"
                                                icon={<ViewIcon/>}
                                                colorScheme="gray"
                                                size="sm"
                                                onClick={() => handleView(tour.id)}
                                                opacity="0"
                                                visibility="hidden"
                                                transition="opacity 0.2s ease, visibility 0.2s ease"
                                            />
                                        </Box>
                                    </Box>
                                    <HStack>
                                        <Menu placement="left-start" offset={[30, -100]}>
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
                                                minW="120px"
                                                maxW="150px"
                                            >
                                                <VStack alignItems={"flex-start"}>
                                                    <Button
                                                        leftIcon={<EditIcon/>}
                                                        variant="ghost"
                                                        justifyContent="flex-start"
                                                        size="sm"
                                                        w="100%"
                                                        onClick={() => handleEdit(tour.id)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        leftIcon={<DeleteIcon/>}
                                                        variant="ghost"
                                                        justifyContent="flex-start"
                                                        size="sm"
                                                        w="100%"
                                                        onClick={() => handleDeleteClick(tour.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </VStack>
                                            </MenuList>
                                        </Menu>
                                    </HStack>
                                </HStack>

                                {tourIdToShow === tour.id && (
                                    <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={2}>
                                        ID: {tour.id}
                                        <Button size="sm" variant="link" onClick={onCopy} ml={2}>
                                            {hasCopied ? "Copied" : "Copy"}
                                        </Button>
                                    </Text>
                                )}
                                <HStack spacing={{ base: 3, md: 5 }} align="start" flexWrap={{ base: "wrap", md: "nowrap" }} width="100%">
                                    <Image
                                        src={tour.imageUrl || "https://via.placeholder.com/150x100"}
                                        alt={tour.name}
                                        boxSize={{ base: "130px", md: "160px", lg: "180px" }}
                                        minWidth={{ base: "130px", md: "160px", lg: "180px" }}
                                        objectFit="cover"
                                        borderRadius="md"
                                    />
                                    <Box flex="1" width="100%" pr={{ base: 2, md: 4 }}>
                                        <Heading
                                            fontSize={{ base: "md", md: "lg", lg: "xl" }}
                                            noOfLines={2}
                                            wordBreak="break-word"
                                            whiteSpace="normal"
                                            width="100%">
                                            {tour.name}
                                        </Heading>
                                        <Text 
                                            mt={2} 
                                            noOfLines={{ base: 3, lg: 4 }} 
                                            fontSize={{ base: "sm", md: "md", lg: "lg" }}
                                            width="100%"
                                        >
                                            {tour.description}
                                        </Text>

                                        <HStack mt={3}>
                                            {tour.isPrivate && (
                                                <Badge colorScheme="yellow" fontSize={{ base: "xs", lg: "sm" }}>Private</Badge>
                                            )}
                                            {tour.isHidden && (
                                                <Badge colorScheme="gray" fontSize={{ base: "xs", lg: "sm" }}>Hidden</Badge>
                                            )}
                                        </HStack>
                                    </Box>
                                </HStack>
                            </GridItem>
                        ))}
                    </Grid>

                    <AlertDialog
                        isOpen={isDeleting}
                        leastDestructiveRef={cancelRef}
                        onClose={() => setIsDeleting(false)}
                    >
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader>Confirm Delete</AlertDialogHeader>
                                <AlertDialogBody>
                                    Are you sure you want to delete this tour?
                                </AlertDialogBody>
                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={() => setIsDeleting(false)}>
                                        Cancel
                                    </Button>
                                    <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                                        Delete
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </Box>
            </Container>
        </DashboardLayout>
    );
}

export default withAuth(ListTours);