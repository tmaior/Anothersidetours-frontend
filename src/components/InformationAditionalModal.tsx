import {
    Box,
    Divider,
    Flex, HStack, Image,
    Input,
    Modal,
    ModalBody, ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure, VStack
} from "@chakra-ui/react";
import FooterBar from "./Footer";
import FinalModal from "./FinalModal";
import React from "react";
import {CalendarIcon} from "@chakra-ui/icons";

interface InformationAdditionalModalProps {
    isOpen: boolean,
    onClose: () => void,
    onContinue?: () => void
}

function TimeIcon() {
    return null;
}

export default function InformationAdditionalModal({isOpen, onClose, onContinue}: InformationAdditionalModalProps) {
    const {isOpen: isFinalOpen, onOpen: onFinalOpen, onClose: onFinalClose} = useDisclosure();

    const handleFinishClick = () => {
        onClose();
        onFinalOpen();
    };

    return (
        <Flex>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
                <ModalOverlay/>
                <ModalContent height={"60vh"}>
                    <ModalHeader textAlign="center">ADDITIONAL INFORMATION</ModalHeader>
                    <Divider />
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontSize="sm">This experience requires a bit more information about you
                            and your group to ensure a safe and personalized experience.
                            Please complete the following detalis:
                        </Text>
                        <HStack>
                            <Flex w="600px" justifyContent="center" alignItems="center">
                                <VStack mt={-20}>
                                    <Text alignSelf={"start"} marginTop={"15px"}> ORGANIZER</Text>
                                    <Input w={"400px"} placeholder="Additional Info" mt={4} />
                                    <Input placeholder="Additional Info" mt={4} />
                                    <Input placeholder="Additional Info" mt={4} />
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
                                                <CalendarIcon />
                                                <Text fontSize="sm">Oct 10, 2024</Text>
                                            </HStack>
                                            <HStack spacing={1}>
                                                <TimeIcon />
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
