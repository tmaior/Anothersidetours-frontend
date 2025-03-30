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
    VStack,
    Wrap,
    WrapItem
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
import TimeSlotPicker from "../../../components/TimeSlotPicker";
import { ScheduleItem } from "../../../contexts/GuestContext";

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
        // price: false,
    });

    const [formData, setFormData] = useState({
        title: title || "",
        description: description || "",
        // price: price ? parseFloat(price.toString()) : 0,
    });

    useEffect(() => {
        setFormData({
            title: title || "",
            description: description || "",
            // price: price ? parseFloat(price.toString()) : 0,
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
            // price: formData.price <= 0,
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
        // setPrice(formData.price);
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

        setFormData((prev) => ({...prev, [field]: value}));

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
                            {/*<FormControl isRequired isInvalid={errors.price}>*/}
                            {/*    <FormLabel>Price</FormLabel>*/}
                            {/*    <HStack>*/}
                            {/*        <Input*/}
                            {/*            value={formData.price}*/}
                            {/*            onChange={(e) => handleFormChange("price", e.target.value)}*/}
                            {/*            onBlur={(e) => {*/}
                            {/*                const value = parseFloat(e.target.value);*/}
                            {/*                if (!isNaN(value)) {*/}
                            {/*                    handleFormChange("price", value.toFixed(2));*/}
                            {/*                }*/}
                            {/*            }}*/}
                            {/*            placeholder="$"*/}
                            {/*            width="auto"*/}
                            {/*            type="number"*/}
                            {/*            step="0.01"*/}
                            {/*        />*/}
                            {/*    </HStack>*/}
                            {/*    {errors.price && (*/}
                            {/*        <Text color="red.500">*/}
                            {/*            This field is required and must be greater than 0*/}
                            {/*        </Text>*/}
                            {/*    )}*/}
                            {/*</FormControl>*/}

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

            if (isEditing) {
                const currentDemographicsResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/demographics/demographicByTourId/${tourId}`
                );
                
                if (!currentDemographicsResponse.ok) {
                    console.warn("Failed to fetch current demographics, proceeding with assignment");
                } else {
                    const currentDemographics = await currentDemographicsResponse.json();
                    
                    await Promise.all(
                        currentDemographics.map(async (currentDemo) => {
                            if (!selectedDemographics.some(newDemo => newDemo.id === currentDemo.id)) {
                                await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/demographics/${tourId}/${currentDemo.id}`,
                                    {
                                        method: "DELETE",
                                        headers: { "Content-Type": "application/json" }
                                    }
                                );
                            }
                        })
                    );

                    const currentDemoIds = currentDemographics.map(demo => demo.id);
                    const savedDemographics = await Promise.all(
                        selectedDemographics
                            .filter(demo => !currentDemoIds.includes(demo.id))
                            .map(async (demo) => {
                                try {
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
                                        console.warn(`Failed to assign demographic ${demo.name}`);
                                    }
                                    return demo;
                                } catch (error) {
                                    console.warn(`Error assigning demographic ${demo.name}:`, error);
                                    return demo;
                                }
                            })
                    );
                }
            } else {
                const savedDemographics = await Promise.all(
                    selectedDemographics.map(async (demo) => {
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
                            throw new Error(`Failed to assign demographic ${demo.name}`);
                        }
                        return demo;
                    })
                );
            }

            if (schedule.length > 0) {
                const scheduleData = schedule.map(scheduleItem => {
                    const selectedDays = Object.entries(scheduleItem.days)
                        .filter(([, isSelected]) => isSelected)
                        .map(([day]) => day);

                    const formattedTimeSlots = scheduleItem.timeSlots.map(slot => {
                        return slot;
                    });
                    
                    return {
                        name: scheduleItem.name || "",
                        days: selectedDays,
                        timeSlots: formattedTimeSlots
                    };
                });

                const scheduleResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/${tourId}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ schedules: scheduleData })
                    }
                );

                if (!scheduleResponse.ok) {
                    throw new Error("Failed to save schedule");
                }
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
            window.location.href = "/dashboard/list-tours";
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
    const [selectedDemographicId, setSelectedDemographicId] = useState<string>("");

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
        if (selectedDemo && !selectedDemographics.some(demo => demo.id === selectedId)) {
            setSelectedDemographics([...selectedDemographics, selectedDemo]);
            addDemographic(selectedDemo);
        }
        setSelectedDemographicId("");
        onClose();
    };

    const handleRemoveDemographic = async (id) => {
        setSelectedDemographics(selectedDemographics.filter((demo) => demo.id !== id));
        removeDemographic(id);
        if (selectedDemographicId === id) {
            setSelectedDemographicId("");
        }

        if (isEditing && tourId) {
            try {

                const url = `${process.env.NEXT_PUBLIC_API_URL}/demographics/${tourId}/${id}`;

                const response = await fetch(url, {
                    method: "DELETE",
                    headers: { 
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    let errorDetails = "";
                    try {
                        const errorData = await response.json();
                        errorDetails = JSON.stringify(errorData);
                    } catch (e) {
                        errorDetails = await response.text();
                    }
                    console.error(`Error response details: ${errorDetails}`);
                    throw new Error(`Failed to remove demographic association: ${response.status} - ${errorDetails}`);
                }
                
                toast({
                    title: "Demographic Removed",
                    description: "The demographic was successfully removed from this tour.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error removing demographic:", error);
                toast({
                    title: "Error",
                    description: `Failed to remove demographic: ${error.message}`,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setSelectedDemographics(prev => 
                    [...prev, availableDemographics.find(demo => demo.id === id)].filter(Boolean)
                );
            }
        }
    };
    const handleClosePopover = () => {
        setSelectedDemographicId("");
        onClose();
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
        const nameExists = availableDemographics.some(
            demo => demo.name.toLowerCase() === newDemographic.name.trim().toLowerCase()
        );
        if (nameExists) {
            toast({
                title: "Error",
                description: "A demographic with this name already exists.",
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
            const existingTierIndex = tiers.findIndex(tier => tier.id === newTier.id);
            if (existingTierIndex >= 0) {
                const updatedTiers = [...tiers];
                updatedTiers[existingTierIndex] = newTierToSave;
                setTiers(updatedTiers);
            } else {
                setTiers([...tiers, newTierToSave]);
            }
        }
        tierPriceModal.onClose();
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

    const { isOpen: isScheduleModalOpen, onOpen: openScheduleModal, onClose: closeScheduleModal } = useDisclosure();
    const [scheduleName, setScheduleName] = useState("");
    const [selectedDays, setSelectedDays] = useState({
        Sun: false,
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false
    });
    const [timeSlotType, setTimeSlotType] = useState("fixed");
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [isTimePickerOpen, setTimePickerOpen] = useState(false);
    const [editingTimeSlot, setEditingTimeSlot] = useState<{ index: number; time: string } | null>(null);
    const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);

    const handleDayToggle = (day: string) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const handleAddTimeSlot = (time: string) => {
        if (editingTimeSlot !== null) {
            const newSlots = [...timeSlots];
            newSlots[editingTimeSlot.index] = time;
            setTimeSlots(newSlots);
            setEditingTimeSlot(null);
        } else {
            setTimeSlots([...timeSlots, time]);
        }

        setTimeSlots(prevSlots => {
            return [...prevSlots].sort((a, b) => {
                const aIsAM = a.includes('AM');
                const bIsAM = b.includes('AM');

                if (aIsAM && !bIsAM) return -1;
                if (!aIsAM && bIsAM) return 1;

                const timeA = a.replace(' AM', '').replace(' PM', '');
                const timeB = b.replace(' AM', '').replace(' PM', '');

                const [hoursA, minutesA] = timeA.split(':').map(Number);
                const [hoursB, minutesB] = timeB.split(':').map(Number);

                if (hoursA !== hoursB) return hoursA - hoursB;

                return minutesA - minutesB;
            });
        });
        
        setTimePickerOpen(false);
    };

    const handleRemoveTimeSlot = (indexToRemove: number) => {
        setTimeSlots(timeSlots.filter((_, index) => index !== indexToRemove));
    };

    const handleEditTimeSlot = (index: number, time: string) => {
        setEditingTimeSlot({ index, time });
        setTimePickerOpen(true);
    };
    const handleDeleteSchedule = (index: number) => {
        setSchedule(prevSchedules => prevSchedules.filter((_, i) => i !== index));
    };

    const handleEditSchedule = (index: number) => {
        const scheduleToEdit = schedule[index];
        setScheduleName(scheduleToEdit.name || "");

        const defaultDays = { Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false };
        const newSelectedDays = { ...defaultDays };
        
        Object.entries(scheduleToEdit.days || {}).forEach(([day, isSelected]) => {
            if (isSelected) {
                newSelectedDays[day] = true;
            }
        });
        
        setSelectedDays(newSelectedDays);

        const sortedTimeSlots = [...scheduleToEdit.timeSlots].sort((a, b) => {
            const aIsAM = a.includes('AM');
            const bIsAM = b.includes('AM');

            if (aIsAM && !bIsAM) return -1;
            if (!aIsAM && bIsAM) return 1;

            const timeA = a.replace(' AM', '').replace(' PM', '');
            const timeB = b.replace(' AM', '').replace(' PM', '');

            const [hoursA, minutesA] = timeA.split(':').map(Number);
            const [hoursB, minutesB] = timeB.split(':').map(Number);

            if (hoursA !== hoursB) return hoursA - hoursB;

            return minutesA - minutesB;
        });
        
        setTimeSlots(sortedTimeSlots);
        setEditingScheduleIndex(index);
        openScheduleModal();
    };

    const handleApplySchedule = () => {

        const newSchedule: ScheduleItem = {
            name: scheduleName,
            days: selectedDays,
            timeSlots: timeSlots,
            startTime: "",
            startPeriod: "",
            endTime: "",
            endPeriod: ""
        };
        
        if (editingScheduleIndex !== null) {
            setSchedule(prevSchedules => 
                prevSchedules.map((item, index) => 
                    index === editingScheduleIndex ? newSchedule : item
                )
            );
        } else {
            setSchedule(prevSchedules => [...prevSchedules, newSchedule]);
        }
        
        setScheduleName("");
        setSelectedDays({
            Sun: false,
            Mon: false,
            Tue: false,
            Wed: false,
            Thu: false,
            Fri: false,
            Sat: false
        });
        setTimeSlots([]);
        setEditingScheduleIndex(null);
        closeScheduleModal();
    };

    const handleCloseModal = () => {
        setScheduleName("");
        setSelectedDays({
            Sun: false,
            Mon: false,
            Tue: false,
            Wed: false,
            Thu: false,
            Fri: false,
            Sat: false
        });
        setTimeSlots([]);
        setEditingScheduleIndex(null);
        closeScheduleModal();
    };

    const formatScheduleDisplay = (days: Record<string, boolean>, timeSlots: string[]): string => {
        const sortedTimeSlots = [...timeSlots].sort((a, b) => {
            const aIsAM = a.includes('AM');
            const bIsAM = b.includes('AM');

            if (aIsAM && !bIsAM) return -1;
            if (!aIsAM && bIsAM) return 1;

            const timeA = a.replace(' AM', '').replace(' PM', '');
            const timeB = b.replace(' AM', '').replace(' PM', '');

            const [hoursA, minutesA] = timeA.split(':').map(Number);
            const [hoursB, minutesB] = timeB.split(':').map(Number);

            if (hoursA !== hoursB) return hoursA - hoursB;

            return minutesA - minutesB;
        });
        
        const formattedTimes = sortedTimeSlots.map(slot => {
            const [time, period] = slot.split(' ');
            const [hours, minutes] = time.split(':');
            return `${hours}:${minutes}${period.toLowerCase()}`;
        });
        
        const allDaysSelected = Object.values(days).every(day => day);
        const anyDaySelected = Object.values(days).some(day => day);

        if (allDaysSelected) {
            if (formattedTimes.length > 3) {
                return `Daily at ${formattedTimes.slice(0, 3).join(', ')}...`;
            }
            return `Daily at ${formattedTimes.join(', ')}`;
        } else if (anyDaySelected) {
            const selectedDays = Object.entries(days)
                .filter(([, isSelected]) => isSelected)
                .map(([day]) => day)
                .join(', ');

            if (formattedTimes.length > 3) {
                return `${selectedDays} at ${formattedTimes.slice(0, 3).join(', ')}...`;
            }
            return `${selectedDays} at ${formattedTimes.join(', ')}`;
        }
        
        if (formattedTimes.length > 3) {
            return `${formattedTimes.slice(0, 3).join(', ')}...`;
        }
        return formattedTimes.join(', ');
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

                            <Box borderWidth="1px" borderRadius="lg" bg="white">
                                <HStack p={4} borderBottomWidth="1px" justify="space-between">
                                    <Button
                                        rightIcon={<AddIcon />}
                                        variant="outline"
                                        size="sm"
                                        onClick={openScheduleModal}
                                    >
                                        Add Schedule
                                    </Button>
                                </HStack>

                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Schedule Name</Th>
                                            <Th>Price Variation</Th>
                                            <Th width="100px">Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {schedule.map((schedule, index) => (
                                            <Tr key={index}>
                                                <Td>
                                                    <VStack align="start" spacing={1}>
                                                        {schedule.name && (
                                                            <Text color="blue.500" cursor="pointer">
                                                                {schedule.name}
                                                            </Text>
                                                        )}
                                                        <Text fontSize="sm" color="gray.600">
                                                            {formatScheduleDisplay(schedule.days, schedule.timeSlots)}
                                                        </Text>
                                                    </VStack>
                                                </Td>
                                                <Td>
                                                    <HStack spacing={2}>
                                                        <IconButton
                                                            icon={<EditIcon />}
                                                            aria-label="Edit schedule"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEditSchedule(index)}
                                                        />
                                                        <IconButton
                                                            icon={<DeleteIcon />}
                                                            aria-label="Delete schedule"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteSchedule(index)}
                                                        />
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
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
                                    <Popover isOpen={isOpen} onClose={handleClosePopover} placement="bottom-start">
                                        <PopoverTrigger>
                                            <Button onClick={onOpen} colorScheme="gray" variant="outline">
                                                + Add Demographic
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow/>
                                            <PopoverBody>
                                                <VStack align="stretch">
                                                    <RadioGroup 
                                                        onChange={handleSelectDemographic} 
                                                        value={selectedDemographicId}
                                                    >
                                                        <Stack direction="column" maxH="200px" overflowY="auto">
                                                            {availableDemographics.map((demo) => (
                                                                <Radio 
                                                                    key={demo.id} 
                                                                    value={demo.id}
                                                                    isDisabled={selectedDemographics.some(d => d.id === demo.id)}
                                                                >
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
                                            selectedDemographics.map((demo) => (
                                                <Tr key={demo.id} fontSize="sm">
                                                    <Td p={2}>
                                                        <HStack spacing={2}>
                                                            <DragHandleIcon boxSize={3}/>
                                                            <Text fontSize="sm">{demo.name}</Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td p={1}>
                                                        <HStack>
                                                            <IconButton
                                                                icon={<EditIcon/>}
                                                                size="xs"
                                                                aria-label="Edit"
                                                                colorScheme="gray"
                                                                variant="outline"
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
                                                    </Td>
                                                </Tr>
                                            ))
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

                                <Modal isOpen={tierPriceModal.isOpen && newTier.guests === "1+ Guests"} onClose={tierPriceModal.onClose} isCentered>
                                    <ModalOverlay/>
                                    <ModalContent maxWidth="500px">
                                        <ModalHeader>Tier 1</ModalHeader>
                                        <ModalCloseButton/>
                                        <ModalBody>
                                            <Box bg="blue.50" p={4} mb={4} borderRadius="md">
                                                <Text>These are Base Prices for each demographic</Text>
                                            </Box>

                                            <Text fontSize="md" fontWeight="bold" mb={4}>
                                                Terms
                                            </Text>
                                            <Table variant="simple" size="sm">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Demographic</Th>
                                                        <Th>Price</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {demographics.map((demo) => (
                                                        <Tr key={demo.id}>
                                                            <Td>
                                                                <HStack>
                                                                    <DragHandleIcon boxSize={3} color="gray.400"/>
                                                                    <Text>{demo.name}</Text>
                                                                </HStack>
                                                            </Td>
                                                            <Td>
                                                                <Input
                                                                    type="number"
                                                                    value={basePrices[demo.id] || ""}
                                                                    onChange={(e) => handleBasePriceChange(demo.id, e.target.value)}
                                                                    size="sm"
                                                                    width="120px"
                                                                />
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button variant="outline" onClick={tierPriceModal.onClose}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme="blue" ml={3} onClick={handleSaveTier}>
                                                Save
                                            </Button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>

                                <Modal isOpen={tierPriceModal.isOpen && newTier.guests !== "1+ Guests"} onClose={tierPriceModal.onClose} isCentered>
                                    <ModalOverlay/>
                                    <ModalContent maxWidth="800px">
                                        <ModalHeader>Tier {newTier.guests.replace("+ Guests", "").trim()}</ModalHeader>
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
                                                mb={4}
                                            />

                                            <Text fontSize="md" fontWeight="bold" mb={2}>
                                                Terms
                                            </Text>
                                            <Table variant="simple" size="sm">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Demographic</Th>
                                                        <Th>Base Price</Th>
                                                        <Th>Adjustment</Th>
                                                        <Th>Final Price</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {demographics.map((demo) => (
                                                        <Tr key={demo.id}>
                                                            <Td>{demo.name}</Td>
                                                            <Td>${basePrices[demo.id]?.toFixed(2) || "0.00"}</Td>
                                                            <Td>
                                                                <HStack spacing={1}>
                                                                    <Input
                                                                        type="number"
                                                                        size="sm"
                                                                        width="80px"
                                                                        value={newTier.adjustments[demo.id] || ""}
                                                                        onChange={(e) => handleAdjustmentChange(demo.id, e.target.value)}
                                                                    />
                                                                    <Select
                                                                        size="sm"
                                                                        width="70px"
                                                                        value={newTier.adjustmentTypes[demo.id] || "$"}
                                                                        onChange={(e) => handleAdjustmentTypeChange(demo.id, e.target.value)}
                                                                    >
                                                                        <option value="$">$</option>
                                                                        <option value="%">%</option>
                                                                    </Select>
                                                                    <Select
                                                                        size="sm"
                                                                        width="100px"
                                                                        value={newTier.operations[demo.id] || "Markup"}
                                                                        onChange={(e) => handleOperationChange(demo.id, e.target.value)}
                                                                    >
                                                                        <option value="Markup">Markup</option>
                                                                        <option value="Markdown">Markdown</option>
                                                                    </Select>
                                                                </HStack>
                                                            </Td>
                                                            <Td>
                                                                ${(newTier.operations[demo.id] === "Markup"
                                                                    ? newTier.adjustmentTypes[demo.id] === "$"
                                                                        ? (basePrices[demo.id] || 0) + (newTier.adjustments[demo.id] || 0)
                                                                        : (basePrices[demo.id] || 0) + ((basePrices[demo.id] || 0) * (newTier.adjustments[demo.id] || 0)) / 100
                                                                    : newTier.adjustmentTypes[demo.id] === "$"
                                                                        ? (basePrices[demo.id] || 0) - (newTier.adjustments[demo.id] || 0)
                                                                        : (basePrices[demo.id] || 0) - ((basePrices[demo.id] || 0) * (newTier.adjustments[demo.id] || 0)) / 100).toFixed(2)}
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </ModalBody>
                                        <ModalFooter>
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

            <Modal 
                isOpen={isScheduleModalOpen} 
                onClose={handleCloseModal} 
                size="md"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {editingScheduleIndex !== null ? 'Edit Schedule' : 'Add Schedule'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Name</FormLabel>
                                <Input 
                                    value={scheduleName}
                                    onChange={(e) => setScheduleName(e.target.value)}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Days of Week</FormLabel>
                                <HStack spacing={2}>
                                    {Object.entries(selectedDays).map(([day, isSelected]) => (
                                        <Button
                                            key={day}
                                            size="sm"
                                            colorScheme={isSelected ? "blue" : "gray"}
                                            variant={isSelected ? "solid" : "outline"}
                                            onClick={() => handleDayToggle(day)}
                                        >
                                            {day}
                                        </Button>
                                    ))}
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Time Slots</FormLabel>
                                <RadioGroup value={timeSlotType} onChange={setTimeSlotType}>
                                    <HStack spacing={4}>
                                        <Radio value="fixed">Fixed Times</Radio>
                                    </HStack>
                                </RadioGroup>
                            </FormControl>

                            {timeSlotType === "fixed" && (
                                <Box>
                                    <Button 
                                        leftIcon={<AddIcon />} 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            setEditingTimeSlot(null);
                                            setTimePickerOpen(true);
                                        }}
                                        mb={4}
                                    >
                                        Add Time Slot
                                    </Button>
                                    
                                    {timeSlots.length > 0 && (
                                        <Wrap spacing={2}>
                                            {timeSlots.map((slot, index) => (
                                                <WrapItem key={index}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        borderRadius="full"
                                                        bg="gray.100"
                                                        pr={1}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditTimeSlot(index, slot);
                                                        }}
                                                        _hover={{ bg: 'gray.200' }}
                                                    >
                                                        {slot}
                                                        <Box
                                                            as="span"
                                                            ml={2}
                                                            p={1}
                                                            cursor="pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveTimeSlot(index);
                                                            }}
                                                        >
                                                            ×
                                                        </Box>
                                                    </Button>
                                                </WrapItem>
                                            ))}
                                        </Wrap>
                                    )}
                                </Box>
                            )}

                            <Box>
                                <Text fontWeight="semibold" mb={2}>Price Variation</Text>
                                <Button leftIcon={<AddIcon />} variant="outline" size="sm">
                                    Add Price Variation
                                </Button>
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="blue" 
                            onClick={handleApplySchedule}
                            isDisabled={timeSlots.length === 0 || !Object.values(selectedDays).some(day => day)}
                        >
                            {editingScheduleIndex !== null ? 'Save Changes' : 'Apply'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal 
                isOpen={isTimePickerOpen} 
                onClose={() => {
                    setTimePickerOpen(false);
                    setEditingTimeSlot(null);
                }}
                size="xl"
            >
                <ModalOverlay />
                <ModalContent maxW="600px">
                    <ModalHeader>
                        {editingTimeSlot !== null ? 'Edit Time Slot' : 'Add Time Slot'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <TimeSlotPicker
                            onTimeSelect={handleAddTimeSlot}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}

function CreateToursPage({isEditing = false}: { isEditing?: boolean }) {
    const [currentStep, setCurrentStep] = useState(1);


    // const {
    //     setSchedule,
    //     setEventDuration,
    //     setGuestLimit,
    //     setEarlyArrival,
    //     setTitle,
    //     setDescription,
    //     setPrice,
    //     setIncludedItems,
    //     setBringItems,
    //     setImagePreview,
    //     setImageFile,
    //     setOperationProcedures,
    //     setCancellationPolicy,
    //     setConsiderations
    // } = useGuest();

    // const resetFields = useCallback(() => {
    //     setSchedule([]);
    //     setEventDuration('');
    //     setGuestLimit(0);
    //     setEarlyArrival(false);
    //     setTitle("");
    //     setDescription("");
    //     setPrice(0);
    //     setIncludedItems([]);
    //     setBringItems([]);
    //     setImagePreview(null);
    //     setOperationProcedures("");
    //     setTitle("");
    //     setDescription("");
    //     setPrice(0);
    //     setIncludedItems([]);
    //     setBringItems([]);
    //     setOperationProcedures("");
    //     setCancellationPolicy("");
    //     setConsiderations("");
    //     setImagePreview(null);
    //     setImageFile(null);
    // }, [setSchedule, setEventDuration, setGuestLimit, setEarlyArrival, setTitle, setDescription,
    //     setPrice, setIncludedItems, setBringItems, setImagePreview, setImageFile,
    //     setOperationProcedures, setCancellationPolicy, setConsiderations]);

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