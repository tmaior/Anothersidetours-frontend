import {
    Box,
    Button,
    Flex,
    Image,
    VStack,
    Text,
    Heading,
    Spinner,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Tenant {
    id: string;
    name: string;
    subTitle?: string;
    logoUrl?: string;
    city?: string;
}

export default function SelectCity() {
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchTenants = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`);
                
                if (!res.ok) {
                    throw new Error(`Error ${res.status}: Failed to fetch tenants`);
                }
                
                const data = await res.json();
                setTenants(data);
                setError("");
            } catch (error) {
                console.error("Failed to fetch tenants:", error);
                setError("Failed to load cities. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchTenants();
    }, [router]);

    const handleCitySelect = (tenant: Tenant) => {
        localStorage.setItem("selectedTenant", JSON.stringify(tenant));
        localStorage.setItem("tenantId", tenant.id);
        router.push("/dashboard/reservation");
    };

    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.50">
            <Box
                bg="white"
                p={8}
                boxShadow="md"
                borderRadius="md"
                w={{ base: "90%", sm: "500px" }}
            >
                <Flex justify="center" mb={6}>
                    <Image
                        src="/assets/logo.png"
                        alt="Logo"
                        w="200px"
                    />
                </Flex>

                <Heading 
                    as="h2" 
                    size="md" 
                    textAlign="center" 
                    color="green.700" 
                    mb={6}
                >
                    SELECT CITY
                </Heading>

                {loading ? (
                    <Flex justify="center" my={8}>
                        <Spinner size="xl" color="blue.500" />
                    </Flex>
                ) : error ? (
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        {error}
                    </Alert>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {tenants.map((tenant) => (
                            <Button
                                key={tenant.id}
                                onClick={() => handleCitySelect(tenant)}
                                display="flex"
                                alignItems="center"
                                justifyContent="flex-start"
                                height="auto"
                                py={3}
                                px={4}
                                borderRadius="md"
                                bg="white"
                                borderWidth="1px"
                                borderColor="gray.200"
                                _hover={{ bg: "gray.50", borderColor: "blue.300" }}
                                transition="all 0.2s"
                                width="100%"
                            >
                                <Image
                                    src={tenant.logoUrl || "/assets/default-logo.png"}
                                    alt={tenant.name}
                                    boxSize="40px"
                                    mr={4}
                                    fallbackSrc="/assets/default-logo.png"
                                />
                                <Box textAlign="left">
                                    <Text fontWeight="medium" fontSize="sm">
                                        {tenant.name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                        {tenant.subTitle || `Another Side Of ${tenant.city || ""} Tours`}
                                    </Text>
                                </Box>
                            </Button>
                        ))}
                    </VStack>
                )}
            </Box>
        </Flex>
    );
}