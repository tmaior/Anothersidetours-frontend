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
    Select,
    Text,
    useDisclosure,
    useToast,
    VStack,
    Checkbox,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function BlackoutDatesManagement() {
    const [blackoutDates, setBlackoutDates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newBlackoutDate, setNewBlackoutDate] = useState({
        date: "",
        categoryId: "",
        isGlobal: false,
    });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                const [blackoutResponse, categoryResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/blackout-dates`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
                ]);
                const [blackoutData, categoryData] = await Promise.all([
                    blackoutResponse.json(),
                    categoryResponse.json(),
                ]);
                setBlackoutDates(blackoutData);
                setCategories(categoryData);
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

    const handleCreateBlackoutDate = async () => {
        const { date, categoryId, isGlobal } = newBlackoutDate;

        if (!date) {
            toast({
                title: "Error",
                description: "Please select a date for the blackout.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (!isGlobal && !categoryId) {
            toast({
                title: "Error",
                description: "Please select a category for the blackout.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const formattedDate = new Date(date).toISOString();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blackout-dates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: formattedDate,
                    categoryId: isGlobal ? null : categoryId,
                    isGlobal,
                }),
            });

            if (!response.ok) throw new Error("Failed to create blackout date");

            const createdBlackoutDate = await response.json();
            setBlackoutDates((prev) => (Array.isArray(prev) ? [...prev, createdBlackoutDate] : [createdBlackoutDate]));

            setNewBlackoutDate({
                date: "",
                categoryId: "",
                isGlobal: false,
            });

            toast({
                title: "Blackout Date Created",
                description: "The blackout date was successfully created.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
        } catch (error) {
            console.error("Error creating blackout date:", error);
            toast({
                title: "Error",
                description: "Failed to create blackout date.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleRemoveBlackoutDate = async (id) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blackout-dates/${id}`, {
                method: "DELETE",
            });
            setBlackoutDates((prev) => prev.filter((date) => date.id !== id));
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
            <Box display="flex" justifyContent="center" alignItems="center" p={8}>
                <Box
                    bg="white"
                    p={8}
                    borderRadius="md"
                    boxShadow="md"
                    w="100%"
                    maxW="900px"
                >
                    <Flex justify="space-between" align="center" mb={8}>
                        <Heading>Blackout Dates Management</Heading>
                        <Button colorScheme="blue" onClick={onOpen}>
                            Add Blackout Date
                        </Button>
                    </Flex>

                    <VStack spacing={4}>
                        {Array.isArray(blackoutDates) && blackoutDates.length > 0 ? (
                            blackoutDates.map((date) => (
                                <Box key={date.id} p={4} borderWidth={1} borderRadius="md" w="100%">
                                    <Flex justify="space-between" align="center">
                                        <Box>
                                            <Text>
                                                <strong>Date:</strong> {new Date(date.date).toISOString().split("T")[0]}
                                            </Text>
                                            {date.isGlobal ? (
                                                <Text>
                                                    <strong>Type:</strong> Global
                                                </Text>
                                            ) : (
                                                <Text>
                                                    <strong>Category:</strong>{" "}
                                                    {date.category?.name || categories.find(cat => cat.id === date.categoryId)?.name || "No Category"}
                                                </Text>
                                            )}
                                        </Box>
                                        <Button
                                            colorScheme="red"
                                            size="sm"
                                            onClick={() => handleRemoveBlackoutDate(date.id)}
                                        >
                                            Remove
                                        </Button>
                                    </Flex>
                                </Box>
                            ))
                        ) : (
                            <Text>No blackout dates available.</Text>
                        )}
                    </VStack>

                    <Modal isOpen={isOpen} onClose={onClose}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Create Blackout Date</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <Input
                                    type="date"
                                    placeholder="Select Date"
                                    value={newBlackoutDate.date}
                                    onChange={(e) =>
                                        setNewBlackoutDate((prev) => ({
                                            ...prev,
                                            date: e.target.value,
                                        }))
                                    }
                                    mb={4}
                                />
                                <Checkbox
                                    isChecked={newBlackoutDate.isGlobal}
                                    onChange={(e) =>
                                        setNewBlackoutDate((prev) => ({
                                            ...prev,
                                            isGlobal: e.target.checked,
                                            categoryId: e.target.checked ? "" : prev.categoryId,
                                        }))
                                    }
                                    mb={4}
                                >
                                    Global Blackout
                                </Checkbox>
                                <Select
                                    placeholder="Select Category"
                                    value={newBlackoutDate.categoryId}
                                    onChange={(e) =>
                                        setNewBlackoutDate((prev) => ({
                                            ...prev,
                                            categoryId: e.target.value,
                                        }))
                                    }
                                    isDisabled={newBlackoutDate.isGlobal}
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button colorScheme="blue" onClick={handleCreateBlackoutDate}>
                                    Create
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </Box>
            </Box>
        </DashboardLayout>
    );
}
