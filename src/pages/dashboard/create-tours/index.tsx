import {
    Box,
    VStack,
    Heading,
    Text,
    Input,
    Select,
    Textarea,
    HStack,
    Image,
    Button,
    Flex,
    useColorModeValue,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import CurrencyInput from "react-currency-input-field";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";

export default function TourForm({ isEditing = false, tourId = null, initialData = null }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const inputTextColor = useColorModeValue("black", "white");
    const router = useRouter();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        duration: 0,
        tenantId: "",
        category: "",
        guide: "",
        addons: [],
        schedule: [],
        imageUrl: "",
    });

    const [additionalInfos, setAdditionalInfos] = useState([]);
    const [newAdditionalInfo, setNewAdditionalInfo] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [tenants, setTenants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [guides, setGuides] = useState([]);

    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: initialData.price,
                duration: initialData.duration / 60,
                tenantId: initialData.tenantId || "",
                category: initialData.categoryId || "",
                guide: initialData.guideId || "",
                addons: initialData.addons || [],
                schedule: initialData.schedule || [],
                imageUrl: initialData.imageUrl || "",
            });
            setTimeSlots(initialData.schedule || []);
        }
    }, [isEditing, initialData]);

    useEffect(() => {
        async function fetchSelectData() {
            try {
                const [tenantsRes, categoriesRes, guidesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/guides`),
                ]);

                const [tenantsData, categoriesData, guidesData] = await Promise.all([
                    tenantsRes.json(),
                    categoriesRes.json(),
                    guidesRes.json(),
                ]);

                setTenants(tenantsData);
                setCategories(categoriesData);
                setGuides(guidesData);
            } catch (error) {
                console.error("Error fetching select data:", error);
            }
        }

        fetchSelectData();
    }, []);

    const handleFormChange = (field: keyof typeof formData, value: string | number | File | string[]) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleTimeAdd = (time: string) => {
        if (time && !timeSlots.includes(time)) {
            setTimeSlots([...timeSlots, time]);
        }
    };

    const handleAddAdditionalInfo = () => {
        if (newAdditionalInfo.trim()) {
            setAdditionalInfos([...additionalInfos, newAdditionalInfo.trim()]);
            setNewAdditionalInfo("");
        }
    };

    const handleRemoveAdditionalInfo = (index) => {
        setAdditionalInfos(additionalInfos.filter((_, i) => i !== index));
    };

    const parseTimeStringToISO = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        // eslint-disable-next-line prefer-const
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) {
            hours += 12;
        }
        if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }

        const date = new Date('1970-01-01T00:00:00Z');
        date.setUTCHours(hours);
        date.setUTCMinutes(minutes);

        return date.toISOString();
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = formData.imageUrl;

            if (selectedImage) {
                const imageData = new FormData();
                imageData.append("file", selectedImage);

                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                    method: "POST",
                    body: imageData,
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    imageUrl = uploadData.url;
                } else {
                    throw new Error("Error uploading image");
                }
            }

            const durationInMinutes = formData.duration * 60;
            const tourData = {
                ...formData,
                duration: durationInMinutes,
                schedule: timeSlots.map((time) => parseTimeStringToISO(time)),
                imageUrl,
                additionalInfos,
            };

            const endpoint = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/tours/${tourId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/tours`;

            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tourData),
            });

            if (!response.ok) {
                throw new Error(`Error ${isEditing ? "updating" : "creating"} tour`);
            }

            router.push("/dashboard/list-tours");
        } catch (error) {
            console.error(error);
            alert("Error processing the request");
        }
    };

    return (
        <DashboardLayout>
            <Box ml="250px" p={8} display="flex" justifyContent="center" alignItems="center">
                <Box p={8} bg={bgColor} color="white" borderRadius="md" boxShadow="md" maxW="800px" w="100%">
                    <Heading color={"black"} mb={4}>
                        {isEditing ? "Editing Tour" : "Register Tour"}
                    </Heading>
                    <form>
                        <VStack spacing={4} align="stretch">
                            <Text color="gray.500" fontSize="sm">
                                Enter the Title of the tour.
                            </Text>
                            <Input
                                placeholder="Tour Name"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.name}
                                onChange={(e) => handleFormChange("name", e.target.value)}
                            />
                            <Text color="gray.500" fontSize="sm">
                                Enter the description of the tour.
                            </Text>
                            <Textarea
                                placeholder="Description"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.description}
                                onChange={(e) => handleFormChange("description", e.target.value)}
                            />
                            <Text color="gray.500" fontSize="sm">
                                Enter the value per hour.
                            </Text>
                            <CurrencyInput
                                placeholder="Price"
                                value={formData.price}
                                decimalsLimit={2}
                                prefix="$"
                                allowNegative={false}
                                customInput={Input}
                                bg={inputBgColor}
                                color={inputTextColor}
                                onValueChange={(value) => handleFormChange("price", parseFloat(value || "0"))}
                            />
                            <Text color="gray.500" fontSize="sm">
                                Enter the duration of the tour in hours.
                            </Text>
                            <Input
                                type="number"
                                placeholder="Duration (in hours)"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.duration}
                                onChange={(e) => handleFormChange("duration", e.target.value)}
                            />
                            <Text color="gray.500" fontSize="sm">
                                Select the city where the tour is.
                            </Text>
                            <Select
                                placeholder="Select the City"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.tenantId}
                                onChange={(e) => handleFormChange("tenantId", e.target.value)}
                            >
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.name}
                                    </option>
                                ))}
                            </Select>
                            <Text color="gray.500" fontSize="sm">
                                Add a category for the tour
                            </Text>
                            <Select
                                placeholder="Category"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.category}
                                onChange={(e) => handleFormChange("category", e.target.value)}
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Select>
                            <Text color="gray.500" fontSize="sm">
                                Add a guide for the tour.
                            </Text>
                            <Select
                                placeholder="Guide"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.guide}
                                onChange={(e) => handleFormChange("guide", e.target.value)}
                            >
                                {guides.map((guide) => (
                                    <option key={guide.id} value={guide.id}>
                                        {guide.name}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                bg={inputBgColor}
                                color={inputTextColor}
                                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                            />
                            {selectedImage && (
                                <Box>
                                    <Image
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="Preview"
                                        boxSize="150px"
                                        objectFit="cover"
                                        mt={4}
                                    />
                                    <Button
                                        colorScheme="red"
                                        mt={2}
                                        size="sm"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
                                        }}
                                    >
                                        Remove Image
                                    </Button>
                                </Box>
                            )}
                            <HStack align={"flex-start"}>
                                <TimeSelector onTimeAdd={handleTimeAdd} inputTextColor={inputTextColor} />
                            </HStack>
                            <Box>
                                {timeSlots.map((time, index) => (
                                    <Flex
                                        key={index}
                                        justify="space-between"
                                        align="center"
                                        bg="gray.100"
                                        p={2}
                                        borderRadius="md"
                                        mb={2}
                                    >
                                        <Text color="black">{time}</Text>
                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => setTimeSlots(timeSlots.filter((_, i) => i !== index))}
                                        >
                                            Remove
                                        </Button>
                                    </Flex>
                                ))}
                            </Box>
                            <Text color="gray.500" fontSize="sm">
                                Enter the additional information necessary for the tour
                            </Text>
                            <Textarea
                                placeholder="New Additional Information"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={newAdditionalInfo}
                                onChange={(e) => setNewAdditionalInfo(e.target.value)}
                            />
                            <Button colorScheme="blue" onClick={handleAddAdditionalInfo}>
                                Add Additional Information
                            </Button>
                            <VStack align="start" spacing={2}>
                                {additionalInfos.map((info, index) => (
                                    <Flex key={index} justify="space-between" w="100%">
                                        <Text color="black">{info}</Text>
                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => handleRemoveAdditionalInfo(index)}
                                        >
                                            Remove
                                        </Button>
                                    </Flex>
                                ))}
                            </VStack>
                            <Button colorScheme="teal" onClick={handleSubmit}>
                                Save
                            </Button>
                        </VStack>
                    </form>
                </Box>
            </Box>
        </DashboardLayout>
    );
}

