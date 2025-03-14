import React, {useEffect, useRef, useState, useCallback} from "react";
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
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Radio,
    RadioGroup,
    Select,
    Spacer,
    Stack,
    Switch,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
import {AddIcon, DeleteIcon, DragHandleIcon, EditIcon} from "@chakra-ui/icons";
import {useGuest} from "../../../contexts/GuestContext";
import DashboardLayout from "../../../components/DashboardLayout";
import ProgressBar from "../../../components/ProgressBar";
import withAuth from "../../../utils/withAuth";
import {useRouter} from "next/router";
import CustomerQuestionnaire, {QuestionnaireRef} from "../../../components/CustomerQuestionnaire";
import {useDemographics} from "../../../contexts/DemographicsContext";
import axios from "axios";

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
        cancellationPolicy,
        setCancellationPolicy,
        considerations,
        setConsiderations
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
        setCancellationPolicy(cancellationPolicy || "");
        setConsiderations(considerations || "");
        setMapEnabled(false);
    }, [cancellationPolicy, considerations, description, meetingLocation, operationProcedures, price, setCancellationPolicy,setConsiderations, title]);

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
        operationProcedures,
        cancellationPolicy,
        considerations
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
        setOperationProcedures(sopNotes);
        setCancellationPolicy(cancellationPolicy);
        setConsiderations(considerations);
        onNext();
    }

    function handleCancelClick() {
        resetFields();
        router.push("/dashboard/list-tours");
    }

    const resetFields = useCallback(() => {
        setTitle("");
        setDescription("");
        setPrice(0);
        setIncludedItems([]);
        setBringItems([]);
        setNewIncludedItem("");
        setNewBringItem("");
        setOperationProcedures("");
        setCancellationPolicy("");
        setConsiderations("");
        setImagePreview(null);
        setImageFile(null);
    }, [setTitle, setDescription, setPrice, setIncludedItems, setBringItems, setNewIncludedItem, setNewBringItem, setOperationProcedures, setCancellationPolicy, setConsiderations, setImagePreview, setImageFile]);

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
                    maxHeight="850px"
                    overflowY="auto"
                    flex="1"
                    pb="150px"
                    marginRight={"-30px"}
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

                            <Box>
                                <Text fontSize="sm" mb={1}>
                                    Cancellation Policy
                                </Text>
                                <Textarea
                                    placeholder="Write the cancellation policy"
                                    isRequired
                                    value={cancellationPolicy}
                                    onChange={(e) => setCancellationPolicy(e.target.value)}
                                />
                                <Text fontSize="xs" color="gray.500">
                                    0 characters | 0 words
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="sm" mb={1}>
                                    Considerations
                                </Text>
                                <Textarea
                                    placeholder="Write any special considerations"
                                    isRequired
                                    value={considerations}
                                    onChange={(e) => setConsiderations(e.target.value)}
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

