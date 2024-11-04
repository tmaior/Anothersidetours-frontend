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

interface FinalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FinalModal({isOpen, onClose}: FinalModalProps) {
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
                        />
                        <VStack marginTop={"20px"} align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="lg">
                                The Ultimate Hollywood Tour
                            </Text>

                            <Text fontSize="sm" fontWeight="bold" color="gray.700">
                                Client
                            </Text>

                            <Text fontSize="sm" color="gray.600">
                                <HStack spacing={1}>
                                    <Text as="span">1 Reserved</Text>
                                </HStack>
                            </Text>

                            <VStack spacing={0} color="gray.500">
                                <HStack spacing={1}>
                                    <CalendarIcon />
                                    <Text fontSize="sm">Oct 10, 2024</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <TimeIcon />
                                    <Text fontSize="sm">9:00 AM PDT</Text>
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