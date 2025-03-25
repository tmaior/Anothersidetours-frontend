import React from 'react';
import {
    Box,
    Grid,
    Text,
    HStack,
    VStack,
    Button,
} from '@chakra-ui/react';

interface TimeSlotPickerProps {
    onTimeSelect: (time: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ onTimeSelect }) => {
    const [selectedPeriod, setSelectedPeriod] = React.useState<'AM' | 'PM'>('PM');
    const [selectedHour, setSelectedHour] = React.useState<string | null>(null);
    const [selectedMinute, setSelectedMinute] = React.useState<string | null>(null);

    const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    const handleTimeSelection = () => {
        if (selectedHour && selectedMinute) {
            onTimeSelect(`${selectedHour}:${selectedMinute} ${selectedPeriod}`);
        }
    };

    return (
        <Box p={4}>
            <HStack spacing={6} align="flex-start">
                <VStack spacing={2} align="center">
                    <Button
                        size="sm"
                        variant="ghost"
                        color={selectedPeriod === 'AM' ? 'black' : 'gray.500'}
                        onClick={() => setSelectedPeriod('AM')}
                        height="32px"
                        minW="40px"
                        p={0}
                    >
                        AM
                    </Button>
                    <Button
                        size="sm"
                        bg={selectedPeriod === 'PM' ? 'blue.500' : 'transparent'}
                        color={selectedPeriod === 'PM' ? 'white' : 'gray.500'}
                        onClick={() => setSelectedPeriod('PM')}
                        borderRadius="full"
                        height="32px"
                        minW="40px"
                        _hover={{
                            bg: selectedPeriod === 'PM' ? 'blue.600' : 'gray.100'
                        }}
                    >
                        PM
                    </Button>
                </VStack>

                <Box flex={1}>
                    <HStack spacing={8} align="flex-start">
                        <Box>
                            <Text fontWeight="medium" mb={2}>Hour</Text>
                            <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                                {hours.map((hour) => (
                                    <Button
                                        key={hour}
                                        size="sm"
                                        variant="outline"
                                        bg={selectedHour === hour ? 'gray.100' : 'white'}
                                        onClick={() => setSelectedHour(hour)}
                                        borderRadius="full"
                                        height="32px"
                                        minW="40px"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        _hover={{
                                            bg: 'gray.100'
                                        }}
                                    >
                                        {hour}
                                    </Button>
                                ))}
                            </Grid>
                        </Box>

                        <Box>
                            <Text fontWeight="medium" mb={2}>Minute</Text>
                            <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                                {minutes.map((minute) => (
                                    <Button
                                        key={minute}
                                        size="sm"
                                        variant="outline"
                                        bg={selectedMinute === minute ? 'gray.100' : 'white'}
                                        onClick={() => setSelectedMinute(minute)}
                                        borderRadius="full"
                                        height="32px"
                                        minW="40px"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        _hover={{
                                            bg: 'gray.100'
                                        }}
                                    >
                                        {minute}
                                    </Button>
                                ))}
                            </Grid>
                        </Box>
                    </HStack>
                </Box>
            </HStack>

            <Button
                mt={6}
                width="100%"
                bg="blue.100"
                color="blue.700"
                _hover={{
                    bg: 'blue.200'
                }}
                onClick={handleTimeSelection}
                isDisabled={!selectedHour || !selectedMinute}
            >
                Select
            </Button>
        </Box>
    );
};

export default TimeSlotPicker;