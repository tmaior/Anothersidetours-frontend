import React, {useCallback, useEffect, useState} from "react";
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
    Spinner,
    Text,
    useToast,
    VStack,
    useBreakpointValue,
    Flex,
} from "@chakra-ui/react";
import axios from "axios";
import {CiSquarePlus} from "react-icons/ci";
import DatePicker from "./TimePickerArrival";
import AddTimeSlotModal from "./AddTimeSlotModal";
import { syncSingleReservation, syncReservationForGuides } from "../utils/calendarSync";

const ChangeArrivalModal = ({isOpen, onClose, booking,}) => {
    const [selectedDate, setSelectedDate] = useState<string>();
    const [selectedTime, setSelectedTime] = useState<string>();
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [isTimeslotModalOpen, setTimeslotModalOpen] = useState(false);
    const [availableTimes, setAvailableTimes] = useState([]);
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });

    const [pendingBalance, setPendingBalance] = useState<number>(0);
    const [isLoadingPendingBalance, setIsLoadingPendingBalance] = useState<boolean>(true);
    const [reservationAddons, setReservationAddons] = useState([]);
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState<boolean>(true);
    const [cardDetails, setCardDetails] = useState(null);
    const [isLoadingCardDetails, setIsLoadingCardDetails] = useState<boolean>(true);
    const [tierPricing, setTierPricing] = useState(null);

    useEffect(() => {
        const fetchPendingTransactions = async () => {
            if (!booking?.id) return;

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                    {
                        withCredentials: true
                        , params: {payment_status: 'pending'}
                    }
                );

                if (response.data && response.data.length > 0) {
                    const filteredTransactions = response.data.filter(
                        transaction => transaction.transaction_type !== 'CREATE'
                    );

                    let totalPending = 0;

                    for (const transaction of filteredTransactions) {
                        if (transaction.transaction_direction === 'refund') {
                            totalPending -= transaction.amount;
                        } else {
                            totalPending += transaction.amount;
                        }
                    }

                    setPendingBalance(totalPending);
                }
            } catch (error) {
                console.error('Error fetching pending transactions:', error);
            } finally {
                setIsLoadingPendingBalance(false);
            }
        };

        if (isOpen) {
            fetchPendingTransactions();
        }
    }, [booking?.id, isOpen]);

    useEffect(() => {
        const fetchAddons = async () => {
            if (!booking?.id || !booking.tourId) return;

            try {
                const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`,
                        {withCredentials: true}),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`,
                        {
                            withCredentials: true
                        })
                ]);

                setAllAddons(allAddonsResponse.data);
                setReservationAddons(reservationAddonsResponse.data);
            } catch (error) {
                console.error('Error fetching add-ons:', error);
            } finally {
                setIsLoadingAddons(false);
            }
        };

        if (isOpen) {
            fetchAddons();
        }
    }, [booking?.id, booking.tourId, isOpen]);

    useEffect(() => {
        const fetchCardDetails = async () => {
            if (!booking.paymentMethodId) return;

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${booking.paymentMethodId}`
                    ,{
                        withCredentials: true
                    }
                );
                setCardDetails(response.data);
            } catch (error) {
                console.error("Failed to fetch card details:", error);
            } finally {
                setIsLoadingCardDetails(false);
            }
        };

        if (isOpen && booking.paymentMethodId) {
            fetchCardDetails();
        } else {
            setIsLoadingCardDetails(false);
        }
    }, [booking.paymentMethodId, isOpen]);

    useEffect(() => {
        const fetchTierPricing = async () => {
            if (!booking?.tourId) return;

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${booking.tourId}`,
                    {withCredentials: true}
                );

                if (response.data && response.data.length > 0) {
                    setTierPricing({
                        pricingType: response.data[0].pricingType,
                        basePrice: response.data[0].basePrice,
                        tierEntries: response.data[0].tierEntries,
                    });
                }
            } catch (error) {
                console.error('Error fetching tier pricing:', error);
            }
        };

        if (isOpen) {
            fetchTierPricing();
        }
    }, [booking?.tourId, isOpen]);

    const fetchSchedules = useCallback(async () => {
        if (!booking.id) return;
        const tourId = booking.tour?.id || booking.tourId;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/listScheduleByTourId/${tourId}`,
                {
                    credentials: "include",
                }
            );
            const data = await res.json();

            const formattedSchedules = data.map((timeStr: string) => {
                const testDate = `2024-12-20 ${timeStr}`;
                const dateObj = new Date(testDate);

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
        }
    }, [booking.id, booking.tour, booking.tourId, setAvailableTimes]);

    useEffect(() => {
        if (isOpen) {
            fetchSchedules();
        }
    }, [fetchSchedules, isOpen, selectedDate]);

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

    function parseToYYYYMMDD(dateStr) {
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) {
            return "2025-01-14";
        }
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function formatDateMMMDDYYYY(yyyyMmDd) {
        if (!yyyyMmDd || !yyyyMmDd.includes("-")) return "";
        const [year, month, day] = yyyyMmDd.split("-");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = Number(month) - 1;
        return `${monthNames[monthIndex]} ${Number(day)}, ${year}`;
    }

    function combineDateAndTime(dateStr: string, timeStr: string): string {
        const [year, month, day] = dateStr.split('-');
        const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s?([AP]M)?/);
        if (!timeParts) throw new Error(`Invalid time format: ${timeStr}`);

        const [, hoursMatch, minutesMatch, meridianMatchRaw] = timeParts;

        let hours = parseInt(hoursMatch, 10);
        const minutes = minutesMatch;
        const meridian = meridianMatchRaw?.toUpperCase();

        if (meridian) {
            if (meridian === 'PM' && hours < 12) {
                hours += 12;
            } else if (meridian === 'AM' && hours === 12) {
                hours = 0;
            }
        }
        return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes}:00.000`;
    }

    const handleSaveChanges = async () => {
        try {
            const dateToUse = selectedDate || parseToYYYYMMDD(booking.reservation_date);
            const timeToUse = selectedTime || booking.time;
            const dateHasChanged = selectedDate && selectedDate !== parseToYYYYMMDD(booking.reservation_date);
            const timeHasChanged = selectedTime && selectedTime !== booking.time;
            if (!dateHasChanged && !timeHasChanged) {
                toast({
                    title: "No changes were made to the date or time.",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            const combinedDateTime = combineDateAndTime(dateToUse, timeToUse);

            console.log("Data+Hora final:", combinedDateTime);

            const updates = {
                reservation_date: combinedDateTime
            };

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                updates,
                {
                    withCredentials: true,
                }
            );

            try {
                const userId = localStorage.getItem('userId');
                if (userId) {
                    await syncSingleReservation(booking.id, userId);
                }
                await syncReservationForGuides(booking.id);
            } catch (syncError) {
                console.error("Error syncing calendar:", syncError);
            }
            
            console.log("Update successful:", response.data);
            toast({
                title: "Arrival date and time updated successfully!",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            window.location.reload();
        } catch (error) {
            console.error("Error updating reservation:", error);
            toast({
                title: "Failed to update arrival date and time. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen && booking.reservation_date) {
            setSelectedDate(parseToYYYYMMDD(booking.reservation_date));
        }
    }, [isOpen, booking.reservation_date]);

    const getCombinedAddons = () => {
        let combinedAddons = [];

        combinedAddons = allAddons.reduce((acc, addon) => {
            const selectedAddon = reservationAddons.find(resAddon => resAddon.addonId === addon.id);
            if (addon.type === 'SELECT' && selectedAddon && parseInt(selectedAddon.value, 10) > 0) {
                acc.push({
                    ...addon,
                    quantity: parseInt(selectedAddon.value, 10),
                });
            } else if (addon.type === 'CHECKBOX' && selectedAddon && selectedAddon.value === "1") {
                acc.push({
                    ...addon,
                    quantity: 1,
                });
            }
            return acc;
        }, []);

        return combinedAddons;
    };

    const calculateGuestPrice = () => {
        if (!tierPricing) {
            return (booking.valuePerGuest || booking.tour?.price) * booking.guestQuantity;
        }

        if (tierPricing.pricingType === 'flat') {
            return tierPricing.basePrice * booking.guestQuantity;
        }

        const applicableTier = tierPricing.tierEntries
            .sort((a, b) => b.quantity - a.quantity)
            .find(tier => booking.guestQuantity >= tier.quantity);

        return applicableTier
            ? applicableTier.price * booking.guestQuantity
            : tierPricing.basePrice * booking.guestQuantity;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    };

    function formatDateToAmerican(date) {
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year}`;
    }

    const combinedAddons = getCombinedAddons();
    const addonsTotalPrice = combinedAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity),
        0
    );
    const guestTotalPrice = calculateGuestPrice();
    const finalTotalPrice = guestTotalPrice + addonsTotalPrice;
    const totalPaidSoFar = booking.total_price - pendingBalance;
    const totalBalanceDue = pendingBalance;
    const isLoading = isLoadingPendingBalance || isLoadingAddons || isLoadingCardDetails;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "3xl"}>
            <ModalOverlay/>
            <ModalContent h={isMobile ? "100%" : "600px"} maxH={isMobile ? "100vh" : "80vh"}>
                <ModalHeader display="flex" justifyContent="center" fontSize={"3xl"} fontWeight={"medium"}>Change
                    Arrival</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Flex 
                        direction={isMobile ? "column" : "row"} 
                        align={isMobile ? "stretch" : "center"}
                    >
                        <VStack 
                            align="start" 
                            flex="2" 
                            marginTop={isMobile ? "0" : "-130px"}
                            w={isMobile ? "100%" : "auto"}
                            mb={isMobile ? 6 : 0}
                        >
                            <FormControl>
                                <FormLabel>Date</FormLabel>
                                <Input
                                    type="text"
                                    value={
                                        selectedDate
                                            ? formatDateMMMDDYYYY(selectedDate)
                                            : booking.dateFormatted
                                    }
                                    onClick={() => setDatePickerOpen(true)}
                                    size="sm"
                                    w={isMobile ? "100%" : "200px"}
                                    readOnly
                                    cursor="pointer"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Time</FormLabel>
                                <Select
                                    value={selectedTime || booking.time}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    size="sm"
                                    w={isMobile ? "100%" : "200px"}
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
                        <Box w={isMobile ? "100%" : "auto"}>
                            {isLoading ? (
                                <VStack
                                    bg="gray.50"
                                    p={6}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    flex="2"
                                    spacing={6}
                                    align="stretch"
                                    w="100%"
                                    h={isMobile ? "auto" : "350px"}
                                    minW={isMobile ? "100%" : "300px"}
                                    minH={isMobile ? "auto" : "300px"}
                                >
                                    <HStack justifyContent="center">
                                        <Spinner size="sm"/>
                                        <Text>Loading...</Text>
                                    </HStack>
                                </VStack>
                            ) : (
                                <VStack
                                    bg="gray.50"
                                    p={6}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    flex="2"
                                    spacing={6}
                                    align="stretch"
                                    w="100%"
                                    h={isMobile ? "auto" : "350px"}
                                    minW={isMobile ? "100%" : "300px"}
                                    minH={isMobile ? "auto" : "300px"}
                                >
                                    <Box padding="10px" w="100%" h={isMobile ? "auto" : "500px"}>
                                        <Text fontWeight="bold" mb={2}>
                                            Purchase Summary
                                        </Text>
                                        <VStack align="stretch" spacing={2}>
                                            <HStack justify="space-between">
                                                <Text>
                                                    {`Guests ($${(guestTotalPrice / booking.guestQuantity).toFixed(2)} × ${booking.guestQuantity})`}
                                                </Text>
                                                <Text>${guestTotalPrice.toFixed(2)}</Text>
                                            </HStack>
                                        </VStack>
                                        {combinedAddons.length > 0 ? (
                                            combinedAddons.map((addon) => (
                                                <HStack key={addon.id} justifyContent="space-between">
                                                    <Text>{addon.label} (${addon.price} x {addon.quantity})</Text>
                                                    <Text>${(addon.price * addon.quantity).toFixed(2)}</Text>
                                                </HStack>
                                            ))
                                        ) : (
                                            <Text>No add-ons selected.</Text>
                                        )}
                                        <Divider my={2}/>
                                        <HStack justify="space-between">
                                            <Text fontWeight="bold">Total</Text>
                                            <Text fontWeight="bold">${finalTotalPrice.toFixed(2)}</Text>
                                        </HStack>

                                        {totalBalanceDue !== 0 && (
                                            <HStack justify="space-between" mt={2}>
                                                <Text fontWeight="bold"
                                                      color={totalBalanceDue < 0 ? "green.500" : "red.500"}>
                                                    {totalBalanceDue < 0 ? "Refund Due" : "Balance Due"}
                                                </Text>
                                                <Text fontWeight="bold"
                                                      color={totalBalanceDue < 0 ? "green.500" : "red.500"}>
                                                    ${Math.abs(totalBalanceDue).toFixed(2)}
                                                </Text>
                                            </HStack>
                                        )}
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
                                                            <Box
                                                                as="span"
                                                                bg="white"
                                                                px={1}
                                                                py={1}
                                                                borderRadius="md"
                                                                boxShadow="sm"
                                                            >
                                                                *{cardDetails.last4}
                                                            </Box>{" "}
                                                            {formatDateToAmerican(formatDate(cardDetails.paymentDate))}
                                                        </Text>
                                                    </HStack>
                                                </HStack>
                                            )}
                                            <HStack justify="space-between">
                                                <Text>Paid</Text>
                                                <Text>${totalPaidSoFar.toFixed(2)}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                </VStack>
                            )}
                        </Box>
                    </Flex>
                </ModalBody>
                <ModalFooter flexDirection={isMobile ? "column" : "row"}>
                    <HStack spacing={4} flexDirection={isMobile ? "column" : "row"} w={isMobile ? "100%" : "auto"}>
                        <Checkbox
                            isChecked={notifyCustomer}
                            onChange={(e) => setNotifyCustomer(e.target.checked)}
                            mb={isMobile ? 2 : 0}
                        >
                            Notify Customer
                        </Checkbox>
                        <Flex w={isMobile ? "100%" : "auto"} justifyContent="space-between">
                            <Button variant="outline" onClick={onClose} mr={isMobile ? 2 : 4} w={isMobile ? "48%" : "auto"}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue" onClick={handleSaveChanges} w={isMobile ? "48%" : "auto"}>
                                Save Changes
                            </Button>
                        </Flex>
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
                    mt={isMobile ? "20px" : "70px"}
                    ml={isMobile ? "10px" : "150px"}
                    position="absolute"
                    w={isMobile ? "90%" : "500px"}
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
