import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    HStack,
    Image,
    Input,
    Text,
    Textarea,
    useColorModeValue,
    useToast,
    VStack,
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function ListReservations() {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [reservations, setReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [expandedReservation, setExpandedReservation] = useState(null);
    const [notes, setNotes] = useState({});
    const [newNote, setNewNote] = useState("");
    const [filterTenant] = useState("");
    const [searchName, setSearchName] = useState("");
    const [filteredReservations, setFilteredReservations] = useState([]);
    const toast = useToast();
    const [reservationAddons, setReservationAddons] = useState({});
    const [reservationUsers, setReservationUsers] = useState({});

    useEffect(() => {
        async function fetchReservations() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`);
                const data = await response.json();
                setReservations(Array.isArray(data) ? data : []);
                setFilteredReservations(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching reservations:", error);
                toast({
                    title: "Error",
                    description: "Failed to load reservations.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        fetchReservations();
    }, [toast]);

    useEffect(() => {
        if (expandedReservation) {
            fetchReservationAddons(expandedReservation).then((addons) => {
                setReservationAddons((prev) => ({
                    ...prev,
                    [expandedReservation]: addons,
                }));
            });
        }
    }, [expandedReservation]);

    async function fetchReservationAddons(reservationId) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${reservationId}`);
            const reservationAddons = await response.json();

            return await Promise.all(
                reservationAddons.map(async (addon) => {
                    const addonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons/${addon.addonId}`);
                    const addonDetails = await addonResponse.json();

                    return {
                        ...addon,
                        label: addonDetails.label,
                    };
                })
            );
        } catch (error) {
            console.error("Error fetching reservation addons:", error);
            return [];
        }
    }

    useEffect(() => {
        let filtered = reservations;

        if (filterTenant) {
            filtered = filtered.filter((reservation) => reservation.tenantId === filterTenant);
        }

        if (searchName) {
            filtered = filtered.filter((reservation) =>
                reservation.tour.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredReservations(filtered);
    }, [filterTenant, searchName, reservations]);

    async function fetchUserById(userId) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    }

    useEffect(() => {
        if (expandedReservation) {
            const reservation = reservations.find((res) => res.id === expandedReservation);

            if (reservation?.user_id) {
                fetchUserById(reservation.user_id).then((user) => {
                    setReservationUsers((prev) => ({
                        ...prev,
                        [reservation.id]: user,
                    }));
                });
            }
        }
    }, [expandedReservation, reservations]);

    const handleSelectReservation = (id) => {
        setSelectedReservation(selectedReservation === id ? null : id);
    };

    const handleAddNote = (id) => {
        if (newNote.trim()) {
            setNotes((prevNotes) => ({
                ...prevNotes,
                [id]: [...(prevNotes[id] || []), newNote],
            }));
            setNewNote("");
        }
    };

    const handleRemoveNote = (id, index) => {
        setNotes((prevNotes) => ({
            ...prevNotes,
            [id]: prevNotes[id].filter((_, i) => i !== index),
        }));
    };

    const handleAccept = async () => {
        if (selectedReservation) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${selectedReservation}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "confirmed" }),
                });
                setReservations(
                    reservations.map((reservation) =>
                        reservation.id === selectedReservation
                            ? { ...reservation, status: "confirmed" }
                            : reservation
                    )
                );
                toast({
                    title: "Reservation Confirmed",
                    description: "The reservation has been confirmed.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error accepting reservation:", error);
                toast({
                    title: "Error",
                    description: "Failed to confirm the reservation.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleReject = async () => {
        if (selectedReservation) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${selectedReservation}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "rejected" }),
                });
                setReservations(
                    reservations.map((reservation) =>
                        reservation.id === selectedReservation
                            ? { ...reservation, status: "rejected" }
                            : reservation
                    )
                );
                toast({
                    title: "Reservation Rejected",
                    description: "The reservation has been rejected.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error rejecting reservation:", error);
                toast({
                    title: "Error",
                    description: "Failed to reject the reservation.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const toggleExpandReservation = (id) => {
        setExpandedReservation(expandedReservation === id ? null : id);
    };

    return (
        <DashboardLayout>
            <Box bg={bgColor} p={8} borderRadius="md" color="black">
                <HStack mb={4} spacing={4}>
                    <Input
                        placeholder="Search by tour name"
                        bg={inputBgColor}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </HStack>
                <VStack spacing={6} align="stretch">
                    {filteredReservations.map((reservation) => (
                        <Flex
                            key={reservation.id}
                            p={4}
                            bg="gray.700"
                            borderRadius="md"
                            boxShadow="md"
                            align="center"
                            direction="column"
                        >
                            <HStack w="100%" align="center">
                                <Checkbox
                                    isChecked={selectedReservation === reservation.id}
                                    onChange={() => handleSelectReservation(reservation.id)}
                                    colorScheme="teal"
                                    mr={4}
                                />
                                <Image
                                    src={reservation.tour.imageUrl}
                                    alt={reservation.tour.name}
                                    boxSize="150px"
                                    borderRadius="md"
                                    mr={4}
                                />
                                <Box flex="1">
                                    <Heading fontSize="lg" color="white">
                                        {reservation.tour.name}
                                    </Heading>
                                    <Text color="gray.300">
                                        Date:{" "}
                                        {new Date(reservation.reservation_date).toLocaleString("en-US", {
                                            month: "2-digit",
                                            day: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                            timeZone: "UTC",
                                        })}
                                    </Text>
                                    <Text color="gray.300">Guests: {reservation.guestQuantity}</Text>
                                    <Text color="gray.300">Total Price: ${reservation.total_price.toFixed(2)}</Text>
                                    <Text color="gray.300">Status: {reservation.status}</Text>
                                </Box>
                                <Button
                                    size="sm"
                                    colorScheme="teal"
                                    onClick={() => toggleExpandReservation(reservation.id)}
                                >
                                    {expandedReservation === reservation.id ? "Hide Details" : "View Details"}
                                </Button>
                            </HStack>
                            {expandedReservation === reservation.id && (
                                <Box mt={4} bg="gray.600" p={4} borderRadius="md" w="100%">
                                    <Text color="gray.300" fontWeight="bold">
                                        Add-ons:
                                    </Text>
                                    {reservationAddons[reservation.id]?.length > 0 ? (
                                        reservationAddons[reservation.id].map((addon) => (
                                            <Text key={addon.id} color="gray.300">
                                                - {addon.label} (Quantity: {addon.value})
                                            </Text>
                                        ))
                                    ) : (
                                        <Text color="gray.300">No add-ons available.</Text>
                                    )}
                                    <Text fontWeight="bold" color="white">
                                        Additional Details
                                    </Text>
                                    <Text color="gray.300">{reservation.additionalInformation || "N/A"}</Text>

                                    <Text fontWeight="bold" mt={4} color="white">
                                        Customer Information
                                    </Text>
                                    <Text color="gray.300">Name: {reservationUsers[reservation.id]?.name || "N/A"}</Text>
                                    <Text color="gray.300">Email: {reservationUsers[reservation.id]?.email || "N/A"}</Text>
                                    <Text color="gray.300">
                                        Phone: {reservationUsers[reservation.id]?.phone || "None"}
                                    </Text>
                                    <Text color="gray.300">Guests: {reservation.guestQuantity}</Text>

                                    <Text fontWeight="bold" mt={4} color="white">
                                        Notes
                                    </Text>
                                    {notes[reservation.id]?.map((note, index) => (
                                        <HStack key={index} mt={2} justify="space-between">
                                            <Text color="gray.300">{note}</Text>
                                            <Button
                                                size="xs"
                                                colorScheme="red"
                                                onClick={() => handleRemoveNote(reservation.id, index)}
                                            >
                                                Remove
                                            </Button>
                                        </HStack>
                                    ))}
                                    <HStack mt={4}>
                                        <Textarea
                                            placeholder="Add a note..."
                                            bg="gray.700"
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                        />
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => handleAddNote(reservation.id)}
                                            isDisabled={!newNote.trim()}
                                        >
                                            Add Note
                                        </Button>
                                    </HStack>
                                </Box>
                            )}
                        </Flex>
                    ))}
                </VStack>
                <HStack mt={4} spacing={4}>
                    <Button
                        colorScheme="green"
                        onClick={handleAccept}
                        isDisabled={!selectedReservation}
                    >
                        Accept
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleReject}
                        isDisabled={!selectedReservation}
                    >
                        Reject
                    </Button>
                </HStack>
            </Box>
        </DashboardLayout>
    );
}
