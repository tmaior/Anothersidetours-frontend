import React, {useEffect, useState} from "react";
import {Box, Flex, HStack, Spinner, StackDivider, Switch, Text, useColorModeValue, VStack} from "@chakra-ui/react";
import {EmailIcon} from "@chakra-ui/icons";
import axios from "axios";
import {FaCheck, FaDollarSign, FaPlus, FaTimes} from "react-icons/fa";
import {GrUpdate} from "react-icons/gr";
import {TfiLayoutWidthDefaultAlt} from "react-icons/tfi";
import {format} from "date-fns";
import {MdDoNotDisturbOn} from "react-icons/md";

interface Event {
    id: string;
    eventTitle: string;
    status: "ACCEPTED" | "REJECTED" | "CANCELED" | "PAYMENT" | "CREATED";
    eventType: "Reservation" | "Communication";
    createdAt: string;
    createdBy?: string;
    eventDescription?: string;
    value?: number;
    to?: string;
}

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

    const filteredEvents = events.filter((evt: Event) => {
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
                {filteredEvents.map((event: Event, idx: number) => (
                    <TimelineItem key={event.id} event={event} isLast={idx === filteredEvents.length - 1}/>
                ))}
            </VStack>
        </Box>
    );
}


function TimelineItem({event, isLast}: { event: Event; isLast: boolean }) {

    function getEventIcon(title: string) {
        if (event.status === "ACCEPTED") {
            return <FaCheck color="green.400"/>;
        }

        if (event.status === "REJECTED") {
            return <MdDoNotDisturbOn color="green.400"/>;
        }

        if (event.status === "CANCELED") {
            return <FaTimes color="red.400"/>;
        }

        if (event.status === "PAYMENT") {
            return <FaDollarSign color="red.400"/>;
        }

        switch (title.toLowerCase()) {
            case "reservation created":
                return <FaPlus color="green.400"/>;
            case "reservation updated":
                return <GrUpdate color="red.400"/>;
            case "email sent":
                return <EmailIcon/>;
            default:
                return <TfiLayoutWidthDefaultAlt color="gray.400"/>;
        }
    }

    const icon = getEventIcon(event.eventTitle);

    return (
        <Flex position="relative" pb={4}>
            <Box minW="60px" textAlign="right" mr={4}>
                <Text fontSize="sm" color="gray.500">
                    {format(new Date(event.createdAt), 'MMM')}
                </Text>
                <Text fontWeight="bold" fontSize="lg">
                    {format(new Date(event.createdAt), 'd')}
                </Text>
                <Text fontSize="sm" color="gray.500">
                    {format(new Date(event.createdAt), 'EEE')}
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
                    {format(new Date(event.createdAt), 'MMM d, hh:mm a')}
                </Text>
                <Text fontWeight="bold" mb={1}>
                    {event.eventTitle}
                </Text>
                {event.status.toLowerCase() === "created" && (
                    <Text fontSize="sm" borderRadius="md" mb={1}>
                        {event.createdBy}
                    </Text>
                )}
                {(["paid", "created"].some(keyword => event.eventDescription.toLowerCase().includes(keyword)) && event.value != null) && (
                    <Text fontSize="sm" borderRadius="md">
                        ${Number(event.value).toFixed(2)}
                    </Text>
                )}
                {event.to && (
                    <Text fontSize="sm" color="gray.600">
                        To: {event.to}
                    </Text>
                )}

                {event.status.toLowerCase() !== "created" && (
                    <Text fontSize="sm" bg="gray.100" p={2} borderRadius="md" mt={2}>
                        {event.eventDescription}
                    </Text>
                )}
            </Box>
        </Flex>
    );
}