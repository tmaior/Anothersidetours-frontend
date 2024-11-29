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
        tenant: "",
        category: "",
        guide: "",
        addons: [],
        schedule: [],
        imageUrl: "",
    });

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
                tenant: initialData.tenantId || "",
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
                schedule: timeSlots.map((time) => new Date(`1970-01-01T${time}:00`).toISOString()),
                imageUrl,
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
                    <Heading color={"black"} mb={4}>{isEditing ? "Editing Tour" : "Register Tour"}</Heading>
                    <form>
                        <VStack spacing={4} align="stretch">
                            <Input
                                placeholder="Tour Name"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.name}
                                onChange={(e) => handleFormChange("name", e.target.value)}
                            />
                            <Textarea
                                placeholder="Description"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.description}
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
                                onValueChange={(value) => handleFormChange("price", parseFloat(value || "0"))}
                            />
                            <Input
                                type="number"
                                placeholder="Duration (in hours)"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.duration}
                                onChange={(e) => handleFormChange("duration", Number(e.target.value))}
                            />
                            <Select
                                placeholder="Select the City"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.tenant}
                                onChange={(e) => handleFormChange("tenant", e.target.value)}
                            >
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.name}
                                    </option>
                                ))}
                            </Select>
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
                                    value={null}
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
                                            Remove
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
            </Box>
        </DashboardLayout>
    );
}
