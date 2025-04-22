import React, {useEffect, useState, useCallback} from "react";
import {
    Box,
    Button,
    Checkbox,
    CheckboxGroup,
    FormControl,
    FormLabel,
    HStack,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
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
import {DeleteIcon, SearchIcon, SettingsIcon} from "@chakra-ui/icons";
import DashboardLayout from "../../../components/DashboardLayout";
import withAuth from "../../../utils/withAuth";
import {useGuest} from "../../../contexts/GuestContext";

interface Category {
    id: string;
    name: string;
    description: string;
    tours: Tour[];
}

interface Tour {
    id: string;
    name: string;
    imageUrl?: string;
    categoryId?: string | null;
}

function CategoryManagement() {
    const {tenantId} = useGuest();
    const [newCategory, setNewCategory] = useState({name: "", description: "", tenantId: null});
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedTours, setSelectedTours] = useState<string[]>([]);
    const [allTours, setAllTours] = useState<Tour[]>([]);

    const {isOpen, onOpen, onClose} = useDisclosure();
    const {
        isOpen: isManageOpen,
        onOpen: onManageOpen,
        onClose: onManageClose,
    } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        if (tenantId) {
            setNewCategory((prev) => ({
                ...prev,
                tenantId: tenantId,
            }));
        }
    }, [tenantId]);

    const fetchCategories = useCallback(async (tenantId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/byTenantId/${tenantId}`,{
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch categories");
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast({
                title: "Error",
                description: "Failed to load categories.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }, [toast]);

    const fetchTours = useCallback(async (tenantId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/allBytenant/${tenantId}`,
                {
                    method: "GET",
                    credentials: "include",
                });
            if (!response.ok) throw new Error("Failed to fetch tours");
            const data = await response.json();
            setAllTours(data);
        } catch (error) {
            console.error("Error fetching tours:", error);
            toast({
                title: "Error",
                description: "Failed to load tours.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }, [toast]);

    useEffect(() => {
        if (!tenantId) return;
        fetchCategories(tenantId);
        fetchTours(tenantId);
    }, [fetchCategories, fetchTours, tenantId]);

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
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/categories`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(newCategory),
                }
            );

            if (!response.ok) throw new Error("Failed to create category");

            const createdCategory = await response.json();
            setCategories((prev) => [...prev, createdCategory]);
            setNewCategory({name: "", description: "", tenantId: tenantId});

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
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!response.ok) throw new Error("Failed to delete category");

            setCategories((prev) => prev.filter((c) => c.id !== categoryId));
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

    const handleManageTours = (category: Category) => {
        setSelectedCategory(category);

        const toursInCategory = category.tours?.map((tour) => tour.id) || [];

        setSelectedTours(toursInCategory);

        const relevantTours = allTours.filter(
            (tour) => tour.categoryId === category.id || tour.categoryId === null
        );
        setFilteredTours(relevantTours);
        setSearchTerm("");
        onManageOpen();
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = allTours.filter(
            (tour) =>
                (!tour.categoryId || tour.categoryId === selectedCategory?.id) &&
                tour.name.toLowerCase().includes(term)
        );
        setFilteredTours(filtered);
    };

    const handleSaveTours = async () => {
        if (!selectedCategory) return;

        try {
            const originalTours = categories.find(c => c.id === selectedCategory.id)?.tours || [];

            const originallyInCategory = originalTours.map(tour => tour.id);
            const toursToConnect = selectedTours.filter(
                (tourId) => !originallyInCategory.includes(tourId)
            );
            const toursToDisconnect = originallyInCategory.filter(
                (tourId) => !selectedTours.includes(tourId)
            );
            const updatePromises = [
                ...toursToConnect.map((tourId) =>
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${tourId}`, {
                        method: "PUT",
                        credentials: "include",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({categoryId: selectedCategory.id}),
                    })
                ),
                ...toursToDisconnect.map((tourId) =>
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${tourId}`, {
                        method: "PUT",
                        credentials: "include",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({categoryId: null}),
                    })
                ),
            ];
            const responses = await Promise.all(updatePromises);

            const allSuccessful = responses.every(response => response.ok);
            if (!allSuccessful) {
                throw new Error("Failed to update some tours.");
            }
            await fetchCategories(tenantId);
            await fetchTours(tenantId);

            toast({
                title: "Tours Updated",
                description: "Tours were successfully updated for the category.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onManageClose();
        } catch (error) {
            console.error("Error updating tours:", error);
            toast({
                title: "Error",
                description: "Failed to update tours.",
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
                                        onChange={(e) =>
                                            setNewCategory({...newCategory, name: e.target.value})
                                        }
                                        placeholder="Enter Category Name"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Input
                                        value={newCategory.description}
                                        onChange={(e) =>
                                            setNewCategory({
                                                ...newCategory,
                                                description: e.target.value,
                                            })
                                        }
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
                        <Box
                            key={category.id}
                            p={4}
                            borderWidth={1}
                            borderRadius="md"
                            display="flex"
                            justifyContent="space-between"
                        >
                            <VStack align="start">
                                <Text fontWeight="bold">{category.name}</Text>
                                <Text>{category.description}</Text>
                            </VStack>
                            <HStack>
                                <Button
                                    colorScheme="teal"
                                    leftIcon={<SettingsIcon/>}
                                    onClick={() => handleManageTours(category)}
                                >
                                    Manage Tours
                                </Button>
                                <Button
                                    colorScheme="red"
                                    leftIcon={<DeleteIcon/>}
                                    onClick={() => handleDeleteCategory(category.id)}
                                >
                                    Delete
                                </Button>
                            </HStack>
                        </Box>
                    ))}
                </VStack>
                <Modal isOpen={isManageOpen} onClose={onManageClose} size="xl">
                    <ModalOverlay/>
                    <ModalContent>
                        <ModalHeader>
                            Manage Tours for {selectedCategory?.name}
                        </ModalHeader>
                        <ModalCloseButton/>
                        <ModalBody>
                            <FormControl mb={4}>
                                <FormLabel>Search Tours</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <SearchIcon color="gray.300"/>
                                    </InputLeftElement>
                                    <Input
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        placeholder="Search by name"
                                    />
                                </InputGroup>
                            </FormControl>

                            <CheckboxGroup
                                value={selectedTours}
                                onChange={(values: string[]) => setSelectedTours(values)}
                            >
                                <VStack align="start" maxH="400px" overflowY="auto">
                                    {filteredTours.map((tour) => (
                                        <HStack key={tour.id} spacing={4}>
                                            <Image
                                                boxSize="50px"
                                                src={tour.imageUrl || "https://via.placeholder.com/50"}
                                                alt={tour.name}
                                                borderRadius="md"
                                            />
                                            <Checkbox value={tour.id}>{tour.name}</Checkbox>
                                        </HStack>
                                    ))}
                                </VStack>
                            </CheckboxGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="outline" onClick={onManageClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue" onClick={handleSaveTours}>
                                Save
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </DashboardLayout>
    );
}
export default withAuth(CategoryManagement);