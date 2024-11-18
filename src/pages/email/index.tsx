import {Divider, Flex, HStack, Text, VStack} from "@chakra-ui/react";
import React from "react";

export default function Email() {
    return (
        <Flex w={"60%"} h={"100vh"} justify={"center"} align={"center"}>
            <Flex justify={"center"} w={"60%"} h={"80vh"} marginBottom={"250px"}>
                <VStack w={"100%"} justify={"start"} align={"center"} marginTop={"20px"}>
                    <Flex align={"center"} w={"100%"} h={"20vh"} justify={"center"}>
                        <Text fontSize={"xxx-large"}> LOGO</Text>
                    </Flex>
                    <Flex>
                        <Text fontWeight={"bold"}> STATUS</Text>
                    </Flex>
                    <Flex marginTop={"-10px"}>
                        <Text fontWeight={"bold"}> DESCRIPTION</Text>
                    </Flex>
                    <Flex marginTop={"10px"}>
                        <Text fontWeight={"bold"}> ICON STATUS</Text>
                    </Flex>
                    <Divider/>
                    <HStack w={"100%"}>
                        <Flex marginLeft={"10px"} h={"20px"} w={"200px"}>
                            <Text fontWeight={"bold"}> DATA TESTE TESTE</Text>
                        </Flex>
                        <VStack justify={"right"} w={"90%"}>
                            <Flex w={"100%"} justify={"right"} marginRight={"100px"}>
                                <Text>TIME</Text>
                            </Flex>
                            <Flex w={"100%"} justify={"right"} marginRight={"100px"}>
                                <Text>DURATION</Text>
                            </Flex>
                        </VStack>
                    </HStack>
                    <Divider/>
                    <Flex w={"600px"} h={"40%"}>
                        <HStack w={"500px"} justify={"left"}>
                            <VStack w={"100%"} justify={"center"} spacing={230} align={"center"} marginTop={"130px"}>
                                <Flex w={"70%"} h={"10%"} justify={"top"} marginTop={"-220px"}>
                                    <Text> CONTACT INFORMATION 1</Text>
                                </Flex>
                                <Flex w={"70%"} h={"10%"} justify={"top"} marginTop={"-220px"}>
                                    <Text> CONTACT INFORMATION 1</Text>
                                </Flex>
                                <Flex w={"70%"} h={"10%"} justify={"top"} marginTop={"-220px"}>
                                    <Text> CONTACT INFORMATION 1</Text>
                                </Flex>
                                <Flex w={"70%"} h={"10%"} justify={"top"} marginTop={"-220px"}>
                                    <Text> CONTACT INFORMATION 1</Text>
                                </Flex>
                            </VStack>
                        </HStack>
                        <HStack h={"full"} w={"500px"} height={"250px"} justifyContent={"center"}
                                alignItems={"flex-start"} pt={4}>
                            <VStack align={"center"} spacing={4} w={"100%"}>
                                <Flex marginLeft={"-10"} w={"70%"} h={"30px"} justifyContent={"left"}
                                      alignItems={"center"}>
                                    <Text> CONTACT INFORMATION</Text>
                                </Flex>
                                <HStack w={"70%"} justifyContent={"space-between"} marginRight={"-50px"}
                                        marginTop={"-10px"}>
                                    <Text marginLeft={"-10"}>total</Text>
                                    <Text ml={2}>$100.00</Text>
                                </HStack>
                                <HStack w={"70%"} justifyContent={"space-between"} marginRight={"-50px"}
                                        marginTop={"-10px"}>
                                    <Text marginLeft={"-10"}>total</Text>
                                    <Text ml={2}>$100.00</Text>
                                </HStack>
                                <Divider/>
                                <HStack w={"70%"} justifyContent={"flex-end"} marginRight={"-50px"} marginTop={"-10px"}>
                                    <Text>total</Text>
                                    <Text ml={2}>$100.00</Text>
                                </HStack>
                                <HStack w={"70%"} justifyContent={"space-between"} marginRight={"-50px"}
                                        marginTop={"-10px"}>
                                    <Text marginLeft={"-10"}>total</Text>
                                    <Text ml={2}>$100.00</Text>
                                </HStack>
                                <Divider/>
                                <HStack w={"70%"} justifyContent={"flex-end"} marginRight={"-50px"} marginTop={"-10px"}>
                                    <Text>paid</Text>
                                    <Text ml={2}>$100.00</Text>
                                </HStack>
                            </VStack>
                        </HStack>
                    </Flex>
                    <Divider/>
                    <HStack h={"full"} w={"500px"} height={"250px"} justifyContent={"center"}
                            alignItems={"flex-start"} pt={4}>
                        <Flex>
                            <Text>test</Text>
                        </Flex>
                        <VStack align={"center"} spacing={4} w={"100%"}>
                            <Flex marginLeft={"-10"} w={"70%"} h={"30px"} justifyContent={"left"}
                                  alignItems={"center"}>
                                <Text> CONTACT INFORMATION</Text>
                            </Flex>
                            <HStack w={"70%"} marginRight={"-50px"}
                                    marginTop={"-10px"}>
                                <Text marginLeft={"-10"}>Tue 29 Oct, 2024</Text>
                                <Text ml={2}>11:00 AM</Text>
                            </HStack>
                            <HStack w={"70%"} justifyContent={"flex-start"} marginLeft={"-30px"} marginTop={"-10px"}>
                                <Text>guests</Text>
                            </HStack>
                        </VStack>
                    </HStack>
                    <Divider/>
                </VStack>
            </Flex>
        </Flex>
    )
}