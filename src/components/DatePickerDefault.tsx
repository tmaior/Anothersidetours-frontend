import React, {useEffect, useRef, useState} from "react";
import {Box, Button, Grid, HStack, Text, useDisclosure, VStack} from "@chakra-ui/react";

const CustomDatePicker = ({selected, onDateChange}) => {
    const [currentMonth, setCurrentMonth] = useState(
        selected ? selected.getMonth() : new Date().getMonth()
    );
    const [currentYear, setCurrentYear] = useState(
        selected ? selected.getFullYear() : new Date().getFullYear()
    );
    const [selectedDate, setSelectedDate] = useState(selected || null);
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

    const handleDateSelect = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        setSelectedDate(date);
        if (onDateChange) {
            onDateChange(date);
        }
        onClose();
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
                    ? selected.toLocaleDateString("en-US")
                    : "Select a Date"}
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
                    </VStack>
                </Box>
            )}
        </Box>
    );
};

export default CustomDatePicker;