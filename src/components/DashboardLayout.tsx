import {Box, VStack, Text, Divider} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <Box display="flex" minH="100vh">
            <Box
                as="nav"
                width="250px"
                bg="black"
                p={4}
                borderRight="1px solid #333"
                display="flex"
                flexDirection="column"
                alignItems="stretch"
            >
                <VStack spacing={4} align="stretch" mt="20">
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                        onClick={() => router.push("/dashboard/home")}
                    >
                        Home
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                    >
                        Cities
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/tenant")}
                        _hover={{ cursor: "pointer", color: "gray.200" }}
                    >
                        Register Cities
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/list-cities")}
                        _hover={{ cursor: "pointer", color: "gray.200" }}
                    >
                        List Cities
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                    >
                        Tour
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/create-tours")}
                        _hover={{ cursor: "pointer", color: "gray.200" }}
                    >
                        Register Tours
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/list-tours")}
                        _hover={{ cursor: "pointer", color: "gray.200" }}
                    >
                        List Tours
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                    >
                        Reservations
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/reservations")}
                        _hover={{ cursor: "pointer", color: "gray.200" }}
                    >
                        Reservations
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                    >
                        Guides
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        onClick={() => router.push("/dashboard/categories")}
                        _hover={{ cursor: "pointer" }}
                    >
                        Categories
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        onClick={() => router.push("/dashboard/blackouts")}
                        _hover={{ cursor: "pointer" }}
                    >
                        Blackouts
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                    >
                        Additional Information
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                    >
                        Employees
                    </Text>
                </VStack>
            </Box>
            <Box flex="1" p={8} bg="gray.100">
                {children}
            </Box>
        </Box>
    );
}
