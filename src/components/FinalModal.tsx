import React from "react";
import {
    Divider,
    Flex, HStack, Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack
} from "@chakra-ui/react";
import FooterBar from "./Footer";
import {CalendarIcon, TimeIcon} from "@chakra-ui/icons";
import {useGuest} from "./GuestContext";
import {format} from "date-fns";

interface FinalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FinalModal({isOpen, onClose}: FinalModalProps) {

    const { guestQuantity, name, title,selectedDate, selectedTime,imageUrl } = useGuest();

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
            <ModalOverlay/>
            <ModalContent height={"700px"}>
                <ModalHeader textAlign="center">THANK YOU</ModalHeader>
                <Divider />
                <ModalBody>
                    <Flex>
                        <Text
                            bg="#DFF1DB"
                            w="full"
                            h="70px"
                            textAlign="center"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                        YOUR BOOKING HAS BEEN PLACED</Text>
                    </Flex>
                    <HStack spacing={4}>
                        <Image
                            src={imageUrl}
                            borderRadius="sm"
                            width="10%"
                            height="100px"
                            objectFit="cover"
                            mb={4}
                            marginTop={"150px"}
                            alt="Tour preview image"
                        />
                        <VStack marginTop={"150px"} align="start" spacing={1}>
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
                </ModalBody>
                <FooterBar/>
            </ModalContent>
        </Modal>
    );
}