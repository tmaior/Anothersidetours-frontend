import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    Checkbox,
    Flex,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";
import CreateTenantModal from "../tenant";

export default function ListTenants() {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [filteredTenants, setFilteredTenants] = useState([]);
    const toast = useToast();
    const router = useRouter();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        async function fetchTenants() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`);
                const data = await response.json();
                setTenants(Array.isArray(data) ? data : []);
                setFilteredTenants(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching tenants:", error);
                toast({
                    title: "Error",
                    description: "Failed to load tenants.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        fetchTenants();
    }, [toast]);

    useEffect(() => {
        let filtered = tenants;

        if (searchName) {
            filtered = filtered.filter((tenant) =>
                tenant.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredTenants(filtered);
    }, [searchName, tenants]);

    const handleSelectTenant = (id) => {
        setSelectedTenant(selectedTenant === id ? null : id);
    };

    const handleDelete = async () => {
        if (selectedTenant) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${selectedTenant}`, {
                    method: "DELETE",
                });
                setTenants(tenants.filter((tenant) => tenant.id !== selectedTenant));
                setSelectedTenant(null);
                toast({
                    title: "Tenant Deleted",
                    description: "The selected tenant has been deleted.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error deleting tenant:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete the tenant.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleEdit = () => {
        if (selectedTenant) {
            router.push(`/dashboard/edit-tenant/${selectedTenant}`);
        }
    };

    const handleCreateTenant = () => {
        setIsCreateModalOpen(true);
    };

    const addTenantToList = (newTenant) => {
        setTenants([newTenant, ...tenants]);
        setFilteredTenants([newTenant, ...filteredTenants]);
    };

    return (
        <DashboardLayout>
            <Box bg={bgColor} p={8} borderRadius="md" color="black">
                <HStack mb={4} spacing={4}>
                    <Input
                        placeholder="Search by name"
                        bg={inputBgColor}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <Button colorScheme="teal" onClick={handleCreateTenant}>
                        Create Tenant
                    </Button>
                </HStack>
                <VStack spacing={6} align="stretch">
                    {filteredTenants.map((tenant) => (
                        <Flex
                            key={tenant.id}
                            p={4}
                            bg="gray.700"
                            borderRadius="md"
                            boxShadow="md"
                            align="center"
                        >
                            <Checkbox
                                isChecked={selectedTenant === tenant.id}
                                onChange={() => handleSelectTenant(tenant.id)}
                                colorScheme="teal"
                                mr={4}
                            />
                            <Text color="white" fontSize="lg" fontWeight="bold">
                                {tenant.name}
                            </Text>
                        </Flex>
                    ))}
                </VStack>
                <HStack mt={4} spacing={4}>
                    <Button
                        colorScheme="blue"
                        onClick={handleEdit}
                        isDisabled={!selectedTenant}
                    >
                        Edit
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleDelete}
                        isDisabled={!selectedTenant}
                    >
                        Delete
                    </Button>
                </HStack>
            </Box>
            <CreateTenantModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                addTenantToList={addTenantToList}
            />
        </DashboardLayout>
    );
}
