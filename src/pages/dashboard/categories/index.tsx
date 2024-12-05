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
    ModalOverlay,
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
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/categories/${category.id}`
            );
            const data = await response.json();
            setSelectedCategory({ ...data, tours: data.tours || [] });
            setBlackoutDates(data.blackoutDates || []);
        } catch (error) {
            console.error("Error fetching category:", error);
            toast({
                title: "Error",
                description: "Failed to fetch category details.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleAddTour = async (tourId) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${selectedCategory.id}/tours`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tourId }),
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

    const handleAddBlackoutDate = async (date) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${selectedCategory.id}/blackout-dates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date }),
            });

            setBlackoutDates((prev) => [...prev, date]);

            toast({
                title: "Added",
                description: "Blackout date added successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error adding blackout date:", error);
            toast({
                title: "Error",
                description: "Failed to add blackout date.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleRemoveBlackoutDate = async (date) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${selectedCategory.id}/blackout-dates`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date }),
            });

            setBlackoutDates((prev) => prev.filter((d) => d !== date));

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
                            blackoutDates.map((date, index) => (
                                <Flex key={index} align="center" mb={2}>
                                    <Text>{date}</Text>
                                    <Button
                                        size="xs"
                                        colorScheme="red"
                                        onClick={() => handleRemoveBlackoutDate(date)}
                                    >
                                        Remove
                                    </Button>
                                </Flex>
                            ))
                        ) : (
                            <Text>No blackout dates available.</Text>
                        )}
                        <Input
                            type="date"
                            mt={4}
                            onChange={(e) => handleAddBlackoutDate(e.target.value)}
                        />
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
                                {tours
                                    .filter(
                                        (tour) =>
                                            !selectedCategory.tours?.some((categoryTour) => categoryTour.id === tour.id)
                                    )
                                    .map((tour) => (
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
                            </VStack>
                            {tours.filter(
                                (tour) =>
                                    !selectedCategory.tours?.some((categoryTour) => categoryTour.id === tour.id)
                            ).length === 0 && (
                                <Text>No available tours to add.</Text>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Box>
        </DashboardLayout>
    );
}
