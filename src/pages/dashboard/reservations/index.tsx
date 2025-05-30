import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    HStack,
    Image,
    Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select,
    Text,
    Textarea,
    useColorModeValue, useDisclosure,
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
    const [additionalInformation, setAdditionalInformation] = useState({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isOpen, onOpen, onClose } = useDisclosure();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reason, setReason] = useState("");
    const { isOpen: isAddonModalOpen, onOpen: openAddonModal, onClose: closeAddonModal } = useDisclosure();
    const [availableAddons, setAvailableAddons] = useState([]);
    const [selectedAddon, setSelectedAddon] = useState("");
    const [customAddon, setCustomAddon] = useState<{ label: string; price: number; quantity: number }>({
        label: "",
        price: 0,
        quantity: 1,
    });

    useEffect(() => {
        async function fetchReservations() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`,{
                    credentials: "include",
                });
                const data = await response.json();

                const groupedReservations = [];
                const reservationGroups = {};
                
                if (Array.isArray(data)) {
                    data.forEach(reservation => {
                        const dateTime = new Date(reservation.reservation_date);
                        const dateKey = dateTime.toISOString().split('T')[0];
                        const timeKey = dateTime.toISOString().split('T')[1].substring(0, 5);
                        const groupKey = `${reservation.tourId}_${dateKey}_${timeKey}`;
                        
                        if (!reservationGroups[groupKey]) {
                            reservationGroups[groupKey] = {
                                ...reservation,
                                isGrouped: true,
                                groupedReservations: [reservation],
                                totalGuests: reservation.guestQuantity,
                                reservationIds: [reservation.id]
                            };
                        } else {
                            reservationGroups[groupKey].totalGuests += reservation.guestQuantity;
                            reservationGroups[groupKey].groupedReservations.push(reservation);
                            reservationGroups[groupKey].reservationIds.push(reservation.id);
                        }
                    });
                    Object.values(reservationGroups).forEach(group => {
                        groupedReservations.push(group);
                    });
                    
                    setReservations(groupedReservations);
                    setFilteredReservations(groupedReservations);
                } else {
                    setReservations([]);
                    setFilteredReservations([]);
                }
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${reservationId}`,{
                credentials: "include",
            });
            const reservationAddons = await response.json();

            return await Promise.all(
                reservationAddons.map(async (addon) => {
                    const addonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons/${addon.addonId}`,{
                        credentials: "include",
                    });
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
        async function fetchAddons() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons`,{
                    credentials: "include",
                });
                const data = await response.json();
                setAvailableAddons(data || []);
            } catch (error) {
                console.error("Error fetching addons:", error);
                toast({
                    title: "Error",
                    description: "Failed to load add-ons.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        fetchAddons();
    }, [toast]);

    const handleAddAddon = async () => {
        const reservation = reservations.find((res) => res.id === selectedReservation);

        if (!reservation) {
            toast({
                title: "Error",
                description: "Reservation not found.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const addonData = availableAddons.find((addon) => addon.id === selectedAddon);
        if (!addonData) {
            toast({
                title: "Error",
                description: "Add-on not found.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const currentAddons = reservationAddons[selectedReservation] || [];
        const existingAddon = currentAddons.find((addon) => addon.addonId === selectedAddon);

        try {
            let updatedAddon;
            if (addonData.type === "SELECT") {
                const quantity = customAddon.quantity;

                if (!quantity || quantity < 1) {
                    toast({
                        title: "Error",
                        description: "Quantity must be greater than 0.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }

                if (existingAddon) {
                    updatedAddon = {
                        ...existingAddon,
                        value: `${parseInt(existingAddon.value || "0") + quantity}`,
                    };
                } else {
                    updatedAddon = {
                        addonId: selectedAddon,
                        label: addonData.label,
                        value: `${quantity}`,
                    };
                }
            } else if (addonData.type === "CHECKBOX") {
                if (existingAddon) {
                    toast({
                        title: "Error",
                        description: "Checkbox Add-on already added.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
                updatedAddon = {
                    addonId: selectedAddon,
                    label: addonData.label,
                    value: addonData.price.toString(),
                };
            }

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: reservation.tenantId,
                    reservationId: selectedReservation,
                    addonId: updatedAddon.addonId,
                    value: updatedAddon.value,
                }),
            });

            setReservationAddons((prev) => ({
                ...prev,
                [selectedReservation]: [
                    ...currentAddons.filter((addon) => addon.addonId !== updatedAddon.addonId),
                    updatedAddon,
                ],
            }));

            const newTotalPrice = reservation.total_price + addonData.price * (customAddon.quantity || 1);

            setReservations(
                reservations.map((res) =>
                    res.id === selectedReservation
                        ? { ...res, total_price: newTotalPrice }
                        : res
                )
            );

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${selectedReservation}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    total_price: newTotalPrice,
                }),
            });

            toast({
                title: "Add-on Added",
                description: "The Add-on was successfully added.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            closeAddonModal();
        } catch (error) {
            console.error("Error adding Add-on:", error);
            toast({
                title: "Error",
                description: "Failed to add Add-on.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // const handleRemoveAddon = async (reservationId, addonId, addonPrice, addonQuantity) => {
    //     try {
    //
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${addonId}`, {
    //             method: "DELETE",
    //         });
    //
    //         if (!response.ok) {
    //             throw new Error("Failed to remove add-on");
    //         }
    //
    //         setReservationAddons((prev) => ({
    //             ...prev,
    //             [reservationId]: prev[reservationId].filter((addon) => addon.id !== addonId),
    //         }));
    //
    //         const reservation = reservations.find((res) => res.id === reservationId);
    //         const newTotalPrice = reservation.total_price - addonPrice * addonQuantity;
    //
    //         setReservations((prevReservations) =>
    //             prevReservations.map((res) =>
    //                 res.id === reservationId ? { ...res, total_price: newTotalPrice } : res
    //             )
    //         );
    //
    //         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`, {
    //             method: "PUT",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 total_price: newTotalPrice,
    //             }),
    //         });
    //
    //         toast({
    //             title: "Add-on Removed",
    //             description: "The add-on was successfully removed.",
    //             status: "success",
    //             duration: 3000,
    //             isClosable: true,
    //         });
    //     } catch (error) {
    //         console.error("Error removing add-on:", error);
    //         toast({
    //             title: "Error",
    //             description: "Failed to remove add-on.",
    //             status: "error",
    //             duration: 5000,
    //             isClosable: true,
    //         });
    //     }
    // };


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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,{
                credentials: "include",
            });
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

    async function fetchAdditionalInformation(reservationId) {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/customer-additional-information?reservationId=${reservationId}`,
                {
                    credentials: "include",
                }
            );
            const data = await response.json();
            return data.map((info) => ({
                title: info.additionalInformation.title,
                value: info.value,
            }));
        } catch (error) {
            console.error("Error fetching additional information:", error);
            return [];
        }
    }

    const handleAddNote = async (reservationId) => {
        if (newNote.trim()) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reservationId,
                        description: newNote,
                    }),
                });

                if (!response.ok) throw new Error("Failed to add note");

                const createdNote = await response.json();

                setNotes((prevNotes) => ({
                    ...prevNotes,
                    [reservationId]: [...(prevNotes[reservationId] || []), createdNote],
                }));

                setNewNote("");
                toast({
                    title: "Note Added",
                    description: "Note has been added successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error adding note:", error);
                toast({
                    title: "Error",
                    description: "Failed to add note.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleRemoveNote = async (reservationId, noteId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${noteId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to delete note");

            setNotes((prevNotes) => ({
                ...prevNotes,
                [reservationId]: prevNotes[reservationId].filter((note) => note.id !== noteId),
            }));

            toast({
                title: "Note Removed",
                description: "Note has been removed successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error removing note:", error);
            toast({
                title: "Error",
                description: "Failed to remove note.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        if (expandedReservation) {
            fetchAdditionalInformation(expandedReservation).then((data) => {
                setAdditionalInformation((prev) => ({
                    ...prev,
                    [expandedReservation]: data,
                }));
            });
            const fetchNotes = async (reservationId) => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${reservationId}`,
                        {
                            credentials: "include",
                        });
                    const data = await response.json();
                    setNotes((prevNotes) => ({
                        ...prevNotes,
                        [reservationId]: data,
                    }));
                } catch (error) {
                    console.error("Error fetching notes:", error);
                }
            };
            fetchNotes(expandedReservation);
        }
    }, [expandedReservation]);

    const handleSelectReservation = (id) => {
        setSelectedReservation(selectedReservation === id ? null : id);
    };

    const handleAccept = async () => {
        if (!selectedReservation) return;

        const reservation = reservations.find((res) => res.id === selectedReservation);

        if (!reservation) {
            toast({
                title: "Error",
                description: "Reservation not found.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm-payment`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: reservation.user?.email,
                    paymentMethodId: reservation.paymentMethodId,
                    amount: reservation.total_price * 100,
                    currency: "usd",
                }),
            });

            if (!paymentResponse.ok) throw new Error("Failed to confirm payment");

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${selectedReservation}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACCEPTED" }),
            });

            setReservations(
                reservations.map((res) =>
                    res.id === selectedReservation ? { ...res, status: "ACCEPTED" } : res
                )
            );

            toast({
                title: "Reservation Accepted",
                description: "The reservation has been accepted and payment confirmed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error confirming payment:", error);
            toast({
                title: "Error",
                description: "Failed to accept reservation.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // const handleReject = () => {
    //     onOpen();
    // };

    const confirmReject = async () => {
        if (!selectedReservation) return;

        const reservation = reservations.find((res) => res.id === selectedReservation);

        if (!reservation) {
            toast({
                title: "Error",
                description: "Reservation not found.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/invalidate-payment-method`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentMethodId: reservation.paymentMethodId }),
            });

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${selectedReservation}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED" }),
            });

            setReservations(
                reservations.map((res) =>
                    res.id === selectedReservation ? { ...res, status: "REJECTED" } : res
                )
            );

            toast({
                title: "Reservation Rejected",
                description: "The reservation has been rejected.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
        } catch (error) {
            console.error("Error rejecting reservation:", error);
            toast({
                title: "Error",
                description: "Failed to reject reservation.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
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
                            key={reservation.isGrouped ? reservation.reservationIds.join('_') : reservation.id}
                            p={4}
                            bg="gray.700"
                            borderRadius="md"
                            boxShadow="md"
                            align="center"
                            direction="column"
                        >
                            <HStack w="100%" align="center">
                                <Checkbox
                                    isChecked={selectedReservation === (reservation.isGrouped ? reservation.reservationIds[0] : reservation.id)}
                                    onChange={() => handleSelectReservation(reservation.isGrouped ? reservation.reservationIds[0] : reservation.id)}
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
                                    <Text color="gray.300">
                                        Guests: {reservation.isGrouped ? reservation.totalGuests : reservation.guestQuantity} 
                                        {reservation.isGrouped && reservation.tour.minPerEventLimit > 0 && (
                                            <span> {reservation.totalGuests >= reservation.tour.minPerEventLimit 
                                                ? "(Minimum reached)" 
                                                : `(Need ${reservation.tour.minPerEventLimit - reservation.totalGuests} more)`}
                                            </span>
                                        )}
                                    </Text>
                                    <Text color="gray.300">Total Price: ${reservation.total_price.toFixed(2)}</Text>
                                    <Text color="gray.300">Status: {reservation.status}</Text>
                                    {reservation.isGrouped && reservation.groupedReservations.length > 1 && (
                                        <Text color="blue.300">
                                            {reservation.groupedReservations.length} reservations grouped
                                        </Text>
                                    )}
                                </Box>
                                <Button
                                    size="sm"
                                    colorScheme="teal"
                                    onClick={() => toggleExpandReservation(reservation.isGrouped ? reservation.reservationIds[0] : reservation.id)}
                                >
                                    {expandedReservation === (reservation.isGrouped ? reservation.reservationIds[0] : reservation.id) ? "Hide Details" : "View Details"}
                                </Button>
                                <Button size="sm" colorScheme="blue" onClick={openAddonModal}>
                                    Add Add-ons
                                </Button>
                            </HStack>
                            {expandedReservation === (reservation.isGrouped ? reservation.reservationIds[0] : reservation.id) && (
                                <Box mt={4} bg="gray.600" p={4} borderRadius="md" w="100%">
                                    {reservation.isGrouped && reservation.groupedReservations.length > 1 && (
                                        <Box mb={4} p={2} bg="gray.700" borderRadius="md">
                                            <Text color="white" fontWeight="bold">Grouped Reservations:</Text>
                                            {reservation.groupedReservations.map((subReservation, index) => (
                                                <Box key={subReservation.id} p={2} mt={2} bg="gray.800" borderRadius="md">
                                                    <Text color="white">Reservation #{index + 1}</Text>
                                                    <Text color="gray.300">Guest: {subReservation.user?.name || 'N/A'}</Text>
                                                    <Text color="gray.300">Quantity: {subReservation.guestQuantity}</Text>
                                                    <Text color="gray.300">Status: {subReservation.status}</Text>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                    
                                    <Text color="gray.300" fontWeight="bold">
                                        Add-ons:
                                    </Text>
                                    {reservationAddons[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id]?.length > 0 ? (
                                        reservationAddons[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id].map((addon) => (
                                            <Text key={addon.id} color="gray.300">
                                                - {addon.label} (Quantity: {addon.value})
                                            </Text>
                                        ))
                                    ) : (
                                        <Text color="gray.300">No add-ons available.</Text>
                                    )}
                                    <Text fontWeight="bold" mt={4} color="white">
                                        Additional Information
                                    </Text>
                                    {additionalInformation[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id]?.length > 0 ? (
                                        additionalInformation[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id].map((info, index) => (
                                            <Text key={index} color="gray.300">
                                                {info.title}: {info.value}
                                            </Text>
                                        ))
                                    ) : (
                                        <Text color="gray.300">No additional information available.</Text>
                                    )}

                                    <Text fontWeight="bold" mt={4} color="white">
                                        Customer Information
                                    </Text>
                                    <Text
                                        color="gray.300">Name: {reservationUsers[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id]?.name || "N/A"}</Text>
                                    <Text
                                        color="gray.300">Email: {reservationUsers[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id]?.email || "N/A"}</Text>
                                    <Text color="gray.300">
                                        Phone: {reservationUsers[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id]?.phone || "None"}
                                    </Text>
                                    <Text color="gray.300">Guests: {reservation.isGrouped ? reservation.totalGuests : reservation.guestQuantity}</Text>

                                    <Text fontWeight="bold" mt={4} color="white">
                                        Notes
                                    </Text>
                                    {notes[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id]?.length > 0 ? (
                                        notes[reservation.isGrouped ? reservation.reservationIds[0] : reservation.id].map((note) => (
                                            <HStack key={note.id} mt={2} justify="space-between">
                                                <Text color="gray.300">{note.description}</Text>
                                                <Button
                                                    size="xs"
                                                    colorScheme="red"
                                                    onClick={() => handleRemoveNote(reservation.isGrouped ? reservation.reservationIds[0] : reservation.id, note.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </HStack>
                                        ))
                                    ) : (
                                        <Text color="gray.300">No notes available.</Text>
                                    )}
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
                                            onClick={() => handleAddNote(reservation.isGrouped ? reservation.reservationIds[0] : reservation.id)}
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
                        isDisabled={
                            reservations.find((res) => res.id === selectedReservation)?.status !== "PENDING"
                        }
                    >
                        Accept
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={confirmReject}
                        isDisabled={
                            reservations.find((res) => res.id === selectedReservation)?.status !== "PENDING"
                        }
                    >
                        Reject
                    </Button>
                </HStack>

                <Modal isOpen={isAddonModalOpen} onClose={closeAddonModal}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Add Add-ons</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Select
                                placeholder="Select an existing add-on"
                                onChange={(e) => {
                                    const addon = availableAddons.find((a) => a.id === e.target.value);
                                    setSelectedAddon(e.target.value);
                                    if (addon && addon.type === "SELECT") {
                                        setCustomAddon((prev) => ({ ...prev, quantity: 1 }));
                                    } else {
                                        setCustomAddon((prev) => ({ ...prev, quantity: 0 }));
                                    }
                                }}
                                bg={inputBgColor}
                            >
                                {availableAddons.map((addon) => (
                                    <option key={addon.id} value={addon.id}>
                                        {addon.label} (${addon.price})
                                    </option>
                                ))}
                            </Select>
                            {selectedAddon &&
                                availableAddons.find((addon) => addon.id === selectedAddon)?.type === "SELECT" && (
                                    <Input
                                        placeholder="Quantity"
                                        type="number"
                                        min={1}
                                        value={customAddon.quantity}
                                        onChange={(e) =>
                                            setCustomAddon((prev) => ({
                                                ...prev,
                                                quantity: parseInt(e.target.value, 10) || 1,
                                            }))
                                        }
                                        bg={inputBgColor}
                                        mt={2}
                                    />
                                )}
                            {/*<Text mt={4}>Or create a custom add-on:</Text>*/}
                            {/*<Input*/}
                            {/*    placeholder="Custom Add-on Label"*/}
                            {/*    value={customAddon.label}*/}
                            {/*    onChange={(e) =>*/}
                            {/*        setCustomAddon({ ...customAddon, label: e.target.value })*/}
                            {/*    }*/}
                            {/*    bg={inputBgColor}*/}
                            {/*    mt={2}*/}
                            {/*/>*/}
                            {/*<Input*/}
                            {/*    placeholder="Custom Add-on Price"*/}
                            {/*    type="number"*/}
                            {/*    value={customAddon.price}*/}
                            {/*    onChange={(e) =>*/}
                            {/*        setCustomAddon({*/}
                            {/*            ...customAddon,*/}
                            {/*            price: parseFloat(e.target.value) || 0,*/}
                            {/*        })*/}
                            {/*    }*/}
                            {/*    bg={inputBgColor}*/}
                            {/*    mt={2}*/}
                            {/*/>*/}
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" onClick={handleAddAddon}>
                                Add Add-on
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </DashboardLayout>
    );
}
