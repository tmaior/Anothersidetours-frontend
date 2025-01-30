import {
    Box,
    Divider,
    Flex,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import FooterBar from "./Footer";
import FinalModal from "./FinalModal";
import React, {useEffect, useState} from "react";
import {CalendarIcon} from "@chakra-ui/icons";
import AdditionalInformation from "./AdditionalInformationInputs";
import {useGuest} from "../contexts/GuestContext";

interface InformationAdditionalModalProps {
    isOpen: boolean,
    onClose: () => void,
    onContinue?: () => void
}

function TimeIcon() {
    return null;
}

export default function InformationAdditionalModal({
                                                       isOpen,
                                                       onClose,
                                                   }: InformationAdditionalModalProps) {
    const {isOpen: isFinalOpen, onOpen: onFinalOpen, onClose: onFinalClose} = useDisclosure();
    const [inputs, setInputs] = useState([]);
    const [updatedValues, setUpdatedValues] = useState({});
    const {reservationId,tourId} = useGuest();
    useEffect(() => {
        if (isOpen) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/additional-information/${tourId}`)
                .then((response) => response.json())
                .then((data) => {
                    setInputs(data);
                    const initialValues = data.reduce(
                        (acc, input) => ({ ...acc, [input.id]: "" }),
                        {}
                    );
                    setUpdatedValues(initialValues);
                    if (data.length === 0) {
                        onClose();
                        onFinalOpen();
                    }
                });
        }
    },[tourId, isOpen, onClose, onFinalOpen]);

    const handleInputChange = (id: string, value: string) => {
        setUpdatedValues((prev) => ({...prev, [id]: value}));
    };

    const handleFinishClick = async () => {
        await Promise.all(
            Object.entries(updatedValues).map(([additionalInformationId, value]) =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer-additional-information`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        additionalInformationId,
                        reservationId: reservationId,
                        value,
                    }),
                })
            )
        );
        onClose();
        onFinalOpen();
    };

    return (
        <Flex>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
                <ModalOverlay/>
                <ModalContent
                              maxHeight="80vh"
                              overflow="hidden"
                              display="flex"
                              flexDirection="column"
                >
                    <ModalHeader textAlign="center">ADDITIONAL INFORMATION</ModalHeader>
                    <Divider/>
                    <ModalCloseButton/>
                    <ModalBody
                        flex="1"
                        overflowY="auto"
                        padding="20px"
                    >
                        <Text fontSize="sm">This experience requires a bit more information about you
                            and your group to ensure a safe and personalized experience.
                            Please complete the following detalis:
                        </Text>
                        <HStack padding={"30px"}>
                            <Flex w="600px" justifyContent="center" alignItems="center">
                                <VStack>
                                    <AdditionalInformation
                                        inputs={inputs}
                                        updatedValues={updatedValues}
                                        onInputChange={handleInputChange}
                                    />
                                </VStack>
                            </Flex>
                            <HStack justifyContent="center">
                                <Box
                                    bg="white"
                                    p={4}
                                    borderRadius="md"
                                    boxShadow="md"
                                    width="300px"
                                    maxWidth="100%"
                                >
                                    <Image
                                        src="https://anothersideoflosangelestours.com/wp-content/uploads/2022/02/image3-e1471839954960-1-1.jpg"
                                        borderRadius="sm"
                                        width="100%"
                                        height="100px"
                                        objectFit="cover"
                                        mb={4}
                                        alt="Tour preview image"
                                    />
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="bold" fontSize="lg">
                                            The Ultimate Hollywood Tour
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Join us for the Ultimate private sightseeing tour in Los Angeles
                                            and immerse yourself in the birthplace of Hollywood. Our acclaimed
                                            Ultimate Hollywood Tour is the perfect blend of style and comfort,
                                            transporting you through the historic areas of Hollywood and Beverly
                                            Hills. Marvel at the Avenue of the Stars, iconic Hollywood Sign,
                                            Grauman’s Chinese Theatre, mansions of the stars, and the luxurious
                                            Rodeo Drive.
                                        </Text>
                                        <HStack spacing={4} mt={2} color="gray.500">
                                            <HStack spacing={1}>
                                                <CalendarIcon/>
                                                <Text fontSize="sm">Oct 10, 2024</Text>
                                            </HStack>
                                            <HStack spacing={1}>
                                                <TimeIcon/>
                                                <Text fontSize="sm">9:00 AM</Text>
                                            </HStack>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </HStack>
                        </HStack>
                    </ModalBody>
                    <FooterBar onContinue={handleFinishClick} continueText={"FINISH"}/>
                </ModalContent>
            </Modal>
            <FinalModal isOpen={isFinalOpen} onClose={onFinalClose}/>
        </Flex>
    );
}
