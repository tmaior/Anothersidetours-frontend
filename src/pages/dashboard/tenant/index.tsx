import {
    Box,
    VStack,
    Heading,
    Input,
    Button,
    Flex,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";

export default function TenantForm({ isEditing = false, tenantId = null, initialData = null }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const inputTextColor = useColorModeValue("black", "white");
    const router = useRouter();
    const toast = useToast();

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
    });

    const handleFormChange = (field: keyof typeof formData, value: string) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSubmit = async () => {
        try {
            const endpoint = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenantId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/tenants`;

            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(
                    `Error ${isEditing ? "updating" : "creating"} tenant`
                );
            }

            toast({
                title: isEditing ? "City Updated" : "City Created",
                description: `City ${isEditing ? "updated" : "created"} successfully.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            router.push("/dashboard/list-tenants");
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: `Failed to ${isEditing ? "update" : "create"} the city.`,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <DashboardLayout>
            <Box
                ml="250px"
                p={8}
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <Box
                    p={8}
                    bg={bgColor}
                    color="white"
                    borderRadius="md"
                    boxShadow="md"
                    maxW="600px"
                    w="100%"
                >
                    <Heading color="black" mb={4}>
                        {isEditing ? "Edit City" : "Register City"}
                    </Heading>
                    <form>
                        <VStack spacing={4} align="stretch">
                            <Input
                                placeholder="City Name"
                                bg={inputBgColor}
                                color={inputTextColor}
                                value={formData.name}
                                onChange={(e) => handleFormChange("name", e.target.value)}
                            />
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
