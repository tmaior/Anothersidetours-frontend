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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout"; // Ajuste o caminho conforme necessário.

export default function BlackoutDatesManagement() {
    const [blackoutDates, setBlackoutDates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newBlackoutDate, setNewBlackoutDate] = useState({
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        categoryId: "",
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
        const { startDate, endDate, startTime, endTime, categoryId } = newBlackoutDate;

        if (!startDate || !endDate || (startTime && !endTime) || (!startTime && endTime)) {
            toast({
                title: "Error",
                description: "Please fill in all required fields correctly.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blackout-dates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    startTime,
                    endTime,
                    categoryId: categoryId || null,
                }),
            });

            if (!response.ok) throw new Error("Failed to create blackout date");

            const createdBlackoutDate = await response.json();
            setBlackoutDates((prev) => [...prev, createdBlackoutDate]);
            setNewBlackoutDate({
                startDate: "",
                endDate: "",
                startTime: "",
                endTime: "",
                categoryId: "",
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
                        {blackoutDates.map((date) => (
                            <Box key={date.id} p={4} borderWidth={1} borderRadius="md" w="100%">
                                <Flex justify="space-between" align="center">
                                    <Box>
                                        <Text>
                                            <strong>Date:</strong> {date.startDate} to {date.endDate}
                                        </Text>
                                        {date.startTime && date.endTime && (
                                            <Text>
                                                <strong>Time:</strong> {date.startTime} - {date.endTime}
                                            </Text>
                                        )}
                                        {date.category && (
                                            <Text>
                                                <strong>Category:</strong> {date.category.name}
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
                        ))}
                    </VStack>

                    <Modal isOpen={isOpen} onClose={onClose}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Create Blackout Date</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <Input
                                    type="date"
                                    placeholder="Start Date"
                                    value={newBlackoutDate.startDate}
                                    onChange={(e) =>
                                        setNewBlackoutDate((prev) => ({
                                            ...prev,
                                            startDate: e.target.value,
                                        }))
                                    }
                                    mb={4}
                                />
                                <Input
                                    type="date"
                                    placeholder="End Date"
                                    value={newBlackoutDate.endDate}
                                    onChange={(e) =>
                                        setNewBlackoutDate((prev) => ({
                                            ...prev,
                                            endDate: e.target.value,
                                        }))
                                    }
                                    mb={4}
                                />
                                <Flex mb={4}>
                                    <Input
                                        type="time"
                                        placeholder="Start Time"
                                        value={newBlackoutDate.startTime}
                                        onChange={(e) =>
                                            setNewBlackoutDate((prev) => ({
                                                ...prev,
                                                startTime: e.target.value,
                                            }))
                                        }
                                        mr={2}
                                    />
                                    <Input
                                        type="time"
                                        placeholder="End Time"
                                        value={newBlackoutDate.endTime}
                                        onChange={(e) =>
                                            setNewBlackoutDate((prev) => ({
                                                ...prev,
                                                endTime: e.target.value,
                                            }))
                                        }
                                    />
                                </Flex>
                                <Select
                                    placeholder="Select Category (optional)"
                                    value={newBlackoutDate.categoryId}
                                    onChange={(e) =>
                                        setNewBlackoutDate((prev) => ({
                                            ...prev,
                                            categoryId: e.target.value,
                                        }))
                                    }
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
