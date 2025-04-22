import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    HStack,
    Input,
    Text,
    useColorModeValue,
    useToast,
    VStack,
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";
import withAuth from "../../../utils/withAuth";
import {useGuest} from "../../../contexts/GuestContext";

function ListAddons() {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [addons, setAddons] = useState([]);
    const [filteredAddons, setFilteredAddons] = useState([]);
    const [selectedAddon, setSelectedAddon] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const toast = useToast();
    const router = useRouter();
    const {tenantId} = useGuest();

    useEffect(() => {
        async function fetchData() {
            try {
                const addonsRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/addons/byTenantId/${tenantId}`,
                    {
                        credentials: "include",
                    }
                );
                const addonsData = await addonsRes.json();
                setAddons(addonsData);
                setFilteredAddons(addonsData);
            } catch (error) {
                console.error("Error fetching addons:", error);
                toast({
                    title: "Error",
                    description: "Failed to load addons.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        fetchData();
    }, [tenantId, toast]);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = addons.filter((addon) =>
            addon.label.toLowerCase().includes(value)
        );
        setFilteredAddons(filtered);
    };

    const handleDelete = async () => {
        if (selectedAddon) {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/addons/${selectedAddon}`,
                    {method: "DELETE",
                    credentials: "include",}
                );

                if (!response.ok) {
                    throw new Error("Failed to delete the add-on.");
                }

                setAddons(addons.filter((addon) => addon.id !== selectedAddon));
                setFilteredAddons(
                    filteredAddons.filter((addon) => addon.id !== selectedAddon)
                );
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
                query: {addonId: selectedAddon},
            });
        }
    };

    return (
        <DashboardLayout>
            <Box bg={bgColor} p={8} borderRadius="md">
                <HStack mb={4} spacing={4}>
                    <Input
                        placeholder="Search Add-ons"
                        bg={inputBgColor}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Button
                        colorScheme="blue"
                        onClick={() => router.push("/dashboard/create-addons")}
                    >
                        + Create Add-ons
                    </Button>
                </HStack>
                <VStack spacing={4} align="stretch">
                    {filteredAddons.length > 0 ? (
                        filteredAddons.map((addon) => (
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
                                    onChange={() =>
                                        setSelectedAddon(
                                            selectedAddon === addon.id ? null : addon.id
                                        )
                                    }
                                    mr={4}
                                />
                                <Box flex="1">
                                    <Heading fontSize="md" color="white" mb={2}>
                                        {addon.label}
                                    </Heading>
                                    <Text color="gray.400" mb={1}>
                                        {addon.description}
                                    </Text>
                                    <Text color="gray.400" mb={1}>
                                        Type:{" "}
                                        {addon.type === "CHECKBOX"
                                            ? "Unique"
                                            : "Quantity"}
                                    </Text>
                                    <Text color="gray.400">
                                        Price: ${addon.price.toFixed(2)}
                                    </Text>
                                </Box>
                            </Flex>
                        ))
                    ) : (
                        <Text color="gray.500">No add-ons found.</Text>
                    )}
                </VStack>
                <HStack mt={4}>
                    <Button
                        colorScheme="blue"
                        onClick={handleEdit}
                        isDisabled={!selectedAddon}
                    >
                        Edit
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleDelete}
                        isDisabled={!selectedAddon}
                    >
                        Delete
                    </Button>
                </HStack>
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(ListAddons);