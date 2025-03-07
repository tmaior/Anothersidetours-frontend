import React, {useCallback, useEffect, useState} from "react";
import {
    Button,
    Checkbox,
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
    useToast,
    VStack,
} from "@chakra-ui/react";
import axios from "axios";
import {CiSquarePlus} from "react-icons/ci";
import DatePicker from "./TimePickerArrival";
import AddTimeSlotModal from "./AddTimeSlotModal";
import PurchaseAndPaymentSummary from "./PurchaseAndPaymentSummary";

const ChangeArrivalModal = ({isOpen, onClose, booking,}) => {
    const [selectedDate, setSelectedDate] = useState<string>();
    const [selectedTime, setSelectedTime] = useState<string>();
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [isTimeslotModalOpen, setTimeslotModalOpen] = useState(false);
    const [availableTimes, setAvailableTimes] = useState([]);
    const toast = useToast();

    const fetchSchedules = useCallback(async () => {
        if (!booking.id) return;
        const tourId = booking.tour?.id || booking.tourId;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/listScheduleByTourId/${tourId}`
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
                updates
            );
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
                                    value={
                                        selectedDate
                                            ? formatDateMMMDDYYYY(selectedDate)
                                            : booking.dateFormatted
                                    }
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
                                    value={selectedTime || booking.time}
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
                        <HStack align="center">
                            <PurchaseAndPaymentSummary
                                booking={booking}
                                guestQuantity={booking.guestQuantity}
                            />
                        </HStack>
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
