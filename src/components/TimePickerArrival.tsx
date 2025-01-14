import React, {useState} from "react";
import {Box, Button, Grid, HStack, IconButton, Select, Text, VStack,} from "@chakra-ui/react";
import {ChevronLeftIcon, ChevronRightIcon} from "@chakra-ui/icons";

const DatePicker = ({prices, onDateSelect}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);

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
        onDateSelect(date);
    };

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    return (
        <Box p={4} borderWidth="1px" borderRadius="md" bg="white" maxW="400px">
            <VStack spacing={4}>
                <HStack justify="space-between" w="100%">
                    <HStack>
                        <Select
                            size="sm"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                        >
                            {monthNames.map((month, index) => (
                                <option key={month} value={index}>
                                    {month}
                                </option>
                            ))}
                        </Select>
                        <Select
                            size="sm"
                            value={currentYear}
                            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                        >
                            {Array.from({length: 10}, (_, i) => currentYear - 5 + i).map(
                                (year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                )
                            )}
                        </Select>
                    </HStack>
                    <Button size="sm" onClick={() => setSelectedDate(new Date())}>
                        Today
                    </Button>
                    <HStack>
                        <IconButton
                            icon={<ChevronLeftIcon/>}
                            size="sm"
                            onClick={handlePrevMonth}
                            aria-label="Previous Month"
                        />
                        <IconButton
                            icon={<ChevronRightIcon/>}
                            size="sm"
                            onClick={handleNextMonth}
                            aria-label="Next Month"
                        />
                    </HStack>
                </HStack>

                <HStack justify="space-between" w="100%" px={2}>
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <Text key={day} fontSize="sm" fontWeight="bold" textAlign="center">
                            {day}
                        </Text>
                    ))}
                </HStack>
                <Grid
                    templateColumns="repeat(7, 1fr)"
                    gap={2}
                    w="100%"
                    justifyItems="center"
                >
                    {Array.from({length: firstDayOfMonth}).map((_, i) => (
                        <Box key={i}/>
                    ))}

                    {daysArray.map((day) => (
                        <VStack
                            key={day}
                            spacing={1}
                            p={2}
                            borderRadius="md"
                            bg={
                                selectedDate?.getDate() === day &&
                                selectedDate?.getMonth() === currentMonth &&
                                selectedDate?.getFullYear() === currentYear
                                    ? "blue.500"
                                    : "transparent"
                            }
                            color={
                                selectedDate?.getDate() === day &&
                                selectedDate?.getMonth() === currentMonth &&
                                selectedDate?.getFullYear() === currentYear
                                    ? "white"
                                    : "black"
                            }
                            _hover={{bg: "blue.100", cursor: "pointer"}}
                            onClick={() => handleDateSelect(day)}
                        >
                            <Text>{day}</Text>
                            <Text fontSize="xs" color="gray.500">
                                ${prices[day - 1] || "0.00"}
                            </Text>
                        </VStack>
                    ))}
                </Grid>
            </VStack>
        </Box>
    );
};

export default DatePicker;