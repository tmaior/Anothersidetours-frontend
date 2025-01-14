import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Text,
    VStack,
} from "@chakra-ui/react";
import axios from "axios";
import {CiSquarePlus} from "react-icons/ci";

const ChangeArrivalModal = ({isOpen, onClose, booking}) => {
    const [selectedDate, setSelectedDate] = useState(booking.date || "2025-01-14");
    const [selectedTime, setSelectedTime] = useState(booking.time || "11:00 AM");
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [cardDetails, setCardDetails] = useState(null);


    const handleSaveChanges = () => {
    };

    useEffect(() => {
        const fetchCardDetails = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${booking.paymentMethodId}`);
                setCardDetails(response.data);
            } catch (error) {
                console.error("Failed to fetch card details:", error);
            }
        };

        if (booking.paymentMethodId) {
            fetchCardDetails();
        }
    }, [booking.paymentMethodId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
            <ModalOverlay/>
            <ModalContent h="600px" maxH="80vh">
                <ModalHeader display="flex" justifyContent="center" fontSize={"3xl"} fontWeight={"medium"}>Change
                    Arrival</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <HStack align="center">
                        <VStack align="start" flex="2" marginTop={"-130px"}>
                            <FormControl>
                                <FormLabel>Date</FormLabel>
                                <Input
                                    type="date"
                                    value={booking.selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    size="sm"
                                    w="200px"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Time</FormLabel>
                                <Select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    size="sm"
                                    w="200px"
                                >
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="12:00 PM">12:00 PM</option>
                                    <option value="1:00 PM">1:00 PM</option>
                                    <option value="2:00 PM">2:00 PM</option>
                                </Select>
                            </FormControl>
                            <Button
                                variant="link"
                                size="xs"
                                onClick={() => setGuideModalOpen(true)}
                                color="black"
                                fontWeight={"bold"}
                            >
                                <CiSquarePlus size={"17px"}/>
                                Add a new time
                            </Button>
                        </VStack>

                        <VStack
                            bg="gray.50"
                            p={6}
                            borderRadius="md"
                            borderWidth="1px"
                            flex="2"
                            spacing={6}
                            align="stretch"
                            w="100%"
                            h="350px"
                            minW="300px"
                            minH="300px"
                        >
                            <Box padding={"10px"}
                                 w="100%"
                                 h="500px"
                            >
                                <Text fontWeight="bold" mb={2}>
                                    Purchase Summary
                                </Text>
                                <VStack align="stretch" spacing={2}>
                                    <HStack justify="space-between">
                                        <Text>{`Guests ($${booking.valuePerGuest.toFixed(2)} × ${booking.guestQuantity})`}</Text>
                                        <Text>${parseFloat(booking.total_price).toFixed(2)}</Text>
                                    </HStack>
                                </VStack>
                                <Divider my={2}/>
                                <HStack justify="space-between">
                                    <Text fontWeight="bold">Total</Text>
                                    <Text fontWeight="bold">${parseFloat(booking.total_price).toFixed(2)}</Text>
                                </HStack>
                            </Box>
                            <Box>
                                <Text fontWeight="bold" mb={2}>
                                    Payment Summary
                                </Text>
                                <VStack align="stretch" spacing={2}>
                                    {cardDetails && (
                                        <HStack justify="space-between">
                                            <HStack spacing={2}>
                                                <Box as="span" role="img" aria-label="Card Icon" fontSize="lg">
                                                    💳
                                                </Box>
                                                <Text>
                                                    Payment
                                                    <Box as="span" bg="white" px={1} py={1} borderRadius="md"
                                                         boxShadow="sm">
                                                        *{cardDetails.last4}
                                                    </Box>{' '}
                                                    {formatDate(cardDetails.paymentDate)}
                                                </Text>
                                            </HStack>
                                            <Text>${parseFloat(booking.total_price).toFixed(2)}</Text>
                                        </HStack>
                                    )}
                                    <HStack justify="space-between">
                                        <Text>Paid</Text>
                                        <Text>${parseFloat(booking.total_price).toFixed(2)}</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </VStack>
                    </HStack>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Checkbox
                            isChecked={notifyCustomer}
                            onChange={(e) => setNotifyCustomer(e.target.checked)}
                        >
                            Notify Customer
                        </Checkbox>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ChangeArrivalModal;
