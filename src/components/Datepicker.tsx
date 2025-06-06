import React, {useCallback, useEffect, useState} from 'react';
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
    parse,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import {useGuest} from "../contexts/GuestContext";
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
    date?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
}

interface Schedule {
    id: string;
    name: string;
    days: string[];
    timeSlots: string[];
}
const DatePicker: React.FC<DatePickerProps> = ({
                                                   selectedDate,
                                                   onChange,
                                                   onTimeChange,
                                                   originalPrice,
                                               }) => {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [monthDayData, setMonthDayData] = useState<{ [key: string]: React.ReactElement }>({});
    const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [filteredTimes, setFilteredTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const {tourId} = useGuest();
    const [blockedTimes, setBlockedTimes] = useState<
        { date: string; startTime: string; endTime: string }[]
    >([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                    <sup>$</sup>{originalPrice}
                </span>
            );
        });

        setMonthDayData(newMonthDayData);
    }, [currentMonth, originalPrice]);

    useEffect(() => {
        const fetchBlockedDatesForTour = async () => {
            try {
                const categoryBlockedDates: string[] = [];
                const globalBlockedDates: string[] = [];
                let combinedBlockedDates: string[] = [];
                const categoryBlockedTimes: { date: string; startTime: string; endTime: string }[] = [];

                const tourResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${tourId}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    });
                if (!tourResponse.ok) throw new Error('Failed to fetch tour details');

                const tourData = await tourResponse.json();
                const categoryId = tourData.categoryId;

                const formatDate = (dateObj: Date) => {
                    const year = dateObj.getUTCFullYear();
                    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
                    const day = String(dateObj.getUTCDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                };

                const getDateRange = (start: string, end: string): string[] => {
                    const startDateObj = new Date(start);
                    const endDateObj = new Date(end);
                    const dates = [];

                    let currentDate = startDateObj;
                    while (currentDate <= endDateObj) {
                        dates.push(formatDate(currentDate));
                        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
                    }

                    return dates;
                };

                if (categoryId) {
                    const categoryResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/blackout-dates/filter`,
                        {
                            method: "POST",
                            credentials: 'include',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({categoryId}),
                        }
                    );

                    if (!categoryResponse.ok) {
                        throw new Error("Failed to fetch category-specific blackout dates");
                    }

                    const categoryData = await categoryResponse.json();

                    categoryData.forEach((b: BlackoutDate) => {
                        if (b.startDate) {
                            const intervalDates = b.endDate
                                ? getDateRange(b.startDate, b.endDate)
                                : [formatDate(new Date(b.startDate))];
                            if (b.startTime && b.endTime) {
                                intervalDates.forEach(date => {
                                    categoryBlockedTimes.push({
                                        date,
                                        startTime: b.startTime!,
                                        endTime: b.endTime!,
                                    });
                                });
                            } else {
                                categoryBlockedDates.push(...intervalDates);
                            }
                        } else if (b.date) {
                            const singleDate = new Date(b.date);
                            const formattedDate = formatDate(singleDate);
                            if (b.startTime && b.endTime) {
                                categoryBlockedTimes.push({
                                    date: formattedDate,
                                    startTime: b.startTime!,
                                    endTime: b.endTime!,
                                });
                            } else {
                                categoryBlockedDates.push(formattedDate);
                            }
                        }
                    });
                }

                const globalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blackout-dates/global`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    });
                if (!globalResponse.ok) throw new Error('Failed to fetch global blackout dates');

                const globalData = await globalResponse.json();

                globalData.forEach((b: BlackoutDate) => {
                    if (b.startDate && b.endDate) {
                        const intervalDates = getDateRange(b.startDate, b.endDate);
                        if (b.startTime && b.endTime) {
                            intervalDates.forEach(date => {
                                categoryBlockedTimes.push({
                                    date,
                                    startTime: b.startTime!,
                                    endTime: b.endTime!,
                                });
                            });
                        } else {
                            globalBlockedDates.push(...intervalDates);
                        }
                    } else if (b.date) {
                        try {
                            const formattedDate = new Date(b.date).toISOString().split('T')[0];
                            if (b.startTime && b.endTime) {
                                categoryBlockedTimes.push({
                                    date: formattedDate,
                                    startTime: b.startTime!,
                                    endTime: b.endTime!,
                                });
                            } else {
                                globalBlockedDates.push(formattedDate);
                            }
                        } catch (error) {
                            console.error(`Error processing date: ${b.date}`, error);
                        }
                    }
                });

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
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bg="white">
            <Text
                cursor="pointer"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                fontSize="lg"
                fontWeight="bold"
            >
                {'<'}
            </Text>
            <Text fontSize="lg" fontWeight="normal">
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
                <Text key={i} textAlign="center" fontWeight="normal">
                    {format(addDays(startDate, i), dateFormat)}
                </Text>
            );
        }
        return <SimpleGrid columns={7}>{days}</SimpleGrid>;
    };

    const isDayAvailable = useCallback((date: Date) => {
        const dayOfWeek = format(date, 'EEE');
        return availableSchedules.some(schedule => 
            schedule.days.includes(dayOfWeek)
        );
    }, [availableSchedules]);
    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, {weekStartsOn: 1});
        const endDate = endOfWeek(monthEnd, {weekStartsOn: 1});

        const rows = [];
        let days: React.ReactNode[] = [];
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
                const isDayUnavailable = !isDayAvailable(day);

                if (isCurrentMonthDay) {
                    days.push(
                        <Box key={day.toISOString() + i}>
                            <Flex
                                w="60px"
                                h="40px"
                                p="1px"
                                position="relative"
                                onClick={() => {
                                    if (!isPast && !isBlocked && !isDayUnavailable) {
                                        onChange(cloneDay);
                                    }
                                }}
                                bg={
                                    isSelected
                                        ? '#337AB7'
                                        : isPast || isBlocked || isDayUnavailable
                                            ? 'white.300'
                                            : 'gray.100'
                                }
                                color={
                                    isSelected
                                        ? 'white'
                                        : isPast || isBlocked || isDayUnavailable
                                            ? 'gray.300'
                                            : '#337AB7'
                                }
                                cursor={isBlocked || isPast || isDayUnavailable ? 'not-allowed' : 'pointer'}
                                _hover={{
                                    bg: isBlocked || isPast || isDayUnavailable ? undefined : '#337AB7',
                                    color: isBlocked || isPast || isDayUnavailable ? undefined : 'white'
                                }}
                            >
                                <Text w="full" textAlign="end" fontSize="10px" marginLeft={"-7px"}>
                                    {formattedDate}
                                </Text>
                                <Text
                                    position="absolute"
                                    marginLeft={"-6px"}
                                    top="50%"
                                    left="50%"
                                    transform="translate(-50%, -50%)"
                                    fontSize="12px"
                                    fontWeight="medium"
                                    textAlign="center"
                                >
                                    {!isPast && !isBlocked && !isDayUnavailable
                                        ? monthDayData[dayKey] || ''
                                        : (isBlocked || isDayUnavailable) && !isPast
                                            ? (
                                                <Text
                                                    fontSize="9px"
                                                    color="blue.500"
                                                    lineHeight="normal"
                                                    textAlign="center"
                                                >
                                                    Call For
                                                    <br/>
                                                    Info
                                                </Text>
                                            )
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

    const fetchAvailableTimes = useCallback(async () => {
        try {
            const response = await axios.get<Schedule[]>(
                `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/schedules/${tourId}`,
                {
                    withCredentials: true,
                }
            );

            if (Array.isArray(response.data)) {
                setAvailableSchedules(response.data);
                const allTimeSlots = response.data.flatMap(schedule => schedule.timeSlots);
                const uniqueTimeSlots = Array.from(new Set(allTimeSlots));
                const sortedTimeSlots = sortTimeSlots(uniqueTimeSlots);
                setAvailableTimes(sortedTimeSlots);
            } else {
                throw new Error('Invalid response format');
            }

            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch available times');
            setAvailableSchedules([]);
            setAvailableTimes([]);
        }
    }, [tourId]);

    useEffect(() => {
        fetchAvailableTimes();
    }, [fetchAvailableTimes]);

    function parseTimeToMinutes(timeStr: string): number {
        const [time, modifier] = timeStr.split(" ");
        const [hourStr, minuteStr] = time.split(":");
        let hours = parseInt(hourStr, 10);
        const minutes = parseInt(minuteStr, 10);

        if (modifier && modifier.toUpperCase() === "PM" && hours < 12) {
            hours += 12;
        }
        if (modifier && modifier.toUpperCase() === "AM" && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    useEffect(() => {
        if (!selectedDate) {
            setFilteredTimes([]);
            return;
        }

        const dayKey = format(selectedDate, 'yyyy-MM-dd');
        const selectedDayOfWeek = format(selectedDate, 'EEE');
        const applicableSchedules = availableSchedules.filter(schedule => 
            schedule.days.includes(selectedDayOfWeek)
        );
        const timeSlotsForDay = applicableSchedules.flatMap(schedule => schedule.timeSlots);
        const dailyBlocked = blockedTimes.filter(bt => bt.date === dayKey);
        
        let availableTimeSlots = [];
        
        if (dailyBlocked.length === 0) {
            availableTimeSlots = timeSlotsForDay;
        } else {
            availableTimeSlots = timeSlotsForDay.filter(timeStr => {
                const timeInMinutes = parseTimeToMinutes(timeStr);
                return !dailyBlocked.some(bt => {
                    const start = parseTimeToMinutes(bt.startTime);
                    const end = parseTimeToMinutes(bt.endTime);
                    return timeInMinutes >= start && timeInMinutes <= end;
                });
            });
        }
        const sortedTimeSlots = sortTimeSlots(availableTimeSlots);
        setFilteredTimes(sortedTimeSlots);
    }, [selectedDate, blockedTimes, availableSchedules]);

    const handleTimeSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.value;
        setSelectedTime(selected);
        onTimeChange(selected);
    };

    const sortTimeSlots = (times: string[]): string[] => {
        return [...times].sort((a, b) => {
            const [timeA, periodA] = a.split(' ');
            const [timeB, periodB] = b.split(' ');

            if (periodA === 'AM' && periodB === 'PM') return -1;
            if (periodA === 'PM' && periodB === 'AM') return 1;

            if (periodA === periodB) {
                const [hoursA, minutesA] = timeA.split(':').map(Number);
                const [hoursB, minutesB] = timeB.split(':').map(Number);

                const normalizedHoursA = hoursA === 12 ? 0 : hoursA;
                const normalizedHoursB = hoursB === 12 ? 0 : hoursB;

                if (normalizedHoursA !== normalizedHoursB) {
                    return normalizedHoursA - normalizedHoursB;
                }
                return minutesA - minutesB;
            }
            return 0;
        });
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
                {availableTimes.map((time, index) => {
                    let formattedTime = "";
                    try {
                        if (time.includes(":")) {
                            const today = new Date().toISOString().split("T")[0];
                            const dateTimeString = `${today} ${time}`;
                            const combinedDateTime = parse(dateTimeString, 'yyyy-MM-dd hh:mm a', new Date());
                            if (isNaN(combinedDateTime.getTime())) {
                                throw new Error(`Invalid time value: ${time}`);
                            }
                            formattedTime = format(combinedDateTime, "hh:mm a").replace(/^0/, '');
                        } else {
                            const date = new Date(time);
                            if (isNaN(date.getTime())) {
                                throw new Error(`Invalid ISO time value: ${time}`);
                            }
                            formattedTime = format(date, "hh:mm a").replace(/^0/, '');
                        }
                    } catch (error) {
                        console.error(error.message);
                        formattedTime = "Invalid time";
                    }

                    return (
                        <option key={index} value={time}>
                            {`${formattedTime} ($${originalPrice})`}
                        </option>
                    );
                })}
            </Select>
        </VStack>
    );
};

export default DatePicker;