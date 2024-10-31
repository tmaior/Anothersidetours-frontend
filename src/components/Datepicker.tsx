import React, { useState, useEffect } from 'react';
import {
    Box,
    SimpleGrid,
    Text,
    Flex,
    Select,
    VStack,
} from '@chakra-ui/react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    isBefore,
    startOfDay,
    eachDayOfInterval,
} from 'date-fns';

interface DatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date) => void;
    onTimeChange: (time: string) => void;
    selectedTime: string | null;
}

const DatePicker: React.FC<DatePickerProps> = ({
                                                   selectedDate,
                                                   onChange,
                                                   onTimeChange,
                                               }) => {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [monthDayData, setMonthDayData] = useState<{ [key: string]: string }>({});
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const price = '$100';

    useEffect(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

        const newMonthDayData: { [key: string]: string } = {};
        daysInMonth.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            newMonthDayData[dayKey] = price;
        });

        setMonthDayData(newMonthDayData);
    }, [currentMonth]);

    const renderHeader = () => {
        return (
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bg="gray.100">
                <Text
                    cursor="pointer"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    fontSize="lg"
                    fontWeight="bold"
                >
                    {'<'}
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                    {format(currentMonth, 'MMMM yyyy')}
                </Text>
                <Text
                    cursor="pointer"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    fontSize="lg"
                    fontWeight="bold"
                >
                    {'>'}
                </Text>
            </Box>
        );
    };

    const renderDays = () => {
        const days = [];
        const dateFormat = 'EEE';
        const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });

        for (let i = 0; i < 7; i++) {
            days.push(
                <Text key={i} textAlign="center" fontWeight="bold">
                    {format(addDays(startDate, i), dateFormat)}
                </Text>
            );
        }
        return <SimpleGrid columns={7}>{days}</SimpleGrid>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days: JSX.Element[] = [];
        let day = startDate;
        const today = startOfDay(new Date());

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, 'd');
                const cloneDay = day;
                const dayKey = format(day, 'yyyy-MM-dd');
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonthDay = isSameMonth(day, monthStart);
                const isPast = isBefore(day, today);

                if (isCurrentMonthDay) {
                    days.push(
                        <Box key={day.toISOString() + i}>
                            <Flex
                                w="full"
                                h="40px"
                                p="2px"
                                position="relative"
                                onClick={() => {
                                    if (!isPast) {
                                        onChange(cloneDay);
                                        handleDateSelection();
                                    }
                                }}
                                bg={isSelected ? '#337AB7' : isPast ? 'gray.100' : '#E9F7D4'}
                                color={isSelected ? 'white' : isPast ? 'gray.500' : '#337AB7'}
                                cursor={isPast ? 'not-allowed' : 'pointer'}
                                _hover={isPast ? {} : { bg: '#337AB7', color: 'white' }}
                                pointerEvents={isPast ? 'none' : 'auto'}
                            >
                                <Text w="full" textAlign="end" fontSize="10px">
                                    {formattedDate}
                                </Text>
                                <Text
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    transform="translate(-50%, -50%)"
                                    fontSize="13px"
                                    fontWeight="medium"
                                >
                                    {!isPast ? monthDayData[dayKey] || '' : ''}
                                </Text>
                            </Flex>
                        </Box>
                    );
                } else {
                    days.push(<Box key={day.toISOString() + i} />);
                }
                day = addDays(day, 1);
            }
            rows.push(
                <SimpleGrid columns={7} key={day.toISOString()} gap={0}>
                    {days}
                </SimpleGrid>
            );
            days = [];
        }
        return <Box>{rows}</Box>;
    };

    const handleDateSelection = () => {
        const times = [];
        for (let hour = 8; hour <= 18; hour++) {
            times.push(`${hour}:00 (${price}.00)`);
        }
        setAvailableTimes(times);
    };

    const handleTimeSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.value;
        setSelectedTime(selected);
        onTimeChange(selected);
    };

    return (
        <VStack spacing={4} align="flex-start">
            <Box width="400px" borderWidth="1px" borderRadius="md" overflow="hidden">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </Box>

            {availableTimes.length > 0 && (
                <Select
                    width="400px"
                    placeholder="Pick a time"
                    onChange={handleTimeSelection}
                    value={selectedTime ?? undefined}
                >
                    {availableTimes.map((time, index) => (
                        <option key={index} value={time}>
                            {time}
                        </option>
                    ))}
                </Select>
            )}
        </VStack>
    );
};

export default DatePicker;
