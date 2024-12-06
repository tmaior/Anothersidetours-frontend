import { Box, Button, Heading, Input, Select, Text, Textarea, useColorModeValue, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function AddonForm() {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const inputTextColor = useColorModeValue("black", "white");
    const router = useRouter();
    const { addonId } = router.query;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        tenantId: "",
        tourId: "",
        label: "",
        description: "",
        type: "CHECKBOX",
        price: 0,
    });

    const [tenants, setTenants] = useState([]);
    const [tours, setTours] = useState([]);

    useEffect(() => {
        async function fetchData() {
            if (addonId) {
                setIsEditing(true);
                const addonRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons/${addonId}`);
                const addonData = await addonRes.json();
                setFormData({
                    tenantId: addonData.tenantId || "",
                    tourId: addonData.tourId || "",
                    label: addonData.label || "",
                    description: addonData.description || "",
                    type: addonData.type || "CHECKBOX",
                    price: addonData.price || 0,
                });
            }

            const [tenantsRes, toursRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours`),
            ]);

            const [tenantsData, toursData] = await Promise.all([tenantsRes.json(), toursRes.json()]);
            setTenants(tenantsData);
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

            router.push("/dashboard/list-addons");
        } catch (error) {
            console.error(error);
            alert("Error processing the request");
        }
    };

    return (
        <DashboardLayout>
            <Box ml="250px" p={8}>
                <Box p={8} bg={bgColor} color="white" borderRadius="md" maxW="800px" w="100%">
                    <Heading color={"black"} mb={4}>
                        {isEditing ? "Edit Add-on" : "Create Add-on"}
                    </Heading>
                    <form>
                        <VStack spacing={4}>
                            <Text>Tenant</Text>
                            <Select
                                placeholder="Select Tenant"
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

                            <Text>Tour</Text>
                            <Select
                                placeholder="Select Tour"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.tourId}
                                onChange={(e) => handleFormChange("tourId", e.target.value)}
                            >
                                {tours.map((tour) => (
                                    <option key={tour.id} value={tour.id}>
                                        {tour.name}
                                    </option>
                                ))}
                            </Select>

                            <Text>Label</Text>
                            <Input
                                placeholder="Label"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.label}
                                onChange={(e) => handleFormChange("label", e.target.value)}
                            />

                            <Text>Description</Text>
                            <Textarea
                                placeholder="Description"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.description}
                                onChange={(e) => handleFormChange("description", e.target.value)}
                            />

                            <Text>Type</Text>
                            <Select
                                value={formData.type}
                                onChange={(e) => handleFormChange("type", e.target.value)}
                                bg={inputBgColor}
                                color={inputTextColor}
                            >
                                <option value="CHECKBOX">Unique</option>
                                <option value="SELECT">Quantity</option>
                            </Select>

                            <Text>Price</Text>
                            <Input
                                type="number"
                                placeholder="Price"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.price}
                                onChange={(e) => handleFormChange("price", parseFloat(e.target.value))}
                            />

                            <Button colorScheme="teal" onClick={handleSubmit}>
                                {isEditing ? "Update" : "Create"}
                            </Button>
                        </VStack>
                    </form>
                </Box>
            </Box>
        </DashboardLayout>
    );
}
