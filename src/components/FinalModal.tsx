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

    const { guestQuantity, name, title,selectedDate, selectedTime } = useGuest();

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
            <ModalOverlay/>
            <ModalContent height={"40vh"}>
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
                            src="https://anothersideoflosangelestours.com/wp-content/uploads/2022/02/image3-e1471839954960-1-1.jpg"
                            borderRadius="sm"
                            width="10%"
                            height="100px"
                            objectFit="cover"
                            mb={4}
                            marginTop={"20px"}
                            alt="Tour preview image"
                        />
                        <VStack marginTop={"20px"} align="start" spacing={1}>
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
                                <HStack spacing={1}>
                                    <TimeIcon marginLeft={"-3"}/>
                                    <Text fontSize="sm" marginLeft={"1"}> {selectedTime} PDT</Text>
                                </HStack>
                            </VStack>
                        </VStack>
                    </HStack>
                </ModalBody>
                <FooterBar onContinue={onClose} continueText={"CLOSE"}/>
            </ModalContent>
        </Modal>
    );
}