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
} from "@chakra-ui/react";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";
import {DeleteIcon, EditIcon, SearchIcon, ViewIcon} from "@chakra-ui/icons";
import {useGuest} from "../../../components/GuestContext";
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
                    method: "DELETE",
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
            <Box p={2} width={"1300px"}>
                <HStack mb={4} spacing={4}>
                    <Text fontSize="2xl" fontWeight="medium" textAlign="center">
                        Products
                    </Text>
                    <Center height="50px">
                        <Divider orientation="vertical" borderWidth="1px"/>
                    </Center>
                    <HStack>
                        <InputGroup w={"1000px"}>
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
                        w={"200px"}
                        colorScheme="blue"
                        onClick={() => router.push("/dashboard/create-tours")}
                    >
                        + Create Product
                    </Button>
                </HStack>

                <Divider orientation="horizontal" borderWidth="1px" color={"black"}/>

                <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={4}>
                    {filteredTours.map((tour) => (
                        <GridItem
                            key={tour.id}
                            p={4}
                            bg="gray.50"
                            borderRadius="lg"
                            boxShadow="lg"
                            display="flex"
                            flexDirection="column"
                            justifyContent="flex-start"
                            minHeight="170px"
                            position="relative"
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
                            <HStack spacing={4} align="start">
                                <Image
                                    src={tour.imageUrl || "https://via.placeholder.com/150x100"}
                                    alt={tour.name}
                                    boxSize="150px"
                                    borderRadius="md"
                                />
                                <Box flex="1" maxWidth="600px">
                                    <Heading
                                        fontSize="lg" noOfLines={2}
                                        wordBreak="break-word"
                                        whiteSpace="normal"
                                        maxW="80%">
                                        {tour.name}
                                    </Heading>
                                    <Text mt={2} noOfLines={3}>
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
        </DashboardLayout>
    );
}

export default withAuth(ListTours);