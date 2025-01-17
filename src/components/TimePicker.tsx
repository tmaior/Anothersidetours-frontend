import React, {useState} from "react";
import {Box, Button, Divider, HStack, SimpleGrid, Text, VStack} from "@chakra-ui/react";

const TimePicker = ({onTimeSelect}) => {
    const [selectedHour, setSelectedHour] = useState(null);
    const [selectedMinute, setSelectedMinute] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("AM");

    const hours = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, "0"));
    const minutes = Array.from({length: 12}, (_, i) => String(i * 5).padStart(2, "0"));

    const handleHourSelect = (hour) => {
        setSelectedHour(hour);
        if (hour && selectedMinute && selectedPeriod) {
            onTimeSelect(`${hour}:${selectedMinute} ${selectedPeriod}`);
        }
    };

    const handleMinuteSelect = (minute) => {
        setSelectedMinute(minute);
        if (selectedHour && minute && selectedPeriod) {
            onTimeSelect(`${selectedHour}:${minute} ${selectedPeriod}`);
        }
    };

    const handlePeriodSelect = (period) => {
        setSelectedPeriod(period);
        if (selectedHour && selectedMinute && period) {
            onTimeSelect(`${selectedHour}:${selectedMinute} ${period}`);
        }
    };

    return (
        <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
            <HStack spacing={4} align="start">
                <VStack align="stretch" mt={12}>
                    <SimpleGrid columns={1} spacing={4}>
                        <Button
                            size="sm"
                            variant={selectedPeriod === "AM" ? "solid" : "outline"}
                            colorScheme={selectedPeriod === "AM" ? "blue" : "gray"}
                            onClick={() => handlePeriodSelect("AM")}
                            borderRadius="full"
                        >
                            AM
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedPeriod === "PM" ? "solid" : "outline"}
                            colorScheme={selectedPeriod === "PM" ? "blue" : "gray"}
                            onClick={() => handlePeriodSelect("PM")}
                            borderRadius="full"
                        >
                            PM
                        </Button>
                    </SimpleGrid>
                </VStack>

                <Divider orientation="vertical" h="150px"/>

                <VStack align="stretch">
                    <Text fontWeight="bold" mb={2} textAlign="center">
                        Hour
                    </Text>
                    <SimpleGrid columns={4} spacing={2}>
                        {hours.map((hour) => (
                            <Button
                                key={hour}
                                size="sm"
                                variant={selectedHour === hour ? "solid" : "outline"}
                                colorScheme={selectedHour === hour ? "blue" : "gray"}
                                onClick={() => handleHourSelect(hour)}
                                borderRadius="full"
                            >
                                {hour}
                            </Button>
                        ))}
                    </SimpleGrid>
                </VStack>

                <Divider orientation="vertical" h="150px"/>

                <VStack align="stretch">
                    <Text fontWeight="bold" mb={2} textAlign="center">
                        Minute
                    </Text>
                    <SimpleGrid columns={4} spacing={2}>
                        {minutes.map((minute) => (
                            <Button
                                key={minute}
                                size="sm"
                                variant={selectedMinute === minute ? "solid" : "outline"}
                                colorScheme={selectedMinute === minute ? "blue" : "gray"}
                                onClick={() => handleMinuteSelect(minute)}
                                borderRadius="full"
                            >
                                {minute}
                            </Button>
                        ))}
                    </SimpleGrid>
                </VStack>
            </HStack>
        </Box>
    );
};

export default TimePicker;