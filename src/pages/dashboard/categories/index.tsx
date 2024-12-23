import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
    useToast,
    VStack,
} from "@chakra-ui/react";
import {DeleteIcon} from "@chakra-ui/icons";
import DashboardLayout from "../../../components/DashboardLayout";

export default function CategoryManagement() {
    const [newCategory, setNewCategory] = useState({name: "", description: ""});
    const [categories, setCategories] = useState([]);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
                if (!response.ok) throw new Error("Failed to fetch categories");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load categories.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }

        fetchCategories();
    }, [toast]);

    const handleCreateCategory = async () => {
        if (!newCategory.name) {
            toast({
                title: "Error",
                description: "Category name is required.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newCategory),
            });

            if (!response.ok) throw new Error("Failed to create category");

            const createdCategory = await response.json();
            setCategories((prev) => [...prev, createdCategory]);
            setNewCategory({name: "", description: ""});
            toast({
                title: "Category Created",
                description: `Category "${createdCategory.name}" was created successfully.`,
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
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete category");

            setCategories((prev) => prev.filter((category) => category.id !== categoryId));
            toast({
                title: "Category Deleted",
                description: "The category has been successfully removed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error deleting category:", error);
            toast({
                title: "Error",
                description: "Failed to delete category.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <DashboardLayout>
            <Box p={8}>
                <Button colorScheme="blue" onClick={onOpen}>
                    Create Category
                </Button>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay/>
                    <ModalContent>
                        <ModalHeader>Create Category</ModalHeader>
                        <ModalCloseButton/>
                        <ModalBody>
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                                        placeholder="Enter Category Name"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Input
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                                        placeholder="Enter Category Description"
                                    />
                                </FormControl>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <HStack w="100%" justifyContent="space-between">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button colorScheme="blue" onClick={handleCreateCategory}>
                                    Create Category
                                </Button>
                            </HStack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <VStack spacing={4} mt={6} align="stretch">
                    {categories.map((category) => (
                        <Box key={category.id} p={4} borderWidth={1} borderRadius="md" display="flex"
                             justifyContent="space-between">
                            <VStack align="start">
                                <Text fontWeight="bold">{category.name}</Text>
                                <Text>{category.description}</Text>
                            </VStack>
                            <Button
                                colorScheme="red"
                                leftIcon={<DeleteIcon/>}
                                onClick={() => handleDeleteCategory(category.id)}
                            >
                                Delete
                            </Button>
                        </Box>
                    ))}
                </VStack>
            </Box>
        </DashboardLayout>
    );
}