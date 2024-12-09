import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Switch,
    Text,
    useDisclosure,
    useToast,
    VStack,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {AddIcon, DeleteIcon} from "@chakra-ui/icons";
import DashboardLayout from "../../../components/DashboardLayout";

export default function BlackoutDatesManagement() {
    const [blackoutDates, setBlackoutDates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newBlackoutDate, setNewBlackoutDate] = useState({
        name: "",
        startDate: new Date(),
        endDate: null as Date | null,
        noEnd: true,
        isGlobal: false,
        categoryId: "",
        timeRanges: [] as { startTime: Date | null; endTime: Date | null }[],
    });
    const {isOpen, onOpen, onClose} = useDisclosure();
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

    const handleAddTimeRange = () => {
        setNewBlackoutDate((prev) => ({
            ...prev,
            timeRanges: [...prev.timeRanges, {startTime: null, endTime: null}],
        }));
    };

    const handleRemoveTimeRange = (index: number) => {
        setNewBlackoutDate((prev) => ({
            ...prev,
            timeRanges: prev.timeRanges.filter((_, i) => i !== index),
        }));
    };

    const handleRemoveBlackoutDate = (id: string) => {
        setBlackoutDates((prev) => prev.filter((date) => date.id !== id));
        toast({
            title: "Removed",
            description: "Blackout date removed successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleCreateBlackoutDate = async () => {
        const {name, startDate, endDate, noEnd, isGlobal, categoryId, timeRanges} = newBlackoutDate;

        if (!name) {
            toast({
                title: "Error",
                description: "Please enter a name for the blackout.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (!isGlobal && !categoryId) {
            toast({
                title: "Error",
                description: "Please select a category for the blackout if it's not global.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const newDate = {
            id: Date.now().toString(),
            name,
            startDate,
            endDate: noEnd ? null : endDate,
            isGlobal,
            categoryId: isGlobal ? null : categoryId,
            timeRanges,
        };

        setBlackoutDates((prev) => [...prev, newDate]);
        setNewBlackoutDate({
            name: "",
            startDate: new Date(),
            endDate: null,
            noEnd: true,
            isGlobal: false,
            categoryId: "",
            timeRanges: [],
        });

        toast({
            title: "Blackout Date Created",
            description: "The blackout date was successfully created.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });

        onClose();
    };

    return (
        <DashboardLayout>
            <Box display="flex" justifyContent="center" alignItems="center" p={8}>
                <Box bg="white" p={8} borderRadius="md" boxShadow="md" w="100%" maxW="900px">
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
                                                <strong>Name:</strong> {date.name}
                                            </Text>
                                            <Text>
                                                <strong>Global:</strong> {date.isGlobal ? "Yes" : "No"}
                                            </Text>
                                            {date.categoryId && (
                                                <Text>
                                                    <strong>Category:</strong>{" "}
                                                    {categories.find((cat) => cat.id === date.categoryId)?.name || "No Category"}
                                                </Text>
                                            )}
                                            {date.startDate && (
                                                <Text>
                                                    <strong>Start Date:</strong>{" "}
                                                    {new Date(date.startDate).toLocaleDateString()}
                                                </Text>
                                            )}
                                            {date.endDate ? (
                                                <Text>
                                                    <strong>End Date:</strong>{" "}
                                                    {new Date(date.endDate).toLocaleDateString()}
                                                </Text>
                                            ) : (
                                                <Text>
                                                    <strong>End Date:</strong> No End
                                                </Text>
                                            )}
                                            {date.timeRanges?.length > 0 && (
                                                <Box mt={2}>
                                                    <Text fontWeight="bold">Time Ranges:</Text>
                                                    <VStack align="start" spacing={1}>
                                                        {date.timeRanges.map((range, index) => (
                                                            <Text key={index}>
                                                                {new Date(range.startTime).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })}{" "}
                                                                -{" "}
                                                                {new Date(range.endTime).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })}
                                                            </Text>
                                                        ))}
                                                    </VStack>
                                                </Box>
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

                    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                        <ModalOverlay/>
                        <ModalContent>
                            <ModalHeader>Create Blackout Date</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody>
                                <VStack spacing={4} align="stretch">
                                    <Input
                                        placeholder="Enter Name"
                                        value={newBlackoutDate.name}
                                        onChange={(e) =>
                                            setNewBlackoutDate((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                    />
                                    <HStack spacing={4}>
                                        <Box>
                                            <Text>Start Date</Text>
                                            <DatePicker
                                                selected={newBlackoutDate.startDate}
                                                onChange={(date: Date) =>
                                                    setNewBlackoutDate((prev) => ({
                                                        ...prev,
                                                        startDate: date,
                                                    }))
                                                }
                                                dateFormat="dd/MM/yyyy"
                                                customInput={<Input/>}
                                            />
                                        </Box>
                                        <Box>
                                            <Text>End Date</Text>
                                            <DatePicker
                                                selected={newBlackoutDate.endDate}
                                                onChange={(date: Date | null) =>
                                                    setNewBlackoutDate((prev) => ({
                                                        ...prev,
                                                        endDate: date,
                                                        noEnd: !date,
                                                    }))
                                                }
                                                dateFormat="dd/MM/yyyy"
                                                customInput={<Input/>}
                                                isClearable
                                            />
                                        </Box>
                                        <Switch
                                            isChecked={newBlackoutDate.noEnd}
                                            onChange={(e) =>
                                                setNewBlackoutDate((prev) => ({
                                                    ...prev,
                                                    noEnd: e.target.checked,
                                                    endDate: e.target.checked ? null : prev.endDate,
                                                }))
                                            }
                                        >
                                            No End
                                        </Switch>
                                    </HStack>
                                    <Checkbox
                                        isChecked={newBlackoutDate.isGlobal}
                                        onChange={(e) =>
                                            setNewBlackoutDate((prev) => ({
                                                ...prev,
                                                isGlobal: e.target.checked,
                                                categoryId: e.target.checked ? "" : prev.categoryId,
                                            }))
                                        }
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
                                    <Text fontWeight="bold">Time Range (Optional)</Text>
                                    <VStack spacing={3} align="stretch">
                                        {newBlackoutDate.timeRanges.map((range, index) => (
                                            <HStack key={index} spacing={4}>
                                                <DatePicker
                                                    selected={range.startTime}
                                                    onChange={(time: Date | null) =>
                                                        setNewBlackoutDate((prev) => {
                                                            const updatedRanges = [...prev.timeRanges];
                                                            updatedRanges[index].startTime = time;
                                                            return {...prev, timeRanges: updatedRanges};
                                                        })
                                                    }
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={30}
                                                    timeCaption="Start Time"
                                                    dateFormat="hh:mm aa"
                                                    customInput={<Input/>}
                                                />
                                                <DatePicker
                                                    selected={range.endTime}
                                                    onChange={(time: Date | null) =>
                                                        setNewBlackoutDate((prev) => {
                                                            const updatedRanges = [...prev.timeRanges];
                                                            updatedRanges[index].endTime = time;
                                                            return {...prev, timeRanges: updatedRanges};
                                                        })
                                                    }
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    timeIntervals={30}
                                                    timeCaption="End Time"
                                                    dateFormat="hh:mm aa"
                                                    customInput={<Input/>}
                                                />
                                                <IconButton
                                                    icon={<DeleteIcon/>}
                                                    colorScheme="red"
                                                    onClick={() => handleRemoveTimeRange(index)}
                                                    aria-label="Remove time range"
                                                />
                                            </HStack>
                                        ))}
                                        <Button
                                            leftIcon={<AddIcon/>}
                                            colorScheme="blue"
                                            onClick={handleAddTimeRange}
                                        >
                                            Add Time Range
                                        </Button>
                                    </VStack>
                                </VStack>
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
