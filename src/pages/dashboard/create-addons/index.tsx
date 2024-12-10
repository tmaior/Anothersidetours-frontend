import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Select,
    Switch,
    Textarea,
    Text,
    VStack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import {  DeleteIcon } from "@chakra-ui/icons";
import DashboardLayout from "../../../components/DashboardLayout";
import { useRouter } from "next/router";

export default function AddonContentPage() {
    const router = useRouter();
    const { addonId } = router.query;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [price, setPrice] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        tourId: "",
        label: "",
        description: "",
        type: "CHECKBOX",
        price: 0,
        isPrivate: false,
        isRequired: false,
    });
    const [tours, setTours] = useState([]);

    useEffect(() => {
        async function fetchData() {
            if (addonId) {
                setIsEditing(true);
                const addonRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons/${addonId}`);
                const addonData = await addonRes.json();
                setFormData({
                    // tenantId: addonData.tenantId || "",
                    tourId: addonData.tourId || "",
                    label: addonData.label || "",
                    description: addonData.description || "",
                    type: addonData.type || "CHECKBOX",
                    price: addonData.price || 0,
                    isRequired: addonData.isRequired || false,
                    isPrivate: addonData.isPrivate || false,
                });
            }

            const [ toursRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours`),
            ]);

            const [toursData] = await Promise.all([
                toursRes.json(),
            ]);
            setTours(toursData);
        }

        fetchData();
    }, [addonId]);

    const handleFormChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async () => {
        const method = isEditing ? "PUT" : "POST";
        const endpoint = isEditing
            ? `${process.env.NEXT_PUBLIC_API_URL}/addons/${addonId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/addons`;

        try {
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Error ${isEditing ? "updating" : "creating"} addon`);
            }

            toast({
                title: isEditing ? "Addon Updated" : "Addon Created",
                description: `The add-on has been ${isEditing ? "updated" : "created"} successfully.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            router.push("/dashboard/list-addons");
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "An error occurred while processing the request.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleRemoveAddon = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons/${addonId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Error deleting addon");
            }

            toast({
                title: "Addon Removed",
                description: "The add-on has been successfully removed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            router.push("/dashboard/list-addons");
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "An error occurred while deleting the add-on.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <DashboardLayout>
            <Box p={8} maxWidth="900px" mx="auto">
                <VStack spacing={6} align="stretch">
                    <Text fontSize="2xl" fontWeight="bold" mb={6}>
                        {isEditing ? "Edit Add-On" : "New Add-On"}
                    </Text>

                    <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input
                            value={formData.label}
                            onChange={(e) => handleFormChange("label", e.target.value)}
                            placeholder="Enter Add-On Name"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleFormChange("description", e.target.value)}
                            placeholder="Enter Add-On Description"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Tour</FormLabel>
                        <Select
                            value={formData.tourId}
                            onChange={(e) => handleFormChange("tourId", e.target.value)}
                        >
                            <option value="">Select Tour</option>
                            {tours.map((tour) => (
                                <option key={tour.id} value={tour.id}>
                                    {tour.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Type</FormLabel>
                        <Select
                            value={formData.type}
                            onChange={(e) => handleFormChange("type", e.target.value)}
                        >
                            <option value="CHECKBOX">Checkbox</option>
                            <option value="QUANTITY">Quantity</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Price</FormLabel>
                        <HStack>
                            <Input
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="$"
                                width="auto"
                                type="number"
                            />
                        </HStack>
                    </FormControl>

                    <FormControl>
                        <HStack>
                            <Switch
                                isChecked={formData.isPrivate}
                                onChange={() => handleFormChange("isPrivate", !formData.isPrivate)}
                            />
                            <Text>Private (Add-on is only available for back office purchases)</Text>
                        </HStack>
                    </FormControl>

                    <FormControl>
                        <HStack>
                            <Switch
                                isChecked={formData.isRequired}
                                onChange={() => handleFormChange("isRequired", !formData.isRequired)}
                            />
                            <Text>Required (Add-on required during online checkout)</Text>
                        </HStack>
                    </FormControl>

                    <HStack justify="space-between" mt={6}>
                        {isEditing && (
                            <Button colorScheme="red" onClick={handleRemoveAddon} leftIcon={<DeleteIcon />}>
                                Remove Add-On
                            </Button>
                        )}
                        <Button variant="outline" colorScheme="gray" onClick={() => router.push("/dashboard/list-addons")}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleSubmit}>
                            {isEditing ? "Save Changes" : "Create Add-On"}
                        </Button>
                    </HStack>
                </VStack>
            </Box>
        </DashboardLayout>
    );
}
