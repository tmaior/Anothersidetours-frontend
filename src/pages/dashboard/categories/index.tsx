import {
    Box,
    Button,
    Checkbox,
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
    const { isOpen, onOpen, onClose } = useDisclosure();
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
            onClose();
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

    const handleTourToggle = async (tourId) => {
        const isLinked = selectedCategory.tours?.some((tour) => tour.id === tourId);
        const method = isLinked ? "DELETE" : "POST";

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${selectedCategory.id}/tours`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tourId }),
            });

            const updatedTours = isLinked
                ? selectedCategory.tours?.filter((tour) => tour.id !== tourId) || []
                : [...(selectedCategory.tours || []), tours.find((tour) => tour.id === tourId)];

            setSelectedCategory((prev) => ({ ...prev, tours: updatedTours }));

            toast({
                title: "Updated",
                description: `Tour ${isLinked ? "removed from" : "added to"} category.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error updating tours:", error);
            toast({
                title: "Error",
                description: "Failed to update tours.",
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

    return (
        <DashboardLayout>
            <Box p={8}>
                <Flex justify="space-between" align="center" mb={8}>
                    <Heading>Category Management</Heading>
                    <Button colorScheme="blue" onClick={onOpen}>
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
                        {tours.map((tour) => (
                            <Checkbox
                                key={tour.id}
                                isChecked={selectedCategory.tours?.some((t) => t.id === tour.id) || false}
                                onChange={() => handleTourToggle(tour.id)}
                            >
                                {tour.name}
                            </Checkbox>
                        ))}

                        <Heading size="sm" mt={4}>
                            Blackout Dates
                        </Heading>
                        {Array.isArray(blackoutDates) && blackoutDates.length > 0 ? (
                            blackoutDates.map((date, index) => (
                                <Flex key={index} align="center" mb={2}>
                                    <Text>{date}</Text>
                                    <Button size="xs" colorScheme="red" ml={2}>
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

                <Modal isOpen={isOpen} onClose={onClose}>
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
            </Box>
        </DashboardLayout>
    );
}
