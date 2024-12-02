import React, {useEffect, useState} from 'react';
import {Box, Flex, Select, SimpleGrid, Text, VStack,} from '@chakra-ui/react';
import {
    addDays,
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isBefore,
    isSameDay,
    isSameMonth,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import {useGuest} from "./GuestContext";
import axios from "axios";

interface DatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date) => void;
    onTimeChange: (time: string) => void;
    selectedTime: string | null;
    title: string;
    originalPrice: string;
}

interface BlackoutDate {
    date: string;
    startTime?: string;
    endTime?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
                                                   selectedDate,
                                                   onChange,
                                                   onTimeChange,
                                                   originalPrice,
                                               }) => {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [monthDayData, setMonthDayData] = useState<{ [key: string]: React.ReactElement }>({});
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const price = originalPrice;
    const {tourId} = useGuest();
    const [blockedTimes, setBlockedTimes] = useState<
        { date: string; startTime: string; endTime: string }[]
    >([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const daysInMonth = eachDayOfInterval({start: monthStart, end: monthEnd});

        const newMonthDayData: { [key: string]: React.ReactElement } = {};

        daysInMonth.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            newMonthDayData[dayKey] = (
                <span>
            <sup>$ </sup>{100 + price}
        </span>
            );
        });

        setMonthDayData(newMonthDayData);
    }, [currentMonth, price]);

    useEffect(() => {
        const fetchBlockedDatesForTour = async () => {
            try {
                let categoryBlockedDates: string[] = [];
                let globalBlockedDates: string[] = [];
                let combinedBlockedDates: string[] = [];
                let categoryBlockedTimes: { date: string; startTime: string; endTime: string }[] = [];

                const tourResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${tourId}`);
                if (!tourResponse.ok) throw new Error('Failed to fetch tour details');

                const tourData = await tourResponse.json();
                const categoryId = tourData.categoryId;

                if (categoryId) {
                    const categoryResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/blackout-dates?categoryId=${categoryId}`
                    );
                    if (!categoryResponse.ok) throw new Error('Failed to fetch category-specific blackout dates');

                    const categoryData = await categoryResponse.json();

                    categoryBlockedDates = categoryData.map((b: BlackoutDate) =>
                        format(new Date(b.date), 'yyyy-MM-dd')
                    );

                    categoryBlockedTimes = categoryData
                        .filter((b: BlackoutDate) => b.startTime && b.endTime)
                        .map((b: BlackoutDate) => ({
                            date: format(new Date(b.date), 'yyyy-MM-dd'),
                            startTime: b.startTime,
                            endTime: b.endTime,
                        }));
                }

                const globalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blackout-dates/global`);
                if (!globalResponse.ok) throw new Error('Failed to fetch global blackout dates');

                const globalData = await globalResponse.json();
                globalBlockedDates = globalData.map((b: BlackoutDate) => {
                    if (!b.date) {
                        console.warn('Blackout date is missing the "date" field:', b);
                        return null;
                    }

                    try {
                        const utcDate = new Date(b.date).toISOString().split('T')[0];
                        console.log(`Processed UTC date: ${b.date} -> ${utcDate}`);
                        return utcDate;
                    } catch (error) {
                        console.error(`Error processing date: ${b.date}`, error);
                        return null;
                    }
                }).filter((d: string | null) => d !== null);

                combinedBlockedDates = Array.from(new Set([...categoryBlockedDates, ...globalBlockedDates]));

                setBlockedDates(combinedBlockedDates);
                setBlockedTimes(categoryBlockedTimes);
            } catch (error) {
                console.error('Error fetching blocked dates for the tour:', error);
            }
        };
        fetchBlockedDatesForTour();
    }, [tourId]);

    const renderHeader = () => (
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

    const renderDays = () => {
        const days = [];
        const dateFormat = 'EEE';
        const startDate = startOfWeek(currentMonth, {weekStartsOn: 1});

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
        const startDate = startOfWeek(monthStart, {weekStartsOn: 1});
        const endDate = endOfWeek(monthEnd, {weekStartsOn: 1});

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
                const isBlocked = blockedDates.includes(dayKey);

                const blockedTime = blockedTimes.find(bt => bt.date === dayKey);
                const isBlockedTime =
                    blockedTime &&
                    (selectedTime >= blockedTime.startTime && selectedTime <= blockedTime.endTime);

                if (isCurrentMonthDay) {
                    days.push(
                        <Box key={day.toISOString() + i}>
                            <Flex
                                w="full"
                                h="40px"
                                p="2px"
                                position="relative"
                                onClick={() => {
                                    if (!isPast && !isBlocked && !isBlockedTime) {
                                        onChange(cloneDay);
                                        fetchAvailableTimes();
                                    }
                                }}
                                bg={
                                    isSelected
                                        ? '#337AB7'
                                        : isPast || isBlocked || isBlockedTime
                                            ? 'gray.300'
                                            : '#E9F7D4'
                                }
                                color={
                                    isSelected
                                        ? 'white'
                                        : isPast || isBlocked || isBlockedTime
                                            ? 'gray.500'
                                            : '#337AB7'
                                }
                                cursor={
                                    isBlocked || isBlockedTime
                                        ? 'not-allowed'
                                        : isPast
                                            ? 'not-allowed'
                                            : 'pointer'
                                }
                                _hover={
                                    isBlocked || isBlockedTime
                                        ? {}
                                        : {bg: '#337AB7', color: 'white'}
                                }
                                pointerEvents={
                                    isBlocked || isBlockedTime
                                        ? 'none'
                                        : isPast
                                            ? 'none'
                                            : 'auto'
                                }
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
                                    color={isBlocked || isBlockedTime ? 'red.500' : 'inherit'}
                                    textAlign="center"
                                >
                                    {!isPast
                                        ? isBlocked || isBlockedTime
                                            ? (
                                                <Text
                                                    fontSize="9px"
                                                    color="blue.500"
                                                    lineHeight="normal"
                                                    textAlign="center"
                                                >
                                                    call for
                                                    <br/>
                                                    Info
                                                </Text>
                                            )
                                            : monthDayData[dayKey] || ''
                                        : ''}
                                </Text>
                            </Flex>
                        </Box>
                    );
                } else {
                    days.push(<Box key={day.toISOString() + i}/>);
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

    const fetchAvailableTimes = async () => {
        try {
            const response = await axios.get<string[]>(
                `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/listScheduleByTourId/${tourId}`
            );

            if (Array.isArray(response.data)) {
                setAvailableTimes(response.data);
            } else {
                throw new Error('Invalid response format');
            }

            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch available times');
            setAvailableTimes([]);
        }
    };

    useEffect(() => {
        fetchAvailableTimes();
    }, [tourId]);

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

            <Select
                width="400px"
                placeholder="Pick a time"
                onChange={handleTimeSelection}
                value={selectedTime ?? undefined}
            >
                {availableTimes.map((time, index) => (
                    <option key={index} value={time}>
                        {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </option>
                ))}
            </Select>
        </VStack>
    );
};

export default DatePicker;