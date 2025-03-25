import React, {useEffect, useRef, useState} from "react";
import {Box, Button, Grid, HStack, Text, useDisclosure, VStack, Select} from "@chakra-ui/react";

interface CustomDatePickerProps {
    selected: Date | null;
    onDateChange: (date: Date | null) => void;
    showTimeSelect?: boolean;
    showTimeSelectOnly?: boolean;
    timeIntervals?: number;
    timeCaption?: string;
}

const CustomDatePicker = ({
    selected,
    onDateChange,
    showTimeSelect = false,
    showTimeSelectOnly = false,
    timeIntervals = 30,
    timeCaption = "Time"
}: CustomDatePickerProps) => {
    const [currentMonth, setCurrentMonth] = useState(
        selected ? selected.getMonth() : new Date().getMonth()
    );
    const [currentYear, setCurrentYear] = useState(
        selected ? selected.getFullYear() : new Date().getFullYear()
    );
    const [selectedDate, setSelectedDate] = useState(selected || null);
    const [selectedTime, setSelectedTime] = useState<string>(
        selected ? selected.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ""
    );
    const {isOpen, onOpen, onClose} = useDisclosure();
    const ref = useRef(null);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    };

    const generateTimeOptions = () => {
        const options = [];
        const totalMinutesInDay = 24 * 60;
        
        for (let minutes = 0; minutes < totalMinutesInDay; minutes += timeIntervals) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            const timeString = `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
            options.push(timeString);
        }
        return options;
    };

    const handleTimeChange = (timeString: string) => {
        setSelectedTime(timeString);
        if (selectedDate) {
            const [time, period] = timeString.split(' ');
            const [hours, minutes] = time.split(':');
            const date = new Date(selectedDate);
            let hour = parseInt(hours);
            
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            
            date.setHours(hour, parseInt(minutes));
            onDateChange(date);
        }
    };

    const handleDateSelect = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        if (selectedTime) {
            const [time, period] = selectedTime.split(' ');
            const [hours, minutes] = time.split(':');
            let hour = parseInt(hours);
            
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            
            date.setHours(hour, parseInt(minutes));
        }
        setSelectedDate(date);
        if (onDateChange) {
            onDateChange(date);
        }
        if (!showTimeSelect) {
            onClose();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose,isOpen]);

    const toggleModal = () => {
        if (isOpen) {
            onClose();
        } else {
            onOpen();
        }
    };

    return (
        <Box position="relative" w="fit-content" ref={ref}>
            <Button onClick={toggleModal} size="sm" variant="outline">
                {selected
                    ? showTimeSelectOnly 
                        ? selected.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : showTimeSelect
                            ? selected.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
                            : selected.toLocaleDateString('en-US')
                    : "Select"}
            </Button>

            {isOpen && (
                <Box
                    position="absolute"
                    top="40px"
                    left="0"
                    zIndex="10"
                    border="1px solid gray"
                    p={4}
                    borderRadius="md"
                    bg="white"
                    boxShadow="md"
                    minW="300px"
                >
                    <VStack spacing={4}>
                        {!showTimeSelectOnly && (
                            <>
                                <HStack justify="space-between" align="center" w="100%">
                                    <Button size="sm" onClick={handlePrevMonth}>
                                        {"<"}
                                    </Button>
                                    <Text fontSize="lg" fontWeight="bold" textAlign="center">
                                        {new Date(currentYear, currentMonth).toLocaleString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </Text>
                                    <Button size="sm" onClick={handleNextMonth}>
                                        {">"}
                                    </Button>
                                </HStack>

                                <Grid templateColumns="repeat(7, 1fr)" gap={1} w="100%">
                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                        <Text
                                            key={day}
                                            fontSize="sm"
                                            fontWeight="bold"
                                            textAlign="center"
                                        >
                                            {day}
                                        </Text>
                                    ))}
                                </Grid>

                                <Grid templateColumns="repeat(7, 1fr)" gap={2} w="100%">
                                    {Array.from({length: firstDayOfMonth}).map((_, index) => (
                                        <Box key={index}/>
                                    ))}
                                    {Array.from({length: daysInMonth}).map((_, index) => {
                                        const day = index + 1;
                                        const isSelected =
                                            selectedDate &&
                                            selectedDate.getDate() === day &&
                                            selectedDate.getMonth() === currentMonth &&
                                            selectedDate.getFullYear() === currentYear;

                                        return (
                                            <Button
                                                key={day}
                                                size="sm"
                                                borderRadius="full"
                                                bg={isSelected ? "blue.500" : "transparent"}
                                                color={isSelected ? "white" : "black"}
                                                _hover={{bg: "blue.100"}}
                                                onClick={() => handleDateSelect(day)}
                                            >
                                                {day}
                                            </Button>
                                        );
                                    })}
                                </Grid>
                            </>
                        )}

                        {showTimeSelect && (
                            <Box w="100%">
                                <Text mb={2}>{timeCaption}</Text>
                                <Select
                                    value={selectedTime}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                >
                                    {generateTimeOptions().map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </Select>
                            </Box>
                        )}
                    </VStack>
                </Box>
            )}
        </Box>
    );
};

export default CustomDatePicker;