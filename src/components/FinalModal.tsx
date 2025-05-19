import React from "react";
import {
    Divider,
    Flex, 
    HStack, 
    Image,
    Text,
    VStack
} from "@chakra-ui/react";
import FooterBar from "./Footer";
import {CalendarIcon, TimeIcon} from "@chakra-ui/icons";
import {useGuest} from "../contexts/GuestContext";
import {format} from "date-fns";

interface FinalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FinalModal({isOpen, onClose}: FinalModalProps) {
    const { guestQuantity, name, title, selectedDate, selectedTime, imageUrl } = useGuest();

    if (!isOpen) return null;

    return (
        <Flex direction="column" h="100%" minH="700px">
            <Text textAlign="center" fontSize="xl" fontWeight="bold" py={4}>THANK YOU</Text>
            <Divider />
            <Flex flex="1" direction="column" p={4}>
                <Flex>
                    <Text
                        bg="#3182ce"
                        w="full"
                        h="70px"
                        textAlign="center"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="sm"
                        sx={{
                            WebkitTextStroke: '1px white',
                        }}
                    >
                        YOUR BOOKING HAS BEEN PLACED
                    </Text>
                </Flex>
                
                <HStack spacing={4} mt="150px">
                    <Image
                        src={imageUrl}
                        borderRadius="sm"
                        width="10%"
                        height="100px"
                        objectFit="cover"
                        mb={4}
                        alt="Tour preview image"
                    />
                    <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                            {title}
                        </Text>

                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            {name}
                        </Text>

                        <Text fontSize="sm" color="gray.600">
                            <HStack spacing={1}>
                                <Text as="span">{guestQuantity} Reserved</Text>
                            </HStack>
                        </Text>

                        <VStack spacing={0} color="gray.500">
                            <HStack spacing={1}>
                                <CalendarIcon />
                                <Text fontSize="sm">{selectedDate ? format(selectedDate, 'dd MMM yyyy') : "No Date Selected"}</Text>
                            </HStack>
                            <HStack spacing={1} marginLeft={"-5"} marginTop={"3px"}>
                                <TimeIcon />
                                <Text fontSize="sm"> {selectedTime}</Text>
                            </HStack>
                        </VStack>
                    </VStack>
                </HStack>
            </Flex>
            
            <FooterBar />
        </Flex>
    );
}