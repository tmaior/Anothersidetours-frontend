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
import DatePicker from "./TimePickerArrival";
import AddTimeSlotModal from "./AddTimeSlotModal";

const ChangeArrivalModal = ({isOpen, onClose, booking}) => {
    const [selectedDate, setSelectedDate] = useState(booking.dateFormatted || "2025-01-14");
    const [selectedTime, setSelectedTime] = useState(booking.time || "11:00 AM");
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [cardDetails, setCardDetails] = useState(null);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [isTimeslotModalOpen, setTimeslotModalOpen] = useState(false);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [schedules, setSchedules] = useState<{ value: string; label: string }[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);

    const fetchSchedules = async () => {
        if (!booking.id) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/listScheduleByTourId/45ff048a-a6f4-480e-8c15-19f1994a2ea0`
            );
            const data = await res.json();

            const formattedSchedules = data.map((timeStr: string) => {
                let dateObj: Date;
                const testDate = `2024-12-20 ${timeStr}`;
                dateObj = new Date(testDate);

                if (isNaN(dateObj.getTime())) {
                    return {
                        value: timeStr,
                        label: timeStr,
                    };
                }

                return {
                    value: timeStr,
                    label: dateObj.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    }),
                };
            });

            setAvailableTimes(formattedSchedules);
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
            setLoadingSchedules(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchSchedules();
        }
    }, [isOpen, selectedDate]);

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

    const handleAddTimeslot = (timeslot) => {
        console.log("New timeslot created:", timeslot);
        const formattedTimeslot = {
            value: timeslot.time,
            label: new Date(`2024-12-20 ${timeslot.time}`).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        };
        setAvailableTimes((prev) => [...prev, formattedTimeslot]);
    };

    const formatDateMMDDYYYY = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
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
                                    type="text"
                                    value={formatDateMMDDYYYY(selectedDate)}
                                    onClick={() => setDatePickerOpen(true)}
                                    size="sm"
                                    w="200px"
                                    readOnly
                                    cursor="pointer"
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
                                    {availableTimes.map((time) => (
                                        <option key={time.value} value={time.value}>
                                            {time.label}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="link"
                                size="xs"
                                onClick={() => setTimeslotModalOpen(true)}
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
                                        <Text>{`Guests ($${(booking.valuePerGuest || booking.tour?.price).toFixed(2)} × ${booking.guestQuantity})`}</Text>
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

            <Modal
                isOpen={isDatePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                size="md"
                isCentered={false}
                motionPreset="slideInBottom"
            >
                <ModalOverlay/>
                <ModalContent
                    mt="70px"
                    ml="150px"
                    position="absolute"
                    w="500px"
                >
                    <ModalBody>
                        <DatePicker
                            prices={Array(31).fill(booking.valuePerGuest || booking.tour?.price || 0)}
                            onDateSelect={(date) => {
                                const formattedDate = date.toISOString().split("T")[0];
                                setSelectedDate(formattedDate);
                                setDatePickerOpen(false);
                            }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <AddTimeSlotModal
                booking={booking}
                isOpen={isTimeslotModalOpen}
                onClose={() => setTimeslotModalOpen(false)}
                onCreate={handleAddTimeslot}
            />
        </Modal>
    );
};

export default ChangeArrivalModal;