function TimeSelector({ onTimeAdd, inputTextColor }) {
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [ampm, setAmPm] = useState('AM');
    const [isOpen, setIsOpen] = useState(false);
    const inputBgColor = useColorModeValue("gray.100", "gray.700");

    const openPopover = () => setIsOpen(true);
    const closePopover = () => setIsOpen(false);

    const handleAddTime = () => {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeString = `${formattedHour}:${formattedMinute} ${ampm}`;
        onTimeAdd(timeString);
        closePopover();
    };

    return (
        <Popover isOpen={isOpen} onClose={closePopover}>
            <PopoverTrigger>
                <Button onClick={openPopover}>Add Schedule</Button>
            </PopoverTrigger>
            <PopoverContent w={"290px"}>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader color={"black"}>Select Time</PopoverHeader>
                <PopoverBody>
                    <VStack spacing={4} align="flex-start">
                        <HStack spacing={2}>
                            <NumberInput
                                max={12}
                                min={1}
                                value={hour}
                                onChange={(valueString) => {
                                    const valueNumber = parseInt(valueString, 10);
                                    if (!isNaN(valueNumber)) {
                                        setHour(valueNumber);
                                    }
                                }}
                                clampValueOnBlur={false}
                            >
                                <NumberInputField w={"80px"} color={inputTextColor} bg={inputBgColor} />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Text>:</Text>
                            <NumberInput
                                max={59}
                                min={0}
                                value={minute}
                                onChange={(valueString) => {
                                    const valueNumber = parseInt(valueString, 10);
                                    if (!isNaN(valueNumber)) {
                                        setMinute(valueNumber);
                                    }
                                }}
                                clampValueOnBlur={false}
                            >
                                <NumberInputField w={"80px"} maxLength={2} color={inputTextColor} bg={inputBgColor} />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Select
                                value={ampm}
                                onChange={(e) => setAmPm(e.target.value)}
                                width="80px"
                                color={inputTextColor}
                                bg={inputBgColor}
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </Select>
                        </HStack>
                        <Button colorScheme="blue" onClick={handleAddTime} alignSelf="flex-start">
                            OK
                        </Button>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
}
