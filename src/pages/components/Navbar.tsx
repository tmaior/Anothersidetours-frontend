import {Box, Flex, Text} from "@chakra-ui/react";

export default function Navbar() {
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
                        THE ULTIMATE HOLLYWOOD TOUR
                    </Text>
                    <Text fontSize="md">
                        <span>⏱ 4 hours</span> <br/>
                    </Text>
                    <Text mt={4}>
                        Enjoy our most popular private tour of Hollywood, Beverly Hills, & The Sunset Strip.
                        <br/>
                        This tour includes a close up of The Hollywood Sign, The Walk Of Fame, Grauman&apos;s Chinese
                        Theatre, the Celebrity Mansions of Beverly Hills, & Rodeo Drive too.
                        <br/>
                        This tour is 4 hours, includes transportation, & all details will be emailed in your formal
                        confirmation.
                    </Text>

                </Flex>
            </Box>

            <Flex w={"full"} h={"auto"} alignItems={"center"} justify={"center"} p={4}>
                <Text fontSize={"18px"}>BOOKING DETAILS</Text>
            </Flex>
        </>
    );
}