interface Demographic {
    id: string;
    name: string;
    caption?: string;
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
        imageFile,
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
        setTourId,
        tourId,
        cancellationPolicy,
        considerations,
        setCancellationPolicy,
        setConsiderations
    } = useGuest();

    const toast = useToast();

    const [minPerEventLimit, setMinPerEventLimit] = useState(1);
    const [maxPerEventLimit, setMaxPerEventLimit] = useState(0);

    const questionnaireRef = useRef<QuestionnaireRef>(null);
    const resetFields = useCallback(() => {
        setSchedule([]);
        setEventDuration('');
        setGuestLimit(0);
        setEarlyArrival(false);
        setTitle("");
        setDescription("");
        setPrice(0);
        setIncludedItems([]);
        setBringItems([]);
        setImagePreview(null);
        setOperationProcedures("");
        setCancellationPolicy("");
        setConsiderations("");
        
        if (questionnaireRef.current) {
            questionnaireRef.current.resetQuestions();
        }
    }, [setSchedule, setEventDuration, setGuestLimit, setEarlyArrival, setTitle, setDescription, 
        setPrice, setIncludedItems, setBringItems, setImagePreview, 
        setOperationProcedures, setCancellationPolicy, setConsiderations]);

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
            const [hours, minutes] = time.split(":").map(Number);
            let adjustedHours = hours;

            if (period === "PM" && hours < 12) adjustedHours += 12;
            if (period === "AM" && hours === 12) adjustedHours = 0;

            return {hours: adjustedHours, minutes};
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
        const current = {...start};

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

            let imageUrlToSave = imagePreview;
            if (imageFile) {
                try {
                    const formData = new FormData();
                    formData.append("file", imageFile);
                    
                    const uploadResponse = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    
                    if (uploadResponse.data && uploadResponse.data.url) {
                        imageUrlToSave = uploadResponse.data.url;
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    toast({
                        title: "Error sending image",
                        description: "The tour will be saved without an image.",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }

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
                    imageUrl: imageUrlToSave,
                    price: Number(price),
                    guestLimit: Number(guestLimit),
                    StandardOperation: operationProcedures,
                    Cancellation_Policy: cancellationPolicy,
                    Considerations: considerations,
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

            const demographics = await handleSaveDemographics(savedTour.id);

            await handleSavePricing(savedTour.id, demographics, pricingStructure);

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

            if (questionnaireRef.current) {
                const questions = questionnaireRef.current.getQuestions();
                
                if (questions.length > 0) {
                    await Promise.all(
                        questions.map(question =>
                            fetch(`${process.env.NEXT_PUBLIC_API_URL}/additional-information`, {
                                method: "POST",
                                headers: {"Content-Type": "application/json"},
                                body: JSON.stringify({
                                    tourId,
                                    title: question.label
                                })
                            })
                        )
                    );
                }
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [tourDemographics, setTourDemographics] = useState<Demographic[]>([]);
    const [availableDemographics, setAvailableDemographics] = useState<Demographic[]>([]);
    const [selectedDemographics, setSelectedDemographics] = useState<Demographic[]>([]);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {isOpen: isModalOpen, onOpen: openModal, onClose: closeModal} = useDisclosure();
    const [newDemographic, setNewDemographic] = useState({name: "", caption: ""});
    const {addDemographic, removeDemographic} = useDemographics();

    const fetchTourDemographics = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demographics/demographicByTourId/${tourId}`);
            const data = await response.json();
            if (data && Array.isArray(data)) {
                setSelectedDemographics(data);
            }
        } catch (error) {
            console.error("Error fetching tour demographics:", error);
            toast({
                title: "Error",
                description: "Failed to load tour demographics",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }, [tourId, toast]);

    useEffect(() => {
        if (tourId) {
            fetchTourDemographics();
        }
    }, [tourId, fetchTourDemographics]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/demographics/tenant/${tenantId}`)
            .then((res) => res.json())
            .then((data) => setAvailableDemographics(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error fetching available demographics:", err));
    }, [tenantId]);

    const handleSelectDemographic = (selectedId) => {
        const selectedDemo = availableDemographics.find((demo) => demo.id === selectedId);
        if (selectedDemo && !selectedDemographics.find((demo) => demo.id === selectedId)) {
            setSelectedDemographics([...selectedDemographics, selectedDemo]);
            addDemographic(selectedDemo);
        }
        onClose();
    };

    const handleRemoveDemographic = (id) => {
        setSelectedDemographics(selectedDemographics.filter((demo) => demo.id !== id));
        removeDemographic(id);
    };

    const handleSaveDemographics = async (tourId) => {
        if (!tourId) {
            console.error("Tour ID is missing. Cannot save demographics.");
            return [];
        }

        if (selectedDemographics.length === 0) {
            console.warn("No demographics selected, skipping demographic saving.");
            return [];
        }

        try {
            const savedDemographics = [];

            await Promise.all(
                selectedDemographics.map(async (demo) => {
                    if (!demo.id) {
                        console.warn(`Skipping demographic with missing ID:`, demo);
                        return;
                    }

                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/demographics/assign-to-tour`,
                        {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                tourId,
                                demographicId: demo.id,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to assign demographic ${demo.name} to tour.`);
                    }

                    savedDemographics.push(demo);
                })
            );

            console.log("Demographics assigned:", savedDemographics);

            toast({
                title: "Demographics Saved",
                description: "Successfully added demographics to the tour.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            return savedDemographics;

        } catch (error) {
            console.error("Error saving demographics:", error);
            toast({
                title: "Error",
                description: "Could not save demographics.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return [];
        }
    };

    const handleSavePricing = async (tourId, demographics, pricingType) => {
        if (!tourId) {
            console.error("Tour ID is missing. Cannot save pricing.");
            return;
        }

        if (!demographics || demographics.length === 0) {
            console.warn("No demographics found, skipping pricing save.");
            return;
        }

        try {
            await Promise.all(
                demographics.map(async (demo) => {
                    const demographicId = demo.id;
                    let bodyData;

                    if (pricingType === "flat") {
                        bodyData = {
                            tourId,
                            demographicId,
                            pricingType: "flat",
                            basePrice: basePrices[demographicId] || 0,
                        };
                    } else if (pricingType === "tiered") {
                        console.log("Tiered Pricing Data:", tiers);

                        if (!tiers || tiers.length === 0) {
                            console.warn("No tiers found, skipping tiered pricing save.");
                            return;
                        }

                        bodyData = {
                            tourId,
                            demographicId,
                            pricingType: "tiered",
                            tiers: tiers.map((tier) => ({
                                quantity: Number(tier.guests.replace("+ Guests", "").trim()),
                                price: tier.finalPrices[demographicId] || 0,
                            })),
                        };
                    } else {
                        console.error(`Unknown pricing type: ${pricingType}`);
                        return;
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tier-pricing`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(bodyData),
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Failed to create ${pricingType} pricing for demographic ${demographicId}. Error: ${errorText}`);
                    }
                })
            );

            toast({
                title: "Pricing Saved",
                description: `Pricing (${pricingType}) data has been saved successfully.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

        } catch (error) {
            console.error("Error saving pricing:", error);
            toast({
                title: "Error",
                description: `Could not save ${pricingType} pricing.`,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


    const handleCreateDemographic = async () => {
        if (!newDemographic.name.trim()) {
            toast({
                title: "Error",
                description: "Name is required.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demographics`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newDemographic.name,
                    tenantId: tenantId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create demographic");
            }

            const createdDemographic = await response.json();

            setAvailableDemographics([...availableDemographics, createdDemographic]);

            setNewDemographic({name: "", caption: ""});
            closeModal();

            toast({
                title: "Success",
                description: "Demographic created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error creating demographic:", error);
            toast({
                title: "Error",
                description: "Could not create demographic.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const [pricingStructure, setPricingStructure] = useState("tiered");
    const [basePrices, setBasePrices] = useState({});
    const [tiers, setTiers] = useState([]);
    const [newTier, setNewTier] = useState({
        id: null,
        guests: "",
        adjustments: {},
        adjustmentTypes: {},
        operations: {},
    });
    const {demographics} = useDemographics();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const basePriceModal = useDisclosure();
    const tierPriceModal = useDisclosure();
    const flatPriceModal = useDisclosure();

    useEffect(() => {
        const updatedTiers = tiers.map((tier) => {
            const finalPrices = {};
            for (const demo of demographics) {
                const basePrice = basePrices[demo.id] || 0;
                const adjustment = tier.adjustments[demo.id] || 0;
                const adjustmentType = tier.adjustmentTypes[demo.id] || "$";
                const operation = tier.operations[demo.id] || "Markup";

                finalPrices[demo.id] =
                    operation === "Markup"
                        ? adjustmentType === "$"
                            ? basePrice + adjustment
                            : basePrice + (basePrice * adjustment) / 100
                        : adjustmentType === "$"
                            ? basePrice - adjustment
                            : basePrice - (basePrice * adjustment) / 100;
            }
            return {
                ...tier,
                finalPrices,
            };
        });
        setTiers(updatedTiers);
    }, [demographics,tiers,basePrices]);

    const handlePricingChange = (value) => {
        setPricingStructure(value);

        if (value === "tiered" && tiers.length === 0) {
            const initialAdjustments = demographics.reduce((acc, demo) => {
                acc[demo.id] = 0;
                return acc;
            }, {});

            const initialAdjustmentTypes = demographics.reduce((acc, demo) => {
                acc[demo.id] = "$";
                return acc;
            }, {});

            const initialOperations = demographics.reduce((acc, demo) => {
                acc[demo.id] = "Markup";
                return acc;
            }, {});

            setNewTier({
                id: crypto.randomUUID(),
                guests: "1+ Guests",
                adjustments: initialAdjustments,
                adjustmentTypes: initialAdjustmentTypes,
                operations: initialOperations,
            });
        }
    };

    const handleAddTier = () => {
        const initialAdjustments = demographics.reduce((acc, demo) => {
            acc[demo.id] = 0;
            return acc;
        }, {});

        const initialAdjustmentTypes = demographics.reduce((acc, demo) => {
            acc[demo.id] = "$";
            return acc;
        }, {});

        const initialOperations = demographics.reduce((acc, demo) => {
            acc[demo.id] = "Markup";
            return acc;
        }, {});

        const guests = tiers.length === 0 ? "1+ Guests" : "";

        setNewTier({
            id: crypto.randomUUID(),
            guests,
            adjustments: initialAdjustments,
            adjustmentTypes: initialAdjustmentTypes,
            operations: initialOperations,
        });
        tierPriceModal.onOpen();
    };

    const handleSaveTier = () => {
        const finalPrices = {};
        for (const demo of demographics) {
            const basePrice = basePrices[demo.id] || 0;
            const adjustment = newTier.adjustments[demo.id] || 0;
            const adjustmentType = newTier.adjustmentTypes[demo.id] || "$";
            const operation = newTier.operations[demo.id] || "Markup";

            finalPrices[demo.id] =
                operation === "Markup"
                    ? adjustmentType === "$"
                        ? basePrice + adjustment
                        : basePrice + (basePrice * adjustment) / 100
                    : adjustmentType === "$"
                        ? basePrice - adjustment
                        : basePrice - (basePrice * adjustment) / 100;
        }

        const newTierToSave = {
            id: newTier.id,
            guests: newTier.guests || `${newTier.guests} + Guests`,
            finalPrices,
            adjustments: newTier.adjustments,
            adjustmentTypes: newTier.adjustmentTypes,
            operations: newTier.operations,
        };

        if (tiers.length === 0) {
            setTiers([newTierToSave]);
        } else {
            setTiers([...tiers, newTierToSave]);
        }
        tierPriceModal.onClose();
    };

    const handleDeleteTier = (id) => {
        setTiers(tiers.filter((tier) => tier.id !== id));
    };

    const handleBasePriceChange = (demoId, value) => {
        setBasePrices((prev) => ({
            ...prev,
            [demoId]: Number(value),
        }));
    };

    const handleAdjustmentChange = (demoId, value) => {
        setNewTier((prev) => ({
            ...prev,
            adjustments: {
                ...prev.adjustments,
                [demoId]: Number(value),
            },
        }));
    };

    const handleAdjustmentTypeChange = (demoId, value) => {
        setNewTier((prev) => ({
            ...prev,
            adjustmentTypes: {
                ...prev.adjustmentTypes,
                [demoId]: value,
            },
        }));
    };

    const handleOperationChange = (demoId, value) => {
        setNewTier((prev) => ({
            ...prev,
            operations: {
                ...prev.operations,
                [demoId]: value,
            },
        }));
    };

    const handleEditTier = (tier) => {
        setNewTier(tier);
        tierPriceModal.onOpen();
    };

    const handleSaveFlatPrices = () => {
        flatPriceModal.onClose();
    };

    return (
        <Box
            width="100vw"
            height="100vh"
            overflow="hidden">

            <DashboardLayout>
                <Box p={8}
                     maxWidth="2000px"
                     mx="auto"
                     maxHeight="850px"
                     overflowY="auto"
                     flex="1"
                     pb="150px"
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
                                            onChange={(e) => setEventDuration(e.target.value)}
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
                            <Box>
                                <HStack justify={"space-between"} spacing={2} mt={2} mb={2}>
                                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                                        Demographics
                                    </Text>
                                    <Popover isOpen={isOpen} onClose={onClose} placement="bottom-start">
                                        <PopoverTrigger>
                                            <Button onClick={onOpen} colorScheme="gray" variant="outline">
                                                + Add Demographic
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow/>
                                            <PopoverBody>
                                                <VStack align="stretch">
                                                    <RadioGroup onChange={handleSelectDemographic}>
                                                        <Stack direction="column" maxH="200px" overflowY="auto">
                                                            {availableDemographics.map((demo) => (
                                                                <Radio key={demo.id} value={demo.id}>
                                                                    {demo.name}
                                                                </Radio>
                                                            ))}
                                                        </Stack>
                                                    </RadioGroup>
                                                    <Button colorScheme="gray" variant="outline" onClick={openModal}>
                                                        + Create Demographic
                                                    </Button>
                                                </VStack>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                </HStack>

                                <Table variant="simple" borderRadius="md" overflow="hidden">
                                    <Thead>
                                        <Tr bg="gray.100">
                                            <Th>Demographic</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {selectedDemographics.length === 0 ? (
                                            <Tr>
                                                <Td colSpan={2} textAlign="center" p={4} color="gray.500">
                                                    No demographics available
                                                </Td>
                                            </Tr>
                                        ) : (
                                            <>
                                                {selectedDemographics.map((demo) => (
                                                    <Tr key={demo.id} fontSize="sm">
                                                        <Td p={2}>
                                                            <HStack spacing={2}>
                                                                <DragHandleIcon boxSize={3}/>
                                                                <Text fontSize="sm">{demo.name}</Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td p={1}>
                                                            <IconButton
                                                                icon={<DeleteIcon/>}
                                                                size="xs"
                                                                colorScheme="gray"
                                                                variant="outline"
                                                                aria-label="Delete"
                                                                onClick={() => handleRemoveDemographic(demo.id)}
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ))}

                                                {selectedDemographics.map((demo) => (
                                                    <Tr key={demo.id} fontSize="sm" bg="gray.50">
                                                        <Td p={2}>
                                                            <HStack spacing={2}>
                                                                <DragHandleIcon boxSize={3}/>
                                                                <Text fontSize="sm">{demo.name} (Unsaved)</Text>
                                                            </HStack>
                                                        </Td>
                                                        <HStack p={1}>
                                                            <IconButton
                                                                icon={<EditIcon/>}
                                                                size="xs"
                                                                aria-label="Edit"
                                                                colorScheme="gray"
                                                                variant="outline"
                                                                // onClick={() => handleEditDemographic(demo.id, demo.name)}
                                                            />
                                                            <IconButton
                                                                icon={<DeleteIcon/>}
                                                                size="xs"
                                                                colorScheme="gray"
                                                                variant="outline"
                                                                aria-label="Delete"
                                                                onClick={() => handleRemoveDemographic(demo.id)}
                                                            />
                                                        </HStack>
                                                    </Tr>
                                                ))}
                                            </>
                                        )}
                                    </Tbody>
                                </Table>

                                <Modal isOpen={isModalOpen} onClose={closeModal}>
                                    <ModalOverlay/>
                                    <ModalContent>
                                        <ModalHeader>Create Demographic</ModalHeader>
                                        <ModalCloseButton/>
                                        <ModalBody>
                                            <Text mb={2}>Name</Text>
                                            <Input
                                                placeholder="Name"
                                                value={newDemographic.name}
                                                onChange={(e) => setNewDemographic({
                                                    ...newDemographic,
                                                    name: e.target.value
                                                })}
                                            />

                                            <Text mt={4} mb={2}>Caption</Text>
                                            <Textarea
                                                placeholder="Caption"
                                                value={newDemographic.caption}
                                                onChange={(e) => setNewDemographic({
                                                    ...newDemographic,
                                                    caption: e.target.value
                                                })}
                                            />
                                        </ModalBody>

                                        <ModalFooter>
                                            <Button variant="outline" mr={3} onClick={closeModal}>
                                                Cancel
                                            </Button>
                                            <Button
                                                colorScheme="blue"
                                                onClick={handleCreateDemographic}
                                                isDisabled={!newDemographic.name.trim()}
                                            >
                                                Create
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </Box>
                            <Box>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>
                                    Public Pricing
                                </Text>
                                <VStack align="start" spacing={4}>
                                    <Box>
                                        <VStack align="flex-start">
                                            <RadioGroup onChange={handlePricingChange} value={pricingStructure}>
                                                <Stack direction="column" spacing={2}>
                                                    <Radio value="flat">Flat Pricing</Radio>
                                                    <Radio value="tiered">Tiered Pricing</Radio>
                                                </Stack>
                                            </RadioGroup>
                                        </VStack>
                                    </Box>

                                    <Box width="100%">
                                        <HStack justifyContent="space-between" spacing={2} mb={2}>
                                            <Text fontSize="md" fontWeight="bold">
                                                Terms
                                            </Text>
                                            {pricingStructure === "tiered" && (
                                                <Button
                                                    leftIcon={<AddIcon/>}
                                                    size="sm"
                                                    onClick={handleAddTier}
                                                    colorScheme="gray"
                                                    variant="outline"
                                                >
                                                    Add Tier
                                                </Button>
                                            )}
                                        </HStack>

                                        {pricingStructure === "flat" ? (
                                            <Table variant="simple" size="sm">
                                                <Thead bg="gray.100">
                                                    <Tr>
                                                        <Th>Demographic</Th>
                                                        <Th>Price</Th>
                                                        <Th>Actions</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {demographics.map((demo) => (
                                                        <Tr key={demo.id}>
                                                            <Td>{demo.name}</Td>
                                                            <Td>${basePrices[demo.id]?.toFixed(2) || "0.00"}</Td>
                                                            <Td>
                                                                <IconButton
                                                                    icon={<EditIcon/>}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Edit Price"
                                                                    onClick={flatPriceModal.onOpen}
                                                                />
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        ) : (
                                            <Table variant="simple" size="sm">
                                                <Thead bg="gray.100">
                                                    <Tr>
                                                        <Th>Demographic</Th>
                                                        {tiers.map((tier) => (
                                                            <Th key={tier.id}>
                                                                {tier.guests}{" "}
                                                                <IconButton
                                                                    icon={<EditIcon/>}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    aria-label="Edit Tier"
                                                                    onClick={() => handleEditTier(tier)}
                                                                />
                                                            </Th>
                                                        ))}
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {demographics.map((demo) => (
                                                        <Tr key={demo.id}>
                                                            <Td>{demo.name}</Td>
                                                            {tiers.map((tier) => (
                                                                <Td key={tier.id}>${tier.finalPrices[demo.id].toFixed(2)}</Td>
                                                            ))}
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        )}
                                    </Box>
                                </VStack>

                                <Modal isOpen={flatPriceModal.isOpen} onClose={flatPriceModal.onClose} isCentered>
                                    <ModalOverlay/>
                                    <ModalContent maxWidth="500px">
                                        <ModalHeader>Base Prices</ModalHeader>
                                        <ModalCloseButton/>
                                        <ModalBody>
                                            <Text fontSize="md" fontWeight="bold" mb={2}>
                                                Terms
                                            </Text>
                                            <Table variant="simple" size="sm">
                                                <Thead bg="gray.100">
                                                    <Tr>
                                                        <Th>Demographics</Th>
                                                        <Th>Price</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {demographics.map((demo) => (
                                                        <Tr key={demo.id}>
                                                            <Td>{demo.name}</Td>
                                                            <Td>
                                                                <Input
                                                                    type="number"
                                                                    value={basePrices[demo.id] || ""}
                                                                    onChange={(e) => handleBasePriceChange(demo.id, e.target.value)}
                                                                />
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button variant="outline" onClick={flatPriceModal.onClose}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme="blue" ml={3} onClick={handleSaveFlatPrices}>
                                                Save
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>

                                <Modal isOpen={tierPriceModal.isOpen} onClose={tierPriceModal.onClose} isCentered>
                                    <ModalOverlay/>
                                    <ModalContent maxWidth="900px" width="90%">
                                        <ModalHeader>Edit Tier</ModalHeader>
                                        <ModalCloseButton/>
                                        <ModalBody>
                                            <Text fontSize="sm" mb={2}>
                                                For group size greater than or equal to
                                            </Text>
                                            <Input
                                                type="number"
                                                placeholder="Enter guest count"
                                                value={newTier.guests.replace("+ Guests", "").trim()}
                                                onChange={(e) =>
                                                    setNewTier({
                                                        ...newTier,
                                                        guests: `${e.target.value} + Guests`,
                                                    })
                                                }
                                                disabled={newTier.guests === "1+ Guests"}
                                            />

                                            <Text fontSize="md" fontWeight="bold" mt={4} mb={2}>
                                                Terms
                                            </Text>
                                            <Table variant="simple" size="sm">
                                                <Thead bg="gray.100">
                                                    <Tr>
                                                        <Th>Demographic</Th>
                                                        <Th>Base Price</Th>
                                                        <Th>Adjustment</Th>
                                                        <Th></Th>
                                                        <Th></Th>
                                                        <Th>Final Price</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {demographics.map((demo) => (
                                                        <Tr key={demo.id}>
                                                            <Td>{demo.name}</Td>
                                                            <Td>
                                                                <Input
                                                                    type="number"
                                                                    width="100px"
                                                                    placeholder="Enter base price"
                                                                    value={basePrices[demo.id] || ""}
                                                                    onChange={(e) => handleBasePriceChange(demo.id, e.target.value)}
                                                                    disabled={newTier.guests !== "1+ Guests"}
                                                                />
                                                            </Td>
                                                            <Td>
                                                                <Input
                                                                    type="number"
                                                                    width="80px"
                                                                    value={newTier.adjustments[demo.id] || ""}
                                                                    onChange={(e) => handleAdjustmentChange(demo.id, e.target.value)}
                                                                    disabled={newTier.guests === "1+ Guests"}
                                                                />
                                                            </Td>
                                                            <Td>
                                                                <Select
                                                                    value={newTier.adjustmentTypes[demo.id] || "$"}
                                                                    onChange={(e) => handleAdjustmentTypeChange(demo.id, e.target.value)}
                                                                    disabled={newTier.guests === "1+ Guests"}
                                                                >
                                                                    <option value="$">$</option>
                                                                    <option value="%">%</option>
                                                                </Select>
                                                            </Td>
                                                            <Td>
                                                                <Select
                                                                    value={newTier.operations[demo.id] || "Markup"}
                                                                    onChange={(e) => handleOperationChange(demo.id, e.target.value)}
                                                                    disabled={newTier.guests === "1+ Guests"}
                                                                >
                                                                    <option value="Markup">Markup</option>
                                                                    <option value="Markdown">Markdown</option>
                                                                </Select>
                                                            </Td>
                                                            <Td>
                                                                $
                                                                {newTier.operations[demo.id] === "Markup"
                                                                    ? newTier.adjustmentTypes[demo.id] === "$"
                                                                        ? (basePrices[demo.id] || 0) + (newTier.adjustments[demo.id] || 0)
                                                                        : (basePrices[demo.id] || 0) + ((basePrices[demo.id] || 0) * (newTier.adjustments[demo.id] || 0)) / 100
                                                                    : newTier.adjustmentTypes[demo.id] === "$"
                                                                        ? (basePrices[demo.id] || 0) - (newTier.adjustments[demo.id] || 0)
                                                                        : (basePrices[demo.id] || 0) - ((basePrices[demo.id] || 0) * (newTier.adjustments[demo.id] || 0)) / 100}
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </ModalBody>
                                        <ModalFooter>
                                            {newTier?.id && (
                                                <Button
                                                    colorScheme="gray"
                                                    variant="outline"
                                                    mr="auto"
                                                    onClick={() => handleDeleteTier(newTier.id)}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                            <Button variant="outline" onClick={tierPriceModal.onClose}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme="blue" ml={3} onClick={handleSaveTier}>
                                                Save
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </Box>
                            <CustomerQuestionnaire ref={questionnaireRef}/>
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
        </Box>
    );
}

function CreateToursPage({isEditing = false}: { isEditing?: boolean }) {
    const [currentStep, setCurrentStep] = useState(1);


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
        setCancellationPolicy,
        setConsiderations
    } = useGuest();

    const resetFields = useCallback(() => {
        setSchedule([]);
        setEventDuration('');
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
        setCancellationPolicy("");
        setConsiderations("");
        setImagePreview(null);
        setImageFile(null);
    }, [setSchedule, setEventDuration, setGuestLimit, setEarlyArrival, setTitle, setDescription, 
        setPrice, setIncludedItems, setBringItems, setImagePreview, setImageFile, 
        setOperationProcedures, setCancellationPolicy, setConsiderations]);

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