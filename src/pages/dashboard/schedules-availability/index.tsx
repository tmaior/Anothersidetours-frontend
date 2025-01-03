import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
    Input,
    Select,
    Spacer,
    Switch,
    Text,
    useToast,
    VStack,
} from "@chakra-ui/react";
import {AddIcon, DeleteIcon} from "@chakra-ui/icons";
import React, {useState} from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import ProgressBar from "../../../components/ProgressBar";
import {useGuest} from "../../../components/GuestContext";
import {useRouter} from "next/router";
import withAuth from "../../../utils/withAuth";

function SchedulesAvailabilityPage() {
    const {
        schedule,
        setSchedule,
        eventDuration,
        setEventDuration,
        guestLimit,
        setGuestLimit,
        earlyArrival,
        setEarlyArrival,
        description,
        title,
        includedItems,
        bringItems,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        imageFile,
        imagePreview,
        price,
        setTitle,
        setDescription,
        setPrice,
        setIncludedItems,
        setBringItems,
        setImagePreview,
        operationProcedures,
        setOperationProcedures,
        tenantId
    } = useGuest();
    const router = useRouter();

    const resetFields = () => {
        setSchedule([]);
        setEventDuration(0);
        setGuestLimit(0);
        setEarlyArrival(false);
        setTitle("");
        setDescription("");
        setPrice(0);
        setIncludedItems([]);
        setBringItems([]);
        setImagePreview(null)
        setOperationProcedures("");
    };

    const [minPerEventLimit, setMinPerEventLimit] = useState(1);
    const [maxPerEventLimit, setMaxPerEventLimit] = useState(0);

    const handleAddTimeRange = () => {
        setSchedule([
            ...schedule,
            {startTime: "08:00", startPeriod: "AM", endTime: "06:00", endPeriod: "PM"},
        ]);
    };
    const toast = useToast();

    const handleRemoveTimeRange = (index: number) => {
        setSchedule(schedule.filter((_, i) => i !== index));
    };

    const handleTimeChange = (
        index: number,
        key: "startTime" | "endTime" | "startPeriod" | "endPeriod",
        value: string
    ) => {
        const updatedSchedule = [...schedule];
        updatedSchedule[index][key] = value;
        setSchedule(updatedSchedule);
    };

    const generateTimeSlots = (startTime, startPeriod, endTime, endPeriod) => {
        const convertTo24Hour = (time, period) => {
            let [hours, minutes] = time.split(":").map(Number);
            if (period === "PM" && hours < 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;
            return {hours, minutes};
        };

        const formatTime = (hours, minutes) => {
            const period = hours >= 12 ? "PM" : "AM";
            const formattedHours = ((hours % 12) || 12).toString().padStart(2, "0");
            const formattedMinutes = minutes.toString().padStart(2, "0");
            return `${formattedHours}:${formattedMinutes} ${period}`;
        };

        const start = convertTo24Hour(startTime, startPeriod);
        const end = convertTo24Hour(endTime, endPeriod);

        const timeSlots = [];
        let current = {...start};

        while (
            current.hours < end.hours ||
            (current.hours === end.hours && current.minutes < end.minutes)
            ) {
            timeSlots.push(formatTime(current.hours, current.minutes));

            current.minutes += 60;
            if (current.minutes >= 60) {
                current.hours += 1;
                current.minutes -= 60;
            }
        }

        if (
            current.hours === end.hours &&
            current.minutes === end.minutes
        ) {
            timeSlots.push(formatTime(current.hours, current.minutes));
        }

        return timeSlots;
    };

    const handleSaveTour = async () => {
        try {
            const tourResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: title,
                    description,
                    duration: Number(eventDuration),
                    imageUrl: imagePreview,
                    price: Number(price),
                    guestLimit: Number(guestLimit),
                    StandardOperation: operationProcedures,
                    minPerEventLimit: minPerEventLimit,
                    maxPerEventLimit: maxPerEventLimit,
                    tenantId: tenantId,
                }),
            });

            if (!tourResponse.ok) {
                throw new Error("Failed to create tour");
            }

            const createdTour = await tourResponse.json();
            const tourId = createdTour.id;

            const expandedTimeSlots = schedule.flatMap((slot) =>
                generateTimeSlots(slot.startTime, slot.startPeriod, slot.endTime, slot.endPeriod)
            );

            const scheduleResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/${tourId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({timeSlots: expandedTimeSlots}),
                }
            );

            if (!scheduleResponse.ok) {
                throw new Error("Failed to save schedule");
            }

            if (bringItems.length > 0) {
                await Promise.all(
                    bringItems.map((item) =>
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/what-to-bring`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({tourId: tourId, item}),
                        })
                    )
                );
            }

            if (includedItems.length > 0) {
                await Promise.all(
                    includedItems.map((item) =>
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/whats-included`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({tourId: tourId, item}),
                        })
                    )
                );
            }

            toast({
                title: "Tour Created",
                description: "The tour and related data were created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            resetFields();
            router.push("/");
        } catch (error) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: "Failed to create the tour. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };


    return (
        <DashboardLayout>
            <Box p={8} maxWidth="900px" mx="auto">
                <ProgressBar steps={["Description", "Schedules"]} currentStep={1}/>
                <Text fontSize="2xl" fontWeight="bold" mb={6}>
                    Schedules & Availability
                </Text>

                <VStack spacing={6} align="stretch">
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={2}>
                            Schedules
                        </Text>
                        <Text fontSize="sm" color="gray.600" mb={4}>
                            Build activity schedules that your Experiences are available to be booked by customers.
                        </Text>
                        <Flex gap={4}>
                            <FormControl w={"300px"}>
                                <FormLabel>Event Duration</FormLabel>
                                <Flex gap={2}>
                                    <Input
                                        type="number"
                                        value={eventDuration}
                                        onChange={(e) => setEventDuration(Number(e.target.value))}
                                    />
                                    <Select>
                                        <option value="hour">hour</option>
                                        <option value="minute">minute</option>
                                    </Select>
                                </Flex>
                            </FormControl>
                        </Flex>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Schedule
                        </Text>
                        <Button leftIcon={<AddIcon/>} colorScheme="blue" onClick={handleAddTimeRange}>
                            Add Time Range
                        </Button>
                        <VStack align="stretch" mt={4}>
                            {schedule.map((timeRange, index) => (
                                <HStack key={index} spacing={4} align="center">
                                    <Select
                                        value={timeRange.startTime?.split(":")[0] || ""}
                                        onChange={(e) =>
                                            handleTimeChange(
                                                index,
                                                "startTime",
                                                `${e.target.value}:${timeRange.startTime?.split(":")[1] || "00"}`
                                            )
                                        }
                                        width="100px"
                                    >
                                        {Array.from({length: 12}, (_, i) => (
                                            <option key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        value={timeRange.startTime?.split(":")[1] || ""}
                                        onChange={(e) =>
                                            handleTimeChange(
                                                index,
                                                "startTime",
                                                `${timeRange.startTime?.split(":")[0] || "12"}:${e.target.value}`
                                            )
                                        }
                                        width="100px"
                                    >
                                        {Array.from({length: 12}, (_, i) => (i * 5).toString().padStart(2, "0")).map((minute) => (
                                            <option key={minute} value={minute}>
                                                {minute}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        value={timeRange.startPeriod}
                                        onChange={(e) => handleTimeChange(index, "startPeriod", e.target.value)}
                                        width="80px"
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </Select>

                                    <Select
                                        value={timeRange.endTime?.split(":")[0] || ""}
                                        onChange={(e) =>
                                            handleTimeChange(
                                                index,
                                                "endTime",
                                                `${e.target.value}:${timeRange.endTime?.split(":")[1] || "00"}`
                                            )
                                        }
                                        width="100px"
                                    >
                                        {Array.from({length: 12}, (_, i) => (
                                            <option key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        value={timeRange.endTime?.split(":")[1] || ""}
                                        onChange={(e) =>
                                            handleTimeChange(
                                                index,
                                                "endTime",
                                                `${timeRange.endTime?.split(":")[0] || "12"}:${e.target.value}`
                                            )
                                        }
                                        width="100px"
                                    >
                                        {Array.from({length: 12}, (_, i) => (i * 5).toString().padStart(2, "0")).map((minute) => (
                                            <option key={minute} value={minute}>
                                                {minute}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        value={timeRange.endPeriod}
                                        onChange={(e) => handleTimeChange(index, "endPeriod", e.target.value)}
                                        width="80px"
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </Select>

                                    <IconButton
                                        icon={<DeleteIcon/>}
                                        colorScheme="red"
                                        onClick={() => handleRemoveTimeRange(index)}
                                        aria-label="Remove Time Range"
                                    />
                                </HStack>
                            ))}
                        </VStack>
                    </Box>

                    <Box>
                        <FormControl>
                            <HStack justify="space-between">
                                <Text>Early Arrival</Text>
                                <Switch
                                    isChecked={earlyArrival}
                                    onChange={(e) => setEarlyArrival(e.target.checked)}
                                />
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                Customers should arrive before scheduled time.
                            </Text>
                        </FormControl>
                    </Box>
                    <Divider/>
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={2}>
                            Guest Limits
                        </Text>
                        <FormControl isRequired>
                            <FormLabel>Min Per Event Limit</FormLabel>
                            <Input
                                type="number"
                                value={minPerEventLimit}
                                onChange={(e) => setMinPerEventLimit(Number(e.target.value))}
                            />
                        </FormControl>
                        <Spacer marginTop={"20px"}/>
                        <FormControl isRequired>
                            <FormLabel>Max Per Event Limit</FormLabel>
                            <Input
                                type="number"
                                value={maxPerEventLimit}
                                onChange={(e) => setMaxPerEventLimit(Number(e.target.value))}
                            />
                        </FormControl>
                    </Box>
                    <Divider/>
                    <HStack justify="space-between">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Back
                        </Button>
                        <Button colorScheme="blue" onClick={handleSaveTour}>
                            Save
                        </Button>
                    </HStack>
                </VStack>
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(SchedulesAvailabilityPage);