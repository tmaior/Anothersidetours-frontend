import {Box, Flex, Text} from "@chakra-ui/react";
import {useGuest} from "./GuestContext";

interface NavbarProps {
    title?: string;
    description?: string;
    imageUrl?: string;
}

export default function Navbar({title, description}:NavbarProps) {

    const {imageUrl} = useGuest();

    return (
        <>

            <Box position="relative" w="full" h="250px">
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgImage={imageUrl}
                    bgPosition="center"
                    bgSize="cover"
                    bgRepeat="no-repeat"
                    filter="brightness(0.5)"
                />

                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="rgba(0, 0, 0, 0.5)"
                />

                <Flex
                    position="relative"
                    w={"full"}
                    h={"100%"}
                    align="center"
                    justify="flex-start"
                    flexDirection="column"
                    color="white"
                    textAlign="center"
                    p={4}
                >
                    <Text fontSize="3xl" fontWeight="thin" mb={4}>
                        {title}
                    </Text>
                    <Text fontSize="md">
                        <span>⏱ 4 hours</span> <br/>
                    </Text>
                    <Text mt={4} noOfLines={5}>
                        {description}
                    </Text>

                </Flex>
            </Box>

            <Flex w={"full"} h={"auto"} alignItems={"center"} justify={"center"} p={1}>
                <Text fontSize={"18px"}>BOOKING DETAILS</Text>
            </Flex>
        </>
    );
}