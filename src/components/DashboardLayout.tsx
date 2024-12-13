import {Box, Button, Divider, HStack, Image, Text, VStack} from "@chakra-ui/react";
import {useRouter} from "next/router";
import React from "react";
import {SlCalender} from "react-icons/sl";
import {FaBoxArchive} from "react-icons/fa6";
import {MdAddchart, MdOutlineCategory} from "react-icons/md";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <Box display="flex" minH="100vh">
            <Box
                as="nav"
                width="250px"
                bg="#222324"
                p={4}
                borderRight="1px solid #333"
                display="flex"
                flexDirection="column"
                alignItems="stretch"
            >
                <VStack spacing={4} align="stretch">
                    <Box
                        as="button"
                        onClick={() => router.push("/dashboard/reservations")}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Image
                            src="/assets/logo2.png"
                            alt="Home Logo"
                            boxSize="200px"
                            objectFit="contain"
                        />
                    </Box>
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{cursor: "pointer"}}
                    >
                    </Text>
                    {/*<Text*/}
                    {/*    fontSize="md"*/}
                    {/*    color="gray.400"*/}
                    {/*    pl={4}*/}
                    {/*    onClick={() => router.push("/dashboard/tenant")}*/}
                    {/*    _hover={{ cursor: "pointer", color: "gray.200" }}*/}
                    {/*>*/}
                    {/*    Register Tenant*/}
                    {/*</Text>*/}
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/Dashboard")}
                    >
                        <Button
                            marginTop={"-30px"}
                            marginLeft={"-5"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/Dashboard" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Dashboard"/>
                                <Text>Dashboard</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/Purchases")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/Purchases" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Purchases"/>
                                <Text>Purchases</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/Customer")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/Customer" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Customer"/>
                                <Text>Customer</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/list-tours")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/list-tours" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Products"/>
                                <Text>Products</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/Resources")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/Resources" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Resources"/>
                                <Text>Resources</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/Reports")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/Reports" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Reports"/>
                                <Text>Reports</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/Marketing")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/Marketing" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Marketing"/>
                                <Text>Marketing</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/Distribution")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/Distribution" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Distribution"/>
                                <Text>Distribution</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/App Store")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/App Store" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Distribution"/>
                                <Text>App Store</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/Settings")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/Settings" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <FaBoxArchive name="Settings"/>
                                <Text>Settings</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/list-addons")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/list-addons" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <MdAddchart name="Add-ons"/>
                                <Text>Add-ons</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/categories")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/categories" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <MdOutlineCategory name="Categories"/>
                                <Text>Categories</Text>
                            </HStack>
                        </Button>
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/blackouts")}
                    >
                        <Button
                            marginLeft={"-5"}
                            marginTop={"-30px"}
                            justifyContent="flex-start"
                            color="white"
                            variant="ghost"
                            w="230px"
                            background={router.pathname === "/dashboard/blackouts" ? "blue.500" : "transparent"}
                            _hover={{
                                background: "rgba(255, 255, 255, 0.1)",
                                transition: "background 0.2s ease-in-out",
                            }}
                            _active={{
                                background: "blue.500",
                                color: "white",
                            }}
                        >
                            <HStack spacing={3}>
                                <SlCalender name="Blackouts"/>
                                <Text>Blackouts</Text>
                            </HStack>
                        </Button>
                    </Text>
                </VStack>
            </Box>
            <Box flex="1" p={8} bg="white">
                {children}
            </Box>
        </Box>
    );
}
