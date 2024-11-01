import {Box, Flex, Text} from "@chakra-ui/react";

interface NavbarProps {
    title: string;
    description: string;
}

export default function Navbar({title, description}:NavbarProps) {

    return (
        <>

            <Box position="relative" w="full" h="250px">
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgImage={"url('https://m01.xola.com/cache/images/5b27d2976864ea736e8b45d9_large.jpg')"}
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
                    <Text mt={4}>
                        {description}
                    </Text>

                </Flex>
            </Box>

            <Flex w={"full"} h={"auto"} alignItems={"center"} justify={"center"} p={4}>
                <Text fontSize={"18px"}>BOOKING DETAILS</Text>
            </Flex>
        </>
    );
}