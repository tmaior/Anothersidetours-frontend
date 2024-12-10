import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Input, NumberDecrementStepper, NumberIncrementStepper,
    NumberInput,
    NumberInputField, NumberInputStepper,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Select,
    Switch,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import React, {useState} from "react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function SchedulesAvailabilityPage() {
    const [eventDuration, setEventDuration] = useState("4");
    const [inventoryDuration, setInventoryDuration] = useState("4");
    const [schedule, setSchedule] = useState([]);
    const [guestLimit, setGuestLimit] = useState(8);
    const [earlyArrival, setEarlyArrival] = useState(false);
    const [earlyCutoff, setEarlyCutoff] = useState(true);
    const [futureCutoff, setFutureCutoff] = useState(false);
    const [businessHours, setBusinessHours] = useState("");

    const handleAddSchedule = (time) => {
        setSchedule([...schedule, time]);
    };

    const handleRemoveSchedule = (index: number) => {
        setSchedule(schedule.filter((_, i) => i !== index));
    };

    return (
        <DashboardLayout>
            <Box p={8} maxWidth="900px" mx="auto">
                <Text fontSize="2xl" fontWeight="bold" mb={6}>
                    Schedules & Availability
                </Text>

                <VStack spacing={6} align="stretch">
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={2}>
                            Schedules
                        </Text>
                        <Text fontSize="sm" color="gray.600" mb={4}>
                            Build activity schedules that your Experiences is available to be
                            booked by customers.
                        </Text>
                        <Flex gap={4}>
                            <FormControl>
                                <FormLabel>Event Duration</FormLabel>
                                <Flex gap={2}>
                                    <Input
                                        type="number"
                                        value={eventDuration}
                                        onChange={(e) => setEventDuration(e.target.value)}
                                    />
                                    <Select>
                                        <option value="hour">hour</option>
                                        <option value="minute">minute</option>
                                    </Select>
                                </Flex>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Inventory Duration</FormLabel>
                                <Flex gap={2}>
                                    <Input
                                        type="number"
                                        value={inventoryDuration}
                                        onChange={(e) => setInventoryDuration(e.target.value)}
                                    />
                                    <Select>
                                        <option value="hour">hour</option>
                                        <option value="minute">minute</option>
                                    </Select>
                                </Flex>
                            </FormControl>
                        </Flex>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Schedule
                        </Text>
                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                >
                                    Add Schedule
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent w={"290px"}>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverHeader>Select Time</PopoverHeader>
                                <PopoverBody>
                                    <TimeSelector onTimeAdd={handleAddSchedule} />
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                        <VStack align="stretch" mt={4}>
                            {schedule.map((sched, index) => (
                                <Flex
                                    key={index}
                                    justify="space-between"
                                    p={2}
                                    bg="gray.100"
                                    borderRadius="md"
                                >
                                    <Text>{sched}</Text>
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() => handleRemoveSchedule(index)}
                                    >
                                        Remove
                                    </Button>
                                </Flex>
                            ))}
                        </VStack>
                    </Box>
                    <Box>
                        <FormControl>
                            <HStack justify="space-between">
                                <Text>Early Arrival</Text>
                                <Switch
                                    isChecked={earlyArrival}
                                    onChange={(e) => setEarlyArrival(e.target.checked)}
                                />
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                Customers should arrive before scheduled time.
                            </Text>
                        </FormControl>
                    </Box>

                    <Divider/>
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={2}>
                            Guest Limits
                        </Text>
                        <FormControl>
                            <FormLabel>Per Event Limit</FormLabel>
                            <Input
                                type="number"
                                value={guestLimit}
                                onChange={(e) => setGuestLimit(Number(e.target.value))}
                            />
                        </FormControl>
                    </Box>

                    <Divider/>
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={2}>
                            Availability Restrictions
                        </Text>
                        <FormControl>
                            <HStack justify="space-between">
                                <Text>Early Cutoff</Text>
                                <Switch
                                    isChecked={earlyCutoff}
                                    onChange={(e) => setEarlyCutoff(e.target.checked)}
                                />
                            </HStack>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                                Prevent purchases that are made within 1 day of event start time.
                            </Text>
                        </FormControl>
                        <FormControl>
                            <HStack justify="space-between">
                                <Text>Future Cutoff</Text>
                                <Switch
                                    isChecked={futureCutoff}
                                    onChange={(e) => setFutureCutoff(e.target.checked)}
                                />
                            </HStack>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                                Prevent purchases made too far in advance.
                            </Text>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Business Hours</FormLabel>
                            <Textarea
                                value={businessHours}
                                onChange={(e) => setBusinessHours(e.target.value)}
                                placeholder="Enter business hours"
                            />
                        </FormControl>
                    </Box>

                    <HStack justify="space-between">
                        <Button variant="outline" colorScheme="gray">
                            Cancel
                        </Button>
                        <Button colorScheme="blue">Save</Button>
                    </HStack>
                </VStack>
            </Box>
        </DashboardLayout>
    );
}

function TimeSelector({ onTimeAdd }) {
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [ampm, setAmPm] = useState('AM');

    const handleAddTime = () => {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeString = `${formattedHour}:${formattedMinute} ${ampm}`;
        onTimeAdd(timeString);
    };

    return (
        <VStack spacing={4}>
            <HStack spacing={2}>
                <NumberInput
                    w={"80px"}
                    max={12}
                    min={1}
                    value={hour}
                    onChange={(valueString) => {
                        const valueNumber = parseInt(valueString, 10);
                        if (!isNaN(valueNumber)) {
                            setHour(valueNumber);
                        }
                    }}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Text>:</Text>
                <NumberInput
                    w={"80px"}
                    max={59}
                    min={0}
                    value={minute}
                    onChange={(valueString) => {
                        const valueNumber = parseInt(valueString, 10);
                        if (!isNaN(valueNumber)) {
                            setMinute(valueNumber);
                        }
                    }}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Select
                    value={ampm}
                    onChange={(e) => setAmPm(e.target.value)}
                    width="80px"
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </Select>
            </HStack>
            <Button colorScheme="blue" onClick={handleAddTime}>
                Add Time
            </Button>
        </VStack>
    );
}