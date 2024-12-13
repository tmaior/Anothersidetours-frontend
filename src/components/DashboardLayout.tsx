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
                        onClick={() => router.push("/dashboard/list-tours")}
                    >
                        <Button
                            marginLeft={"-5"}
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
                    {/*<Divider borderColor="gray.600"/>*/}
                    {/*<Text*/}
                    {/*    fontSize="md"*/}
                    {/*    color="gray.400"*/}
                    {/*    pl={4}*/}
                    {/*    onClick={() => router.push("/dashboard/reservations")}*/}
                    {/*>*/}
                    {/*    <Button*/}
                    {/*        marginLeft={"-5"}*/}
                    {/*        justifyContent="flex-start"*/}
                    {/*        color="white"*/}
                    {/*        variant="ghost"*/}
                    {/*        w="230px"*/}
                    {/*        background={router.pathname === "/dashboard/reservations" ? "blue.500" : "transparent"}*/}
                    {/*        _hover={{*/}
                    {/*            background: "rgba(255, 255, 255, 0.1)",*/}
                    {/*            transition: "background 0.2s ease-in-out",*/}
                    {/*        }}*/}
                    {/*        _active={{*/}
                    {/*            background: "blue.500",*/}
                    {/*            color: "white",*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        <Icon name="Tours" mr={2} />*/}
                    {/*        Tours*/}
                    {/*    </Button>*/}
                    {/*</Text>*/}

                    <Divider borderColor="gray.600"/>
                    {/*<Text*/}
                    {/*    fontSize="xl"*/}
                    {/*    fontWeight="bold"*/}
                    {/*    color="white"*/}
                    {/*    _hover={{cursor: "pointer"}}*/}
                    {/*>*/}
                    {/*    Add-ons*/}
                    {/*</Text>*/}
                    {/*<Text*/}
                    {/*    fontSize="md"*/}
                    {/*    color="gray.400"*/}
                    {/*    pl={4}*/}
                    {/*    onClick={() => router.push("/dashboard/create-addons")}*/}
                    {/*    _hover={{cursor: "pointer", color: "gray.200"}}*/}
                    {/*>*/}
                    {/*    Register Add-ons*/}
                    {/*</Text>*/}
                    {/*<Text*/}
                    {/*    fontSize="md"*/}
                    {/*    color="gray.400"*/}
                    {/*    pl={4}*/}
                    {/*    onClick={() => router.push("/dashboard/list-addons")}*/}
                    {/*    _hover={{cursor: "pointer", color: "gray.200"}}*/}
                    {/*>*/}
                    {/*    List Add-ons*/}
                    {/*</Text>*/}
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/list-addons")}
                    >
                        <Button
                            marginLeft={"-5"}
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
                    <Divider borderColor="gray.600"/>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/categories")}
                    >
                        <Button
                            marginLeft={"-5"}
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
                    <Divider borderColor="gray.600"/>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => router.push("/dashboard/blackouts")}
                    >
                        <Button
                            marginLeft={"-5"}
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
                    <Divider borderColor="gray.600"/>
                    {/*<Text*/}
                    {/*    fontSize="xl"*/}
                    {/*    fontWeight="bold"*/}
                    {/*    color="white"*/}
                    {/*    _hover={{ cursor: "pointer" }}*/}
                    {/*>*/}
                    {/*    Employees*/}
                    {/*</Text>*/}
                </VStack>
            </Box>
            <Box flex="1" p={8} bg="white">
                {children}
            </Box>
        </Box>
    );
}
