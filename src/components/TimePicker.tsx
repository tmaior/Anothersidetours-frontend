import React, {useState} from "react";
import {Box, Button, Divider, Grid, GridItem, SimpleGrid, Text, Flex, useBreakpointValue} from "@chakra-ui/react";

const TimePicker = ({onTimeSelect}) => {
    const [selectedHour, setSelectedHour] = useState(null);
    const [selectedMinute, setSelectedMinute] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("AM");
    const isMobile = useBreakpointValue({ base: true, md: false });

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
        <Box 
            p={4} 
            borderWidth="1px" 
            borderRadius="md" 
            bg="white" 
            width="100%" 
            maxW="450px"
            mx="auto"
            marginLeft={isMobile ? "5px" : "auto"}
        >
            <Grid templateColumns="80px 1px 1fr" gap={4}>
                <GridItem display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
                    <Button
                        size="md"
                        variant={selectedPeriod === "AM" ? "solid" : "outline"}
                        colorScheme={selectedPeriod === "AM" ? "blue" : "gray"}
                        onClick={() => handlePeriodSelect("AM")}
                        borderRadius="full"
                        mb={4}
                        w="60px"
                        h="60px"
                    >
                        AM
                    </Button>
                    <Button
                        size="md"
                        variant={selectedPeriod === "PM" ? "solid" : "outline"}
                        colorScheme={selectedPeriod === "PM" ? "blue" : "gray"}
                        onClick={() => handlePeriodSelect("PM")}
                        borderRadius="full"
                        w="60px"
                        h="60px"
                    >
                        PM
                    </Button>
                </GridItem>

                <GridItem>
                    <Divider orientation="vertical" height="100%" />
                </GridItem>

                <GridItem>
                    <Flex direction="column" width="100%">
                        <Box mb={4}>
                            <Text fontWeight="medium" textAlign="center" mb={3}>
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
                        </Box>

                        <Box>
                            <Text fontWeight="medium" textAlign="center" mb={3}>
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
                        </Box>
                    </Flex>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default TimePicker;