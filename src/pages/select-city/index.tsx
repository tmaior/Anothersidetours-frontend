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
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

interface Tenant {
    imageUrl: string;
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
    const { currentUser, isLoadingAuth } = useAuth();
    const [authChecked, setAuthChecked] = useState(false);

    const fetchTenants = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
                withCredentials: true,
            });
            
            if (res.data && Array.isArray(res.data)) {
                setTenants(res.data);
                setError("");
            } else {
                setError("Invalid data received from server");
            }
        } catch (error) {
            console.error("Failed to fetch tenants:", error);
            if (error.response) {
                console.error("Response Details", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            
            setError("Failed to load cities. Please try again.");

            if (error.response && error.response.status === 401) {
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (!isLoadingAuth) {
            setAuthChecked(true);
            
            if (!currentUser) {
                router.push("/login");
                return;
            }
            fetchTenants();
        }
    }, [isLoadingAuth, currentUser, router, fetchTenants]);

    const handleCitySelect = (tenant: Tenant) => {
        localStorage.setItem("selectedTenant", JSON.stringify(tenant));
        localStorage.setItem("tenantId", tenant.id);
        router.push("/dashboard/reservation");
    };

    if (isLoadingAuth || !authChecked) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="gray.50">
                <Spinner size="xl" color="blue.500" />
                <Text ml={3}>Checking authentication...</Text>
            </Flex>
        );
    }

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
                        <Text ml={3}>Loading cities...</Text>
                    </Flex>
                ) : error ? (
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        {error}
                    </Alert>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {tenants.length === 0 ? (
                            <Text textAlign="center" color="gray.500">No cities available</Text>
                        ) : (
                            tenants.map((tenant) => (
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
                                        src={tenant.imageUrl || "/assets/default-logo.png"}
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
                            ))
                        )}
                    </VStack>
                )}
            </Box>
        </Flex>
    );
}