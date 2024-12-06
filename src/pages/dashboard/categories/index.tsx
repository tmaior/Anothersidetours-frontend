import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay, Radio, RadioGroup, Stack,
    Text,
    Textarea,
    useDisclosure,
    useToast,
    VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [tours, setTours] = useState([]);
    const [blackoutDates, setBlackoutDates] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const {
        isOpen: isCreateCategoryOpen,
        onOpen: openCreateCategory,
        onClose: closeCreateCategory,
    } = useDisclosure();
    const {
        isOpen: isAddTourOpen,
        onOpen: openAddTour,
        onClose: closeAddTour,
    } = useDisclosure();
    const toast = useToast();
    const [blackoutType, setBlackoutType] = useState("date");
    const [timeRange, setTimeRange] = useState({ start: "", end: "" });

    useEffect(() => {
        async function fetchData() {
            try {
                const [categoryResponse, toursResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours`),
                ]);
                const [categoriesData, toursData] = await Promise.all([
                    categoryResponse.json(),
                    toursResponse.json(),
                ]);
                setCategories(categoriesData);
                setTours(toursData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load data.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        fetchData();
    }, [toast]);

    const handleCreateCategory = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            if (!response.ok) throw new Error("Failed to create category");

            const createdCategory = await response.json();
            setCategories((prev) => [...prev, createdCategory]);
            setNewCategory({ name: "", description: "" });
            toast({
                title: "Category Created",
                description: "The category was successfully created.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            closeCreateCategory();
        } catch (error) {
            console.error("Error creating category:", error);
            toast({
                title: "Error",
                description: "Failed to create category.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleSelectCategory = async (category) => {
        try {
            const categoryResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/categories/${category.id}`
            );

            if (!categoryResponse.ok) {
                throw new Error("Failed to fetch category details.");
            }

            const categoryData = await categoryResponse.json();
            setSelectedCategory({ ...categoryData, tours: categoryData.tours || [] });

            const blackoutResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/blackout-dates/filter`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ categoryId: category.id }),
                }
            );

            if (!blackoutResponse.ok) {
                throw new Error("Failed to fetch blackout dates.");
            }

            const blackoutData = await blackoutResponse.json();
            setBlackoutDates(blackoutData || []);

            toast({
                title: "Success",
                description: "Category loaded successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error fetching category or blackout dates:", error);
            toast({
                title: "Error",
                description: "Failed to fetch category or blackout dates.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };



    const handleAddTour = async (tourId) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${tourId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId: selectedCategory.id }),
            });

            const newTour = tours.find((tour) => tour.id === tourId);
            setSelectedCategory((prev) => ({
                ...prev,
                tours: [...(prev.tours || []), newTour],
            }));

            toast({
                title: "Tour Added",
                description: "Tour added to category successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            closeAddTour();
        } catch (error) {
            console.error("Error adding tour:", error);
            toast({
                title: "Error",
                description: "Failed to add tour to category.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleRemoveTour = async (tourId) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${selectedCategory.id}/tours`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tourId }),
            });

            setSelectedCategory((prev) => ({
                ...prev,
                tours: prev.tours.filter((tour) => tour.id !== tourId),
            }));

            toast({
                title: "Tour Removed",
                description: "Tour removed from category successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error removing tour:", error);
            toast({
                title: "Error",
                description: "Failed to remove tour from category.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleAddBlackoutDate = async () => {
        try {
            const blackout =
                blackoutType === "date"
                    ? {
                        isGlobal: false,
                        date: new Date(timeRange.start).toISOString(),
                        categoryId: selectedCategory.id,
                    }
                    : {
                        isGlobal: false,
                        categoryId: selectedCategory.id,
                        startTime: timeRange.start,
                        endTime: timeRange.end,
                        reason: "Scheduled maintenance",
                    };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/blackout-dates`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(blackout),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add blackout date.");
            }

            const newBlackout = await response.json();
            setBlackoutDates((prev) => [...prev, newBlackout]);

            setTimeRange({ start: "", end: "" });

            toast({
                title: "Added",
                description: "Blackout date added successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error adding blackout:", error);
            toast({
                title: "Error",
                description: "Failed to add blackout date.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleRemoveBlackoutDate = async (blackout) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/blackout-dates/${blackout.id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete blackout date.");
            }

            setBlackoutDates((prev) => prev.filter((d) => d.id !== blackout.id));

            toast({
                title: "Removed",
                description: "Blackout date removed successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error removing blackout date:", error);
            toast({
                title: "Error",
                description: "Failed to remove blackout date.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <DashboardLayout>
            <Box p={8}>
                <Flex justify="space-between" align="center" mb={8}>
                    <Heading>Category Management</Heading>
                    <Button colorScheme="blue" onClick={openCreateCategory}>
                        Create Category
                    </Button>
                </Flex>

                <VStack spacing={4} align="stretch">
                    {categories.map((category) => (
                        <Box key={category.id} p={4} borderWidth={1} borderRadius="md">
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <Heading size="md">{category.name}</Heading>
                                    <Text>{category.description}</Text>
                                </Box>
                                <Button colorScheme="teal" onClick={() => handleSelectCategory(category)}>
                                    Edit
                                </Button>
                            </Flex>
                        </Box>
                    ))}
                </VStack>

                {selectedCategory && (
                    <Box mt={8} p={4} borderWidth={1} borderRadius="md">
                        <Heading size="md">Edit {selectedCategory.name}</Heading>
                        <Heading size="sm" mt={4}>
                            Tours
                        </Heading>
                        <VStack spacing={2} align="stretch">
                            {selectedCategory.tours?.map((tour) => (
                                <Flex key={tour.id} justify="space-between" align="center">
                                    <Text>{tour.name}</Text>
                                    <Button
                                        size="xs"
                                        colorScheme="red"
                                        onClick={() => handleRemoveTour(tour.id)}
                                    >
                                        Remove
                                    </Button>
                                </Flex>
                            ))}
                        </VStack>
                        <Button mt={4} colorScheme="blue" onClick={openAddTour}>
                            Add Tour
                        </Button>

                        <Heading size="sm" mt={4}>
                            Blackout Dates
                        </Heading>
                        {Array.isArray(blackoutDates) && blackoutDates.length > 0 ? (
                            blackoutDates.map((blackout, index) => (
                                <Flex key={index} align="center" mb={2}>
                                    <Text>
                                        {blackout.date
                                            ? `Date: ${new Date(blackout.date).toLocaleDateString()}`
                                            : blackout.startTime && blackout.endTime
                                                ? `Time: ${blackout.startTime} - ${blackout.endTime}`
                                                : "Invalid blackout data"}
                                    </Text>
                                    <Button
                                        size="xs"
                                        colorScheme="red"
                                        onClick={() => handleRemoveBlackoutDate(blackout)}
                                    >
                                        Remove
                                    </Button>
                                </Flex>
                            ))
                        ) : (
                            <Text>No blackout dates available.</Text>
                        )}

                        <RadioGroup onChange={setBlackoutType} value={blackoutType} mt={4}>
                            <Stack direction="row">
                                <Radio value="date">By Date</Radio>
                                <Radio value="time">By Time</Radio>
                            </Stack>
                        </RadioGroup>

                        {blackoutType === "date" ? (
                            <Input
                                type="date"
                                mt={4}
                                value={timeRange.start}
                                onChange={(e) => setTimeRange({ start: e.target.value, end: "" })}
                            />
                        ) : (
                            <Flex mt={4}>
                                <Input
                                    type="time"
                                    placeholder="Start Time"
                                    value={timeRange.start}
                                    onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                                    mr={2}
                                />
                                <Input
                                    type="time"
                                    placeholder="End Time"
                                    value={timeRange.end}
                                    onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                                />
                            </Flex>
                        )}

                        <Button mt={4} colorScheme="blue" onClick={handleAddBlackoutDate}>
                            Add Blackout
                        </Button>
                    </Box>
                )}

                <Modal isOpen={isCreateCategoryOpen} onClose={closeCreateCategory}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create New Category</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Input
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={(e) =>
                                    setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                                }
                                mb={4}
                            />
                            <Textarea
                                placeholder="Category Description"
                                value={newCategory.description}
                                onChange={(e) =>
                                    setNewCategory((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" onClick={handleCreateCategory}>
                                Create
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <Modal isOpen={isAddTourOpen} onClose={closeAddTour}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Add Tour</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack align="stretch">
                                {tours.filter(
                                    (tour) =>
                                        selectedCategory?.tours &&
                                        !selectedCategory.tours.some((categoryTour) => categoryTour.id === tour.id)
                                ).map((tour) => (
                                    <Flex key={tour.id} justify="space-between" align="center">
                                        <Text>{tour.name}</Text>
                                        <Button
                                            size="xs"
                                            colorScheme="blue"
                                            onClick={() => handleAddTour(tour.id)}
                                        >
                                            Add
                                        </Button>
                                    </Flex>
                                ))}

                                {(!selectedCategory || !selectedCategory.tours || tours.filter(
                                    (tour) =>
                                        selectedCategory?.tours &&
                                        !selectedCategory.tours.some((categoryTour) => categoryTour.id === tour.id)
                                ).length === 0) && (
                                    <Text>No available tours to add.</Text>
                                )}
                            </VStack>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Box>
        </DashboardLayout>
    );
}
