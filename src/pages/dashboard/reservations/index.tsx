import {
    Box,
    VStack,
    HStack,
    Input,
    Checkbox,
    Button,
    Text,
    Heading,
    Flex,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/DashboardLayout";

export default function ListReservations() {
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const [reservations, setReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [filterTenant] = useState("");
    const [searchName, setSearchName] = useState("");
    const [filteredReservations, setFilteredReservations] = useState([]);
    const toast = useToast();
    const router = useRouter();

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
    }, []);

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

    const handleSelectReservation = (id) => {
        setSelectedReservation(selectedReservation === id ? null : id);
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

    const handleAddAddons = () => {
        if (selectedReservation) {
            router.push(`/dashboard/add-addons/${selectedReservation}`);
        }
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
                        >
                            <Checkbox
                                isChecked={selectedReservation === reservation.id}
                                onChange={() => handleSelectReservation(reservation.id)}
                                colorScheme="teal"
                                mr={4}
                            />
                            <Box>
                                <Heading fontSize="lg" color="white">
                                    {reservation.tour.name}
                                </Heading>
                                <Text color="gray.300">Date: {new Date(reservation.reservation_date).toLocaleString()}</Text>
                                <Text color="gray.300">Guests: {reservation.guestQuantity}</Text>
                                <Text color="gray.300">Total Price: ${reservation.total_price.toFixed(2)}</Text>
                                <Text color="gray.300">Status: {reservation.status}</Text>
                                <Text color="gray.300">
                                    Add-ons:{" "}
                                    {reservation.reservationAddons.map((addon) => addon.name).join(", ") || "None"}
                                </Text>
                            </Box>
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
                    <Button
                        colorScheme="blue"
                        onClick={handleAddAddons}
                        isDisabled={!selectedReservation}
                    >
                        Add Add-ons
                    </Button>
                </HStack>
            </Box>
        </DashboardLayout>
    );
}