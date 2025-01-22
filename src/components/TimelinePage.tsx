import React, {useEffect, useState} from "react";
import {Box, Flex, HStack, Spinner, StackDivider, Switch, Text, useColorModeValue, VStack} from "@chakra-ui/react";
import {CheckCircleIcon, EmailIcon} from "@chakra-ui/icons";
import axios from "axios";

export default function TimelinePage({reservationId}: { reservationId: string }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReservation, setShowReservation] = useState(true);
    const [showCommunication, setShowCommunication] = useState(true);
    const dividerColor = useColorModeValue("gray.200", "gray.700");

    useEffect(() => {
        async function fetchEvents() {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history/byReservation/${reservationId}`);
                setEvents(response.data);
            } catch (err) {
                setError(err.message || "Failed to fetch events");
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [reservationId]);

    const filteredEvents = events.filter((evt: any) => {
        if (evt.eventType === "Reservation" && !showReservation) return false;
        if (evt.eventType === "Communication" && !showCommunication) return false;
        return true;
    });

    if (loading) {
        return (
            <Box p={8} textAlign="center">
                <Spinner size="xl"/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={8} textAlign="center" color="red.500">
                <Text>Error: {error}</Text>
            </Box>
        );
    }

    return (
        <Box p={8}>
            <HStack spacing={8} mb={4}>
                <HStack>
                    <Switch
                        isChecked={showReservation}
                        onChange={(e) => setShowReservation(e.target.checked)}
                        colorScheme="blue"
                    />
                    <Text>Reservation Events</Text>
                </HStack>
                <HStack>
                    <Switch
                        isChecked={showCommunication}
                        onChange={(e) => setShowCommunication(e.target.checked)}
                        colorScheme="blue"
                    />
                    <Text>Communication</Text>
                </HStack>
            </HStack>

            <VStack align="stretch" divider={<StackDivider borderColor={dividerColor}/>}>
                {filteredEvents.map((event: any, idx: number) => (
                    <TimelineItem key={event.id} event={event} isLast={idx === filteredEvents.length - 1}/>
                ))}
            </VStack>
        </Box>
    );
}


function TimelineItem({event, isLast}: { event: any; isLast: boolean }) {
    let icon = <EmailIcon/>;
    if (event.title === "Payment") {
        icon = <CheckCircleIcon color="green.400"/>;
    }

    return (
        <Flex position="relative" pb={4}>
            <Box minW="60px" textAlign="right" mr={4}>
                <Text fontWeight="bold" fontSize="sm">
                    {event.createdAt}
                </Text>
                <Text fontSize="xs" color="gray.500">
                    {event.dayOfWeek}
                </Text>
            </Box>

            <Box position="relative" mr={4}>
                <Box
                    position="absolute"
                    left="15px"
                    top="0"
                    w="2px"
                    h="100%"
                    bg="gray.300"
                    zIndex={-1}
                    display={isLast ? "none" : "block"}
                />
                <Flex
                    w="30px"
                    h="30px"
                    borderRadius="50%"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.300"
                    align="center"
                    justify="center"
                >
                    {icon}
                </Flex>
            </Box>
            <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                    {event.createdAt}
                </Text>
                <Text fontWeight="bold" mb={1}>
                    {event.eventTitle}
                </Text>
                {event.to && (
                    <Text fontSize="sm" color="gray.600">
                        To: {event.to}
                    </Text>
                )}

                <Text fontSize="sm" bg="gray.100" p={2} borderRadius="md" mt={2}>
                    {event.eventDescription}
                </Text>
            </Box>
        </Flex>
    );
}