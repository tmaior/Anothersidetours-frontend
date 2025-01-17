import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import TimePickerArrival from "./TimePickerArrival";
import TimePicker from "./TimePicker";

const AddTimeSlotModal = ({isOpen, onClose, onCreate, booking}) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState("");
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [isTimePickerOpen, setTimePickerOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedTime("");
        }
    }, [isOpen]);

    const handleCreate = () => {
        if (selectedDate && selectedTime) {
            onCreate({date: selectedDate, time: selectedTime});
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Add New Timeslot</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    {/*<FormControl mb={4}>*/}
                    {/*    <FormLabel>Date</FormLabel>*/}
                    {/*    <Input*/}
                    {/*        type="text"*/}
                    {/*        value={selectedDate.toLocaleDateString("en-US", {*/}
                    {/*            weekday: "short",*/}
                    {/*            year: "numeric",*/}
                    {/*            month: "long",*/}
                    {/*            day: "numeric",*/}
                    {/*        })}*/}
                    {/*        readOnly*/}
                    {/*        onClick={() => setDatePickerOpen(true)}*/}
                    {/*        cursor="pointer"*/}
                    {/*    />*/}
                    {/*</FormControl>*/}
                    <FormControl>
                        <FormLabel>Time</FormLabel>
                        <Input
                            type="text"
                            value={selectedTime || "Select Time"}
                            readOnly
                            onClick={() => setTimePickerOpen(true)}
                            cursor="pointer"
                        />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        ml={3}
                        onClick={handleCreate}
                        isDisabled={!selectedDate || !selectedTime}
                    >
                        Create
                    </Button>
                </ModalFooter>
            </ModalContent>

            <Modal
                isOpen={isDatePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                size="md"
                motionPreset="slideInBottom"
            >
                <ModalOverlay/>
                <ModalContent mt="70px" ml="150px" position="absolute" w="500px">
                    <ModalBody>
                        <TimePickerArrival
                            prices={Array(31).fill(booking.valuePerGuest || booking.tour?.price || 0)}
                            onDateSelect={(date) => {
                                setSelectedDate(date);
                                setDatePickerOpen(false);
                            }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isTimePickerOpen}
                onClose={() => setTimePickerOpen(false)}
                size="md"
                motionPreset="slideInBottom"
            >
                <ModalOverlay/>
                <ModalContent mt="70px" ml="150px" position="absolute" w="500px">
                    <ModalBody>
                        <TimePicker
                            onTimeSelect={(time) => {
                                setSelectedTime(time);
                                setTimePickerOpen(false);
                            }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

        </Modal>
    );
};

export default AddTimeSlotModal;