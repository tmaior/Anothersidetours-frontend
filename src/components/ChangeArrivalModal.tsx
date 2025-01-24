import React, {useEffect, useState} from "react";
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
    VStack,
} from "@chakra-ui/react";
import axios from "axios";
import {CiSquarePlus} from "react-icons/ci";
import DatePicker from "./TimePickerArrival";
import AddTimeSlotModal from "./AddTimeSlotModal";
import PurchaseAndPaymentSummary from "./PurchaseAndPaymentSummary";

const ChangeArrivalModal = ({isOpen, onClose, booking,}) => {
    const [selectedDate, setSelectedDate] = useState(
        booking.dateFormatted
            ? parseToYYYYMMDD(booking.dateFormatted)
            : "2025-01-14"
    );
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

    function combineDateAndTime(dateStr, timeStr) {
        const [year, month, day] = dateStr.split('-');
        const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s?([AP]M)?/);
        if (!timeParts) throw new Error(`Invalid time format: ${timeStr}`);

        let [_, hoursMatch, minutesMatch, meridianMatch] = timeParts;
        let hours = parseInt(hoursMatch, 10);

        if (meridianMatch) {
            meridianMatch = meridianMatch.toUpperCase();
            if (meridianMatch === 'PM' && hours < 12) {
                hours += 12;
            } else if (meridianMatch === 'AM' && hours === 12) {
                hours = 0;
            }
        }

        const finalDateTime = `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutesMatch}:00.000`;
        return finalDateTime;
    }

    const handleSaveChanges = async () => {
        if (!selectedDate || !selectedTime) {
            console.error("Date or time is not selected.");
            return;
        }

        try {

            const combinedDateTime = combineDateAndTime(selectedDate, selectedTime);

            console.log("Data+Hora final:", combinedDateTime);

            const updates = {
                reservation_date: combinedDateTime
            };

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                updates
            );
            console.log("Update successful:", response.data);
        } catch (error) {
            console.error("Error combining date and time:", error);
        } finally {
            onClose();
        }
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
                                    value={formatDateMMMDDYYYY(selectedDate)}
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
