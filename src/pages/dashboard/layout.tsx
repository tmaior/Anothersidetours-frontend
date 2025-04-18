import {ReactNode, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import axios, {AxiosResponse} from 'axios';
import {Box, Center, Flex, Spinner, useToast} from '@chakra-ui/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
const AUTH_TIMEOUT = 10000;

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({children}: DashboardLayoutProps) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error("Authentication request timed out"));
                }, AUTH_TIMEOUT);
            });

            try {
                const authPromise = axios.get(`${API_URL}/auth/profile`, {
                    withCredentials: true,
                });

                const response = await Promise.race([authPromise, timeoutPromise]) as AxiosResponse;

                if (response?.data) {
                    setIsAuthenticated(true);
                    // localStorage.setItem("user", JSON.stringify(response.data));
                } else {
                    throw new Error("No user data");
                }
            } catch (error) {
                console.error("Authentication error:", error);
                // localStorage.removeItem("user");

                toast({
                    title: "Session Expired",
                    description: "Your session has expired or could not be validated. Please login again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });

                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, toast]);

    if (loading) {
        return (
            <Center h="100vh">
                <Flex direction="column" align="center">
                    <Spinner size="xl" color="blue.500" mb={4}/>
                </Flex>
            </Center>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <Box>{children}</Box>;
} 