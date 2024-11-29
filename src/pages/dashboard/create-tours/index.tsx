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
import { useState, useEffect, useRef } from "react";
import TimePicker from "react-time-picker";

export default function CreateTour() {
    const bgColor = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.800", "white");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const inputTextColor = useColorModeValue("black", "white");

    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        duration: "",
        tenant: "",
        category: "",
        guide: "",
        addons: [],
        schedule: [],
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [isLoadingTenants, setIsLoadingTenants] = useState(true);
    const [categories, setCategories] = useState([]);
    const [guides, setGuides] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingGuides, setIsLoadingGuides] = useState(true);

    useEffect(() => {
        async function fetchTenants() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`);
                const data = await response.json();
                setTenants(data);
            } catch (error) {
                console.error("Erro ao buscar tenants:", error);
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
                console.error("Erro ao buscar categories:", error);
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
                console.error("Erro ao buscar guides:", error);
            } finally {
                setIsLoadingGuides(false);
            }
        }

        fetchTenants();
        fetchCategories();
        fetchGuides();
    }, []);

    const handleTimeAdd = (time) => {
        if (time && !timeSlots.includes(time)) {
            setTimeSlots([...timeSlots, time]);
        }
    };

    const handleTimeRemove = (time) => {
        setTimeSlots(timeSlots.filter((t) => t !== time));
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFormChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async () => {
        const data = new FormData();
        data.append("image", selectedImage);
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("duration", formData.duration);
        data.append("tenant", formData.tenant);
        data.append("category", formData.category);
        data.append("guide", formData.guide);
        data.append("addons", JSON.stringify(formData.addons));
        data.append("schedule", JSON.stringify(timeSlots));

        await fetch("/api/tours", {
            method: "POST",
            body: data,
        });
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
                    <Input
                        type="number"
                        placeholder="Price"
                        bg={inputBgColor}
                        color={inputTextColor}
                        onChange={(e) => handleFormChange("price", e.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="Duration (in hours)"
                        bg={inputBgColor}
                        color={inputTextColor}
                        onChange={(e) => handleFormChange("duration", e.target.value)}
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
                            onChange={(value) => handleTimeAdd(value)}
                            format="hh:mm a"
                            clearIcon={null}
                            clockIcon={null}
                            className="time-picker"
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
                        Salvar
                    </Button>
                </VStack>
            </form>
        </Box>
    );
}
