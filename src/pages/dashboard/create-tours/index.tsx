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
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import TimePicker from "react-time-picker";
import CurrencyInput from "react-currency-input-field";

export default function CreateTour() {
    const bgColor = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.800", "white");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const inputTextColor = useColorModeValue("black", "white");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        duration: 0,
        tenant: "",
        category: "",
        guide: "",
        addons: [],
        schedule: [],
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [tenants, setTenants] = useState([]);
    const [isLoadingTenants, setIsLoadingTenants] = useState(true);
    const [categories, setCategories] = useState([]);
    const [guides, setGuides] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingGuides, setIsLoadingGuides] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        async function fetchTenants() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`);
                const data = await response.json();
                setTenants(data);
            } catch (error) {
                console.error("Error when searching for tenants:", error);
            } finally {
                setIsLoadingTenants(false);
            }
        }
        async function fetchCategories() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error when searching for categories:", error);
            } finally {
                setIsLoadingCategories(false);
            }
        }

        async function fetchGuides() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guides`);
                const data = await response.json();
                setGuides(data);
            } catch (error) {
                console.error("Error when searching for guides:", error);
            } finally {
                setIsLoadingGuides(false);
            }
        }

        fetchTenants();
        fetchCategories();
        fetchGuides();
    }, []);

    const handleTimeAdd = (time: string | null) => {
        if (time && !timeSlots.includes(time)) {
            setTimeSlots([...timeSlots, time]);
        }
    };

    const handleTimeRemove = (time: string) => {
        setTimeSlots(timeSlots.filter((t) => t !== time));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedImage(file || null);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFormChange = (field: keyof typeof formData, value: string | number | File | string[]) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = "";

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

            const tourData = Object.fromEntries(
                Object.entries({
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                    duration: durationInMinutes,
                    tenantId: formData.tenant,
                    category: formData.category,
                    guide: formData.guide,
                    addons: formData.addons,
                    schedule: timeSlots.map((time) => new Date(`1970-01-01T${time}:00`).toISOString()),
                    imageUrl,
                })
            );

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tourData),
            });

            if (!response.ok) {
                throw new Error("Error saving tour");
            }

            const savedTour = await response.json();

            if (timeSlots.length > 0) {
                const formattedTimeSlots = timeSlots.map(
                    (time) => new Date(`1970-01-01T${time}:00`).toISOString()
                );

                const scheduleResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/${savedTour.id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ timeSlots: formattedTimeSlots }),
                    }
                );

                if (!scheduleResponse.ok) {
                    throw new Error("Error saving time slots");
                }
            }



        } catch (error) {
            console.error(error);
            alert("Error processing the request");
        }
    };

    return (
        <Box p={8} bg={bgColor} color={textColor} borderRadius="md" boxShadow="md">
            <Heading mb={4}>Register Tour</Heading>
            <form>
                <VStack spacing={4} align="stretch">
                    <Input
                        placeholder="Tour Name"
                        bg={inputBgColor}
                        color={inputTextColor}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                    />
                    <Textarea
                        placeholder="Description"
                        bg={inputBgColor}
                        color={inputTextColor}
                        onChange={(e) => handleFormChange("description", e.target.value)}
                    />
                    <CurrencyInput
                        placeholder="Price"
                        value={formData.price}
                        decimalsLimit={2}
                        prefix="$"
                        allowNegative={false}
                        customInput={Input}
                        bg={inputBgColor}
                        color={inputTextColor}
                        borderColor={useColorModeValue("gray.300", "gray.600")}
                        onValueChange={(value) => handleFormChange("price", parseFloat(value || "0"))}
                    />
                    <Input
                        type="number"
                        placeholder="Duration (in hours)"
                        bg={inputBgColor}
                        color={inputTextColor}
                        onChange={(e) => handleFormChange("duration", Number(e.target.value))}
                    />
                    {isLoadingTenants ? (
                        <Text>Loading cities...</Text>
                    ) : (
                        <Select
                            placeholder="Select the City"
                            bg={inputBgColor}
                            color={inputTextColor}
                            onChange={(e) => handleFormChange("tenant", e.target.value)}
                        >
                            {tenants.map((tenant) => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                </option>
                            ))}
                        </Select>
                    )}
                    {isLoadingCategories ? (
                        <Text>Loading categories...</Text>
                    ) : (
                        <Select
                            placeholder="Category"
                            bg={inputBgColor}
                            color={inputTextColor}
                            onChange={(e) => handleFormChange("category", e.target.value)}
                        >
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                    )}
                    {isLoadingGuides ? (
                        <Text>Loading guides...</Text>
                    ) : (
                        <Select
                            placeholder="Guide"
                            bg={inputBgColor}
                            color={inputTextColor}
                            onChange={(e) => handleFormChange("guide", e.target.value)}
                        >
                            {guides.map((guide) => (
                                <option key={guide.id} value={guide.id}>
                                    {guide.name}
                                </option>
                            ))}
                        </Select>
                    )}
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        bg={inputBgColor}
                        color={inputTextColor}
                        onChange={handleImageChange}
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
                                onClick={handleRemoveImage}
                            >
                                Remove Image
                            </Button>
                        </Box>
                    )}
                    <HStack>
                        <Text>Add Schedules:</Text>
                        <TimePicker
                            onChange={handleTimeAdd}
                            format="hh:mm a"
                            clearIcon={null}
                            clockIcon={null}
                            className="chakra-input"
                        />
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
                                <Text>{time}</Text>
                                <Button
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleTimeRemove(time)}
                                >
                                    remove
                                </Button>
                            </Flex>
                        ))}
                    </Box>
                    <Button colorScheme="teal" onClick={handleSubmit}>
                        Save
                    </Button>
                </VStack>
            </form>
        </Box>
    );
}
