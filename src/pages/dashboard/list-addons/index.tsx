import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    HStack,
    Select,
    Text,
    VStack,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";

export default function ListAddons() {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [addons, setAddons] = useState([]);
    const [selectedAddon, setSelectedAddon] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [filterTenant, setFilterTenant] = useState("");
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const [addonsRes, tenantsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`),
                ]);

                const [addonsData, tenantsData] = await Promise.all([
                    addonsRes.json(),
                    tenantsRes.json(),
                ]);

                setAddons(addonsData);
                setTenants(tenantsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load addons or tenants.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        fetchData();
    }, [toast]);

    const handleDelete = async () => {
        if (selectedAddon) {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/addons/${selectedAddon}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error("Failed to delete the add-on.");
                }

                setAddons(addons.filter((addon) => addon.id !== selectedAddon));
                setSelectedAddon(null);
                toast({
                    title: "Add-on Deleted",
                    description: "The selected add-on has been deleted.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error deleting add-on:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete add-on.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleEdit = () => {
        if (selectedAddon) {
            router.push({
                pathname: "/dashboard/create-addons",
                query: { addonId: selectedAddon },
            });
        }
    };

    return (
        <DashboardLayout>
            <Box bg={bgColor} p={8} borderRadius="md">
                <HStack mb={4}>
                    <Select
                        placeholder="Filter by Tenant"
                        bg={inputBgColor}
                        onChange={(e) => setFilterTenant(e.target.value)}
                    >
                        {tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                                {tenant.name}
                            </option>
                        ))}
                    </Select>
                </HStack>
                <VStack spacing={4} align="stretch">
                    {addons
                        .filter((addon) => !filterTenant || addon.tenantId === filterTenant)
                        .map((addon) => (
                            <Flex
                                key={addon.id}
                                p={4}
                                bg="gray.700"
                                borderRadius="md"
                                alignItems="stretch"
                                w="100%"
                                maxW="800px"
                            >
                                <Checkbox
                                    isChecked={selectedAddon === addon.id}
                                    onChange={() => setSelectedAddon(selectedAddon === addon.id ? null : addon.id)}
                                    mr={4}
                                />
                                <Box flex="1">
                                    <Heading fontSize="md" color="white" mb={2}>
                                        {addon.label}
                                    </Heading>
                                    <Text color="gray.400" mb={1}>{addon.description}</Text>
                                    <Text color="gray.400" mb={1}>
                                        Type: {addon.type === "CHECKBOX" ? "Unique" : "Quantity"}
                                    </Text>
                                    <Text color="gray.400">Price: ${addon.price.toFixed(2)}</Text>
                                </Box>
                            </Flex>
                        ))}
                </VStack>
                <HStack mt={4}>
                    <Button colorScheme="blue" onClick={handleEdit} isDisabled={!selectedAddon}>
                        Edit
                    </Button>
                    <Button colorScheme="red" onClick={handleDelete} isDisabled={!selectedAddon}>
                        Delete
                    </Button>
                </HStack>
            </Box>
        </DashboardLayout>
    );
}
