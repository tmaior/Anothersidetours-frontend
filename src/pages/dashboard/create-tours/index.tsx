import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Image,
    Input,
    Select,
    Spacer,
    Switch,
    Text,
    Textarea,
    useToast,
    VStack
} from "@chakra-ui/react";
import {AddIcon, DeleteIcon} from "@chakra-ui/icons";
import {useGuest} from "../../../components/GuestContext";
import DashboardLayout from "../../../components/DashboardLayout";
import ProgressBar from "../../../components/ProgressBar";
import withAuth from "../../../utils/withAuth";
import {useRouter} from "next/router";
import Demographics from "../../../components/Demographics";
import PricingTable from "../../../components/PricingTable";
import CustomerQuestionnaire from "../../../components/CustomerQuestionnaire";

function DescriptionContentStep({onNext}: { onNext: () => void }) {
    const [newIncludedItem, setNewIncludedItem] = useState("");
    const [newBringItem, setNewBringItem] = useState("");
    const [sopNotes, setSopNotes] = useState("");
    const [meetingLocation, setMeetingLocation] = useState("");
    const [mapEnabled, setMapEnabled] = useState(false);
    const router = useRouter();

    const {
        title,
        setTitle,
        description,
        setDescription,
        includedItems,
        setIncludedItems,
        bringItems,
        setBringItems,
        setOperationProcedures,
        operationProcedures,
        setImageFile,
        imagePreview,
        setImagePreview,
        price,
        setPrice,
        tourId,
        setTourId,
    } = useGuest();

    const toast = useToast();

    const [errors, setErrors] = useState({
        title: false,
        description: false,
        price: false,
    });

    const [formData, setFormData] = useState({
        title: title || "",
        description: description || "",
        price: price ? parseFloat(price.toString()) : 0,
    });

    useEffect(() => {
        setFormData({
            title: title || "",
            description: description || "",
            price: price ? parseFloat(price.toString()) : 0,
        });
        setNewIncludedItem("");
        setNewBringItem("");
        setSopNotes(operationProcedures || "");
        setMeetingLocation(meetingLocation || "");
        setMapEnabled(false);
    }, []);

    useEffect(() => {
        const data = {
            includedItems,
            bringItems,
            newIncludedItem,
            newBringItem,
            title,
            description,
            sopNotes,
            meetingLocation,
            mapEnabled,
        };
        localStorage.setItem("descriptionContentData", JSON.stringify(data));
    }, [
        includedItems,
        bringItems,
        newIncludedItem,
        newBringItem,
        imagePreview,
        title,
        description,
        sopNotes,
        meetingLocation,
        mapEnabled,
        operationProcedures
    ]);

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] || null;
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleRemoveImage() {
        setImageFile(null);
        setImagePreview(null);
    }

    function handleAddIncludedItem() {
        if (newIncludedItem.trim()) {
            setIncludedItems([...includedItems, newIncludedItem.trim()]);
            setNewIncludedItem("");
        }
    }

    function handleAddBringItem() {
        if (newBringItem.trim()) {
            setBringItems([...bringItems, newBringItem.trim()]);
            setNewBringItem("");
        }
    }

    function handleRemoveIncludedItem(index: number) {
        setIncludedItems(includedItems.filter((_, i) => i !== index));
    }

    function handleRemoveBringItem(index: number) {
        setBringItems(bringItems.filter((_, i) => i !== index));
    }

    function validateForm() {
        const newErrors = {
            title: formData.title.trim() === "",
            description: formData.description.trim() === "",
            price: formData.price <= 0,
        };
        setErrors(newErrors);
        return !Object.values(newErrors).includes(true);
    }

    function handleNextClick() {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the highlighted fields before proceeding.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        setTitle(formData.title);
        setDescription(formData.description);
        setPrice(formData.price);
        onNext();
    }

    function handleCancelClick() {
        resetFields();
        router.push("/dashboard/list-tours");
    }

    function resetFields() {
        setTitle("");
        setDescription("");
        setPrice(0);
        setIncludedItems([]);
        setBringItems([]);
        setNewIncludedItem("");
        setNewBringItem("");
        setOperationProcedures("");
        setImagePreview(null);
        setImageFile(null);
    }

    function handleFormChange(field: keyof typeof formData, value: string | number) {
        let numericValue = 0;

        if (field === "price") {
            numericValue = parseFloat(value.toString()) || 0;
            setPrice(numericValue);
        }
        setFormData((prev) => ({...prev, [field]: value}));

        setErrors((prev) => ({
            ...prev,
            [field]: value === "" || (field === "price" && Number(value) <= 0),
        }));
        if (field === "title") setTitle(value as string);
        if (field === "description") setDescription(value as string);
    }

    return (
        <Box
            width="100vw"
            height="100vh"
            overflow="hidden">
            <DashboardLayout>
                <Box
                    p={8}
                    maxWidth="2000px"
                    mx="auto"
                    maxHeight="1000px"
                    overflowY="auto"
                    css={{
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: 'rgba(0, 0, 0, 0.5)',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                    }}
                >
                    <ProgressBar steps={["Description", "Schedules"]} currentStep={0}/>
                    <Heading mb={6}>Description Content</Heading>

                    <Box mb={8}>
                        <Text fontSize="lg" fontWeight="bold">
                            Experience Description
                        </Text>
                        <Text fontSize="sm" color="gray.600" mb={4}>
                            Important details that will be presented to your customer throughout the
                            booking process
                        </Text>

                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired isInvalid={errors.title}>
                                <FormLabel>Title</FormLabel>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleFormChange("title", e.target.value)}
                                    placeholder="Enter Title"
                                />
                                {errors.title && (
                                    <Text color="red.500">This field is required</Text>
                                )}
                            </FormControl>

                            <FormControl isRequired isInvalid={errors.description}>
                                <FormLabel>Excerpt</FormLabel>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleFormChange("description", e.target.value)}
                                    placeholder="Enter Description"
                                />
                                {errors.description && (
                                    <Text color="red.500">This field is required</Text>
                                )}
                            </FormControl>

                            <Box>
                                <Text fontSize="sm" mb={1}>
                                    Standard Operating Procedure (SOP)
                                </Text>
                                <Textarea
                                    placeholder="Write the Standard operating procedure"
                                    resize="none"
                                    isRequired
                                    value={operationProcedures}
                                    onChange={(e) => setOperationProcedures(e.target.value)}
                                />
                                <Text fontSize="xs" color="gray.500">
                                    0 characters | 0 words
                                </Text>
                            </Box>

                            <FormControl mb={4}>
                                <FormLabel>Photos</FormLabel>
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    You can add images to each product with a max size of 5 MB. Suggested pixel
                                    dimensions 1024×768
                                </Text>
                                <HStack spacing={4} align="center">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            boxSize="150px"
                                            objectFit="cover"
                                            borderRadius="md"
                                        />
                                    ) : (
                                        <Box
                                            border="2px dashed"
                                            borderColor="gray.300"
                                            p={4}
                                            borderRadius="md"
                                            width="150px"
                                            textAlign="center"
                                        >
                                            <Text>The Image</Text>
                                        </Box>
                                    )}
                                    <Input
                                        type="file"
                                        accept="image/jpeg, image/png"
                                        onChange={handleImageChange}
                                        display="none"
                                        id="image-upload"
                                    />
                                    <VStack>
                                        <Button
                                            variant="outline"
                                            colorScheme="blue"
                                            onClick={() => document.getElementById("image-upload")?.click()}
                                        >
                                            Upload Image
                                        </Button>
                                        {imagePreview && (
                                            <Button
                                                variant="outline"
                                                colorScheme="red"
                                                onClick={handleRemoveImage}
                                            >
                                                Remove Image
                                            </Button>
                                        )}
                                    </VStack>
                                </HStack>
                                <Divider my={6}/>

                                <Flex align="center">
                                    <Text fontSize="sm" mb={1} flex="1">
                                        Meeting Location is required
                                    </Text>
                                    <Switch
                                        colorScheme="teal"
                                        isChecked={mapEnabled}
                                        onChange={(e) => setMapEnabled(e.target.checked)}
                                    />
                                    <Button ml={2}>Enable Map</Button>
                                </Flex>
                                <Input
                                    marginTop={"10px"}
                                    placeholder="Enter meeting location"
                                    value={meetingLocation}
                                    onChange={(e) => setMeetingLocation(e.target.value)}
                                />
                                <Divider my={6}/>
                            </FormControl>

                            <Demographics tourId={tourId}/>
                            <PricingTable/>
                            <CustomerQuestionnaire/>
                            <FormControl isRequired isInvalid={errors.price}>
                                <FormLabel>Price</FormLabel>
                                <HStack>
                                    <Input
                                        value={formData.price}
                                        onChange={(e) => handleFormChange("price", e.target.value)}
                                        onBlur={(e) => {
                                            const value = parseFloat(e.target.value);
                                            if (!isNaN(value)) {
                                                handleFormChange("price", value.toFixed(2));
                                            }
                                        }}
                                        placeholder="$"
                                        width="auto"
                                        type="number"
                                        step="0.01"
                                    />
                                </HStack>
                                {errors.price && (
                                    <Text color="red.500">
                                        This field is required and must be greater than 0
                                    </Text>
                                )}
                            </FormControl>

                            <Heading as="h3" size="md" mb={4}>
                                Checklist
                            </Heading>
                            <HStack spacing={4}>
                                <Box flex="1">
                                    <Text fontSize="sm" mb={1}>
                                        What&#39;s Included
                                    </Text>
                                    <Flex>
                                        <Input
                                            placeholder="Add Item"
                                            value={newIncludedItem}
                                            onChange={(e) => setNewIncludedItem(e.target.value)}
                                        />
                                        <IconButton
                                            icon={<AddIcon/>}
                                            ml={2}
                                            onClick={handleAddIncludedItem}
                                            aria-label={""}
                                        />
                                    </Flex>
                                    <VStack align="stretch" mt={2}>
                                        {includedItems.map((item, index) => (
                                            <Flex key={index} align="center" justify="space-between">
                                                <Text>{item}</Text>
                                                <Button
                                                    size="sm"
                                                    colorScheme="red"
                                                    onClick={() => handleRemoveIncludedItem(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>
                                <Box flex="1">
                                    <Text fontSize="sm" mb={1}>
                                        What to Bring
                                    </Text>
                                    <Flex>
                                        <Input
                                            placeholder="Add Item"
                                            value={newBringItem}
                                            onChange={(e) => setNewBringItem(e.target.value)}
                                        />
                                        <IconButton
                                            icon={<AddIcon/>}
                                            ml={2}
                                            onClick={handleAddBringItem}
                                            aria-label={""}
                                        />
                                    </Flex>
                                    <VStack align="stretch" mt={2}>
                                        {bringItems.map((item, index) => (
                                            <Flex key={index} align="center" justify="space-between">
                                                <Text>{item}</Text>
                                                <Button
                                                    size="sm"
                                                    colorScheme="red"
                                                    onClick={() => handleRemoveBringItem(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>
                            </HStack>
                            <Divider my={6}/>
                        </VStack>
                    </Box>
                    <HStack justify="space-between" mt={8}>
                        <Button
                            variant="outline"
                            colorScheme="gray"
                            onClick={handleCancelClick}
                        >
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleNextClick}>
                            Next
                        </Button>
                    </HStack>
                </Box>
            </DashboardLayout>
        </Box>
    );
}

interface SchedulesAvailabilityStepProps {
    onBack: () => void;
    isEditing?: boolean;
}

function SchedulesAvailabilityStep({
                                       onBack,
                                       isEditing = false,
                                   }: SchedulesAvailabilityStepProps) {
    const router = useRouter();

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
        tenantId,
        setTourId
    } = useGuest();

    const toast = useToast();

    const [minPerEventLimit, setMinPerEventLimit] = useState(1);
    const [maxPerEventLimit, setMaxPerEventLimit] = useState(0);

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
        setImagePreview(null);
        setOperationProcedures("");
    };

    function handleAddTimeRange() {
        setSchedule([
            ...schedule,
            {startTime: "08:00", startPeriod: "AM", endTime: "06:00", endPeriod: "PM"},
        ]);
    }

    function handleRemoveTimeRange(index: number) {
        setSchedule(schedule.filter((_, i) => i !== index));
    }

    function handleTimeChange(
        index: number,
        key: "startTime" | "endTime" | "startPeriod" | "endPeriod",
        value: string
    ) {
        const updatedSchedule = [...schedule];
        updatedSchedule[index][key] = value;
        setSchedule(updatedSchedule);
    }

    function generateTimeSlots(startTime, startPeriod, endTime, endPeriod) {
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

        if (current.hours === end.hours && current.minutes === end.minutes) {
            timeSlots.push(formatTime(current.hours, current.minutes));
        }

        return timeSlots;
    }

    async function handleSaveTour() {
        try {
            const method = isEditing ? "PUT" : "POST";
            const {id} = router.query;

            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/tours`;

            const tourResponse = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
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
                    tenantId: tenantId
                })
            });

            if (!tourResponse.ok) {
                throw new Error("Failed to create tour");
            }

            const savedTour = await tourResponse.json();
            const tourId = savedTour.id;

            setTourId(tourId);

            const expandedTimeSlots = schedule.flatMap((slot) =>
                generateTimeSlots(slot.startTime, slot.startPeriod, slot.endTime, slot.endPeriod)
            );

            const scheduleResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/${tourId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({timeSlots: expandedTimeSlots})
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
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({tourId, item})
                        })
                    )
                );
            }

            if (includedItems.length > 0) {
                await Promise.all(
                    includedItems.map((item) =>
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/whats-included`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({tourId, item})
                        })
                    )
                );
            }

            toast({
                title: "Tour Created",
                description: "The tour and related data were created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true
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
                isClosable: true
            });
        }
    }

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
                                        {Array.from({length: 12}, (_, i) => i + 1).map((hour) => (
                                            <option key={hour} value={hour.toString().padStart(2, "0")}>
                                                {hour}
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
                                        {Array.from({length: 12}, (_, i) => i * 5)
                                            .map((m) => m.toString().padStart(2, "0"))
                                            .map((minute) => (
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
                                        {Array.from({length: 12}, (_, i) => i + 1).map((hour) => (
                                            <option key={hour} value={hour.toString().padStart(2, "0")}>
                                                {hour}
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
                                        {Array.from({length: 12}, (_, i) => i * 5)
                                            .map((m) => m.toString().padStart(2, "0"))
                                            .map((minute) => (
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
                        <Button
                            variant="outline"
                            onClick={() => {
                                onBack();
                            }}
                        >
                            Back
                        </Button>
                        <Button colorScheme="blue" onClick={handleSaveTour}>
                            {isEditing ? "Save Changes" : "Save"}
                        </Button>
                    </HStack>
                </VStack>
            </Box>
        </DashboardLayout>
    );
}

function CreateToursPage({isEditing = false}: { isEditing?: boolean }) {
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (!isEditing) {
            resetFields();
        }
    }, [isEditing]);

    const {
        setSchedule,
        setEventDuration,
        setGuestLimit,
        setEarlyArrival,
        setTitle,
        setDescription,
        setPrice,
        setIncludedItems,
        setBringItems,
        setImagePreview,
        setImageFile,
        setOperationProcedures,
    } = useGuest();

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
        setImagePreview(null);
        setOperationProcedures("");
        setTitle("");
        setDescription("");
        setPrice(0);
        setIncludedItems([]);
        setBringItems([]);
        setOperationProcedures("");
        setImagePreview(null);
        setImageFile(null);
        setSchedule([]);
        setEventDuration(0);
        setGuestLimit(0);
        setEarlyArrival(false);
        setTitle("");
        setDescription("");
        setPrice(0);
        setIncludedItems([]);
        setBringItems([]);
        setImagePreview(null);
        setOperationProcedures("");
    };

    useEffect(() => {
        resetFields();
    }, []);

    if (currentStep === 1) {
        return <DescriptionContentStep onNext={() => setCurrentStep(2)}/>;
    } else {
        return (
            <SchedulesAvailabilityStep
                onBack={() => {
                    setCurrentStep(1);
                }}
                isEditing={isEditing}
            />
        );
    }
}

export default withAuth(CreateToursPage);