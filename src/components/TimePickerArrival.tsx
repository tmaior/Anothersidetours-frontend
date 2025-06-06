import React, {useState} from "react";
import {
    Box, 
    Button, 
    Grid, 
    HStack, 
    IconButton, 
    Select, 
    Text, 
    VStack, 
    Center, 
    Square, 
    Flex,
    useBreakpointValue
} from "@chakra-ui/react";
import {ChevronLeftIcon, ChevronRightIcon} from "@chakra-ui/icons";

const DatePicker = ({prices, onDateSelect}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const isMobile = useBreakpointValue({ base: true, md: false });

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
        <Box 
            p={isMobile ? 2 : 4} 
            borderWidth="1px" 
            borderRadius="md" 
            bg="white" 
            width="100%" 
            maxW={isMobile ? "100%" : "600px"}
        >
            <VStack spacing={isMobile ? 2 : 4} width="100%">
                <Flex 
                    direction={isMobile ? "column" : "row"} 
                    justify="space-between" 
                    w="100%" 
                    gap={isMobile ? 2 : 0}
                >
                    <HStack mb={isMobile ? 2 : 0}>
                        <Select
                            size="sm"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                            w={isMobile ? "auto" : "100px"}
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
                            w={isMobile ? "auto" : "100px"}
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
                    <Flex justify="space-between" w={isMobile ? "100%" : "auto"}>
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
                    </Flex>
                </Flex>

                <HStack justify="space-between" w="100%" px={isMobile ? 0 : 2}>
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <Text 
                            key={day} 
                            fontSize={isMobile ? "xs" : "sm"} 
                            fontWeight="bold" 
                            textAlign="center" 
                            width="14%"
                        >
                            {day}
                        </Text>
                    ))}
                </HStack>
                <Grid
                    templateColumns="repeat(7, 1fr)"
                    gap={isMobile ? 1 : 2}
                    w="100%"
                >
                    {Array.from({length: firstDayOfMonth}).map((_, i) => (
                        <Box key={i}/>
                    ))}

                    {daysArray.map((day) => {
                        const isSelected = 
                            selectedDate?.getDate() === day &&
                            selectedDate?.getMonth() === currentMonth &&
                            selectedDate?.getFullYear() === currentYear;
                            
                        return (
                            <Center key={day}>
                                <Square
                                    size={isMobile ? "30px" : "40px"}
                                    borderRadius="full"
                                    bg={isSelected ? "blue.500" : "transparent"}
                                    boxShadow={isSelected ? "0 0 0 2px #3182CE" : "none"}
                                    transition="all 0.2s"
                                    _hover={{
                                        bg: isSelected ? "blue.600" : "blue.50", 
                                        cursor: "pointer"
                                    }}
                                    onClick={() => handleDateSelect(day)}
                                    position="relative"
                                >
                                    <VStack spacing={0} position="absolute">
                                        <Text 
                                            textAlign="center" 
                                            fontWeight={isSelected ? "bold" : "normal"}
                                            color={isSelected ? "white" : "black"}
                                            fontSize={isMobile ? "xs" : "sm"}
                                            lineHeight="1.2"
                                        >
                                            {day}
                                        </Text>
                                        <Text 
                                            fontSize={isMobile ? "8px" : "10px"} 
                                            textAlign="center"
                                            color={isSelected ? "white" : "gray.500"}
                                            fontWeight={isSelected ? "medium" : "normal"}
                                            lineHeight="1"
                                        >
                                            ${prices[day - 1] || "0.00"}
                                        </Text>
                                    </VStack>
                                </Square>
                            </Center>
                        );
                    })}
                </Grid>
            </VStack>
        </Box>
    );
};

export default DatePicker;