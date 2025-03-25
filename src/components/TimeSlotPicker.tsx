import React from 'react';
import {
    Box,
    Grid,
    Text,
    HStack,
    Button,
} from '@chakra-ui/react';

interface TimeSlotPickerProps {
    onTimeSelect: (time: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ onTimeSelect }) => {
    const [selectedHour, setSelectedHour] = React.useState<{hour: string, period: 'AM' | 'PM'} | null>(null);
    const [selectedMinute, setSelectedMinute] = React.useState<string | null>(null);

    const hours = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    const handleHourSelect = (hour: string, period: 'AM' | 'PM') => {
        setSelectedHour({ hour, period });
    };

    const handleMinuteSelect = (minute: string) => {
        setSelectedMinute(minute);
        if (selectedHour) {
            const timeString = `${selectedHour.hour}:${minute} ${selectedHour.period}`;
            onTimeSelect(timeString);
        }
    };

    return (
        <Box p={4}>
            <HStack spacing={12} align="flex-start">
                <Box>
                    <Text fontWeight="medium" mb={3}>Hour</Text>
                    <Box position="relative">
                        <Box position="absolute" left="-30px" top="10px">
                            <Text color="gray.400">AM</Text>
                        </Box>
                        <Box position="absolute" left="-30px" top="85px">
                            <Text color="gray.400">PM</Text>
                        </Box>
                        <Grid templateColumns="repeat(6, 1fr)" gap={2} mb={2}>
                            {hours.map((hour) => (
                                <Button
                                    key={`AM-${hour}`}
                                    size="sm"
                                    variant="outline"
                                    bg={selectedHour?.hour === hour && selectedHour?.period === 'AM' ? 'blue.100' : 'white'}
                                    onClick={() => handleHourSelect(hour, 'AM')}
                                    borderRadius="full"
                                    height="32px"
                                    minW="32px"
                                    p={0}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    {hour}
                                </Button>
                            ))}
                        </Grid>
                        <Grid templateColumns="repeat(6, 1fr)" gap={2}>
                            {hours.map((hour) => (
                                <Button
                                    key={`PM-${hour}`}
                                    size="sm"
                                    variant="outline"
                                    bg={selectedHour?.hour === hour && selectedHour?.period === 'PM' ? 'blue.100' : 'white'}
                                    onClick={() => handleHourSelect(hour, 'PM')}
                                    borderRadius="full"
                                    height="32px"
                                    minW="32px"
                                    p={0}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    {hour}
                                </Button>
                            ))}
                        </Grid>
                    </Box>
                </Box>

                <Box>
                    <Text fontWeight="medium" mb={3}>Minute</Text>
                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        {minutes.map((minute) => (
                            <Button
                                key={minute}
                                size="sm"
                                variant="outline"
                                bg={selectedMinute === minute ? 'blue.100' : 'white'}
                                onClick={() => handleMinuteSelect(minute)}
                                borderRadius="full"
                                height="32px"
                                minW="32px"
                                p={0}
                                border="1px solid"
                                borderColor="gray.200"
                                _hover={{ bg: 'gray.50' }}
                                isDisabled={!selectedHour}
                            >
                                {minute}
                            </Button>
                        ))}
                    </Grid>
                </Box>
            </HStack>
        </Box>
    );
};

export default TimeSlotPicker;