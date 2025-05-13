import {
    Box,
    Divider,
    Flex,
    HStack,
    Image,
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
    const {reservationId, tourId, title, description, selectedDate, selectedTime, imageUrl} = useGuest();
    const [tourDetails, setTourDetails] = useState({
        name: title || "",
        description: description || "",
        imageUrl: imageUrl || "https://anothersideoflosangelestours.com/wp-content/uploads/2022/02/image3-e1471839954960-1-1.jpg"
    });
    
    useEffect(() => {
        if (isOpen) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/additional-information/tour/${tourId}`,
                {
                    credentials: 'include',
                })
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
            if (!title || !description) {
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${tourId}`,
                    {
                        credentials: 'include',
                    })
                    .then(response => response.json())
                    .then(data => {
                        setTourDetails({
                            name: data.name || "",
                            description: data.description || "",
                            imageUrl: data.imageUrl || tourDetails.imageUrl
                        });
                    })
                    .catch(error => {
                        console.error("Error fetching tour details:", error);
                    });
            }
        }
    },[tourId, isOpen, onClose, onFinalOpen, title, description]);

    const handleInputChange = (id: string, value: string) => {
        setUpdatedValues((prev) => ({...prev, [id]: value}));
    };

    const handleFinishClick = async () => {
        await Promise.all(
            Object.entries(updatedValues).map(([additionalInformationId, value]) =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer-additional-information`, {
                    method: "POST",
                    credentials: 'include',
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

    const formatDate = (date) => {
        if (!date) return "No date available";
        
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (time) => {
        if (!time) return "No time available";
        return time;
    };

    if (!isOpen) return null;

    return (
        <>
            <Flex 
                direction="column" 
                minHeight="89vh"
                justify="space-between"
                w="full"
                maxW="100vw"
                overflow="hidden"
                position="relative"
            >
                <Box>
                    <Text textAlign="center" fontSize="xl" fontWeight="bold" py={4}>ADDITIONAL INFORMATION</Text>
                    <Divider/>
                    
                    <Box padding="20px">
                        <Text fontSize="sm">This experience requires a bit more information about you
                            and your group to ensure a safe and personalized experience.
                            Please complete the following details:
                        </Text>
                        
                        <Flex 
                            padding="30px" 
                            direction={{ base: "column", md: "row" }}
                            gap={8}
                        >
                            <Box flex="1" maxW={{ base: "100%", md: "60%" }}>
                                <AdditionalInformation
                                    inputs={inputs}
                                    updatedValues={updatedValues}
                                    onInputChange={handleInputChange}
                                />
                            </Box>
                            
                            <Box 
                                flex="1" 
                                maxW={{ base: "100%", md: "40%" }}
                                alignSelf="flex-start"
                            >
                                <Box
                                    bg="white"
                                    p={4}
                                    borderRadius="md"
                                    boxShadow="md"
                                    width="100%"
                                >
                                    <Image
                                        src={tourDetails.imageUrl}
                                        borderRadius="sm"
                                        width="100%"
                                        height="150px"
                                        objectFit="cover"
                                        mb={4}
                                        alt="Tour preview image"
                                    />
                                    
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="bold" fontSize="lg">
                                            {tourDetails.name}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" noOfLines={6}>
                                            {tourDetails.description}
                                        </Text>
                                        <HStack spacing={4} mt={2} color="gray.500">
                                            <HStack spacing={1}>
                                                <CalendarIcon/>
                                                <Text fontSize="sm">{formatDate(selectedDate)}</Text>
                                            </HStack>
                                            <HStack spacing={1}>
                                                <TimeIcon/>
                                                <Text fontSize="sm">{formatTime(selectedTime)}</Text>
                                            </HStack>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </Box>
                        </Flex>
                    </Box>
                </Box>
                
                <Box mt="auto" mb={4} marginTop="-30px" zIndex="1">
                    <FooterBar onContinue={handleFinishClick} continueText={"FINISH"}/>
                </Box>
            </Flex>
            
            <FinalModal isOpen={isFinalOpen} onClose={onFinalClose}/>
        </>
    );
}
