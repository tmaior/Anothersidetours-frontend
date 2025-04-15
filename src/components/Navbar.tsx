import {Box, Flex, Text} from "@chakra-ui/react";
import {useGuest} from "../contexts/GuestContext";

interface NavbarProps {
    title?: string;
    description?: string;
    imageUrl?: string;
}

export default function Navbar({title, description}:NavbarProps) {

    const {imageUrl} = useGuest();

    return (
        <>
            <Box position="relative" w="full" h={{ base: "180px", sm: "200px", md: "250px" }}>
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
                    w="full"
                    h="100%"
                    align="center"
                    justify="flex-start"
                    flexDirection="column"
                    color="white"
                    textAlign="center"
                    p={{ base: 2, md: 4 }}
                >
                    <Text 
                        fontSize={{ base: "xl", sm: "2xl", md: "3xl" }} 
                        fontWeight="thin" 
                        mb={{ base: 2, md: 4 }}
                        px={{ base: 2, md: 4 }}
                    >
                        {title}
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }}>
                        <span>⏱ 4 hours</span> <br/>
                    </Text>
                    <Text 
                        mt={{ base: 2, md: 4 }} 
                        noOfLines={5}
                        fontSize={{ base: "xs", sm: "sm", md: "sm" }}
                        px={{ base: 4, md: 6 }}
                        maxW={{ base: "100%", md: "80%" }}
                    >
                        {description}
                    </Text>
                </Flex>
            </Box>

            <Flex 
                w="full" 
                h="auto" 
                alignItems="center" 
                justify="center" 
                p={{ base: 2, md: 4 }}
            >
                <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="medium">BOOKING DETAILS</Text>
            </Flex>
        </>
    );
}