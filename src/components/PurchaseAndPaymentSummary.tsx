import React, {useEffect, useState} from "react";
import {Box, Divider, HStack, Spinner, Text, VStack,} from "@chakra-ui/react";
import axios from "axios";

const PurchaseAndPaymentSummary = ({booking}) => {
    const [cardDetails, setCardDetails] = useState(null);
    const [reservationAddons, setReservationAddons] = useState([]);
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(true);

    useEffect(() => {
        const fetchAddons = async () => {
            if (!booking?.id || !booking.tourId) return;

            try {
                const reservationAddonsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`
                );

                const allAddonsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`
                );

                setReservationAddons(reservationAddonsResponse.data);
                setAllAddons(allAddonsResponse.data);
            } catch (error) {
                console.error('Error fetching add-ons:', error);
            } finally {
                setIsLoadingAddons(false);
            }
        };

        fetchAddons();
    }, [booking?.id, booking.tourId]);

    const combinedAddons = booking.reservationAddons?.map((selectedAddon) => {
        const addonDetails = allAddons.find(
            (addon) => addon.id === selectedAddon.addonId
        );
        return {
            ...addonDetails,
            quantity: selectedAddon.value,
        };
    }) || [];

    const addonsTotalPrice = combinedAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity || 0),
        0
    );

    const finalTotalPrice = booking.total_price + addonsTotalPrice;

    useEffect(() => {
        const fetchCardDetails = async () => {
            if (!booking.paymentMethodId) return;
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${booking.paymentMethodId}`
                );
                setCardDetails(response.data);
            } catch (error) {
                console.error("Failed to fetch card details:", error);
            }
        };

        fetchCardDetails();
    }, [booking.paymentMethodId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    return (
        <VStack
            bg="gray.50"
            p={6}
            borderRadius="md"
            borderWidth="1px"
            flex="2"
            spacing={6}
            align="stretch"
            w="100%"
            h="350px"
            minW="300px"
            minH="300px"
        >
            <Box padding="10px" w="100%" h="500px">
                <Text fontWeight="bold" mb={2}>
                    Purchase Summary
                </Text>
                <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                        <Text>{`Guests ($${(booking.valuePerGuest || booking.tour?.price).toFixed(2)} × ${booking.guestQuantity})`}</Text>
                        <Text>${parseFloat(booking.total_price).toFixed(2)}</Text>
                    </HStack>
                </VStack>
                {isLoadingAddons ? (
                    <HStack justifyContent="center">
                        <Spinner size="sm"/>
                        <Text>Loading Add-ons...</Text>
                    </HStack>
                ) : (
                    combinedAddons.map((addon) => (
                        <HStack key={addon.id} justifyContent="space-between">
                            <Text>{addon.label} (${addon.price} x {addon.quantity})</Text>
                            <Text>${addon.price * addon.quantity}</Text>
                        </HStack>
                    ))
                )}
                <Divider my={2}/>
                <HStack justify="space-between">
                    <Text fontWeight="bold">Total</Text>
                    <Text fontWeight="bold">${finalTotalPrice.toFixed(2)}</Text>
                </HStack>
            </Box>
            <Box>
                <Text fontWeight="bold" mb={2}>
                    Payment Summary
                </Text>
                <VStack align="stretch" spacing={2}>
                    {cardDetails && (
                        <HStack justify="space-between">
                            <HStack spacing={2}>
                                <Box as="span" role="img" aria-label="Card Icon" fontSize="lg">
                                    💳
                                </Box>
                                <Text>
                                    Payment
                                    <Box
                                        as="span"
                                        bg="white"
                                        px={1}
                                        py={1}
                                        borderRadius="md"
                                        boxShadow="sm"
                                    >
                                        *{cardDetails.last4}
                                    </Box>{" "}
                                    {formatDate(cardDetails.paymentDate)}
                                </Text>
                            </HStack>
                            {/*<Text>${finalTotalPrice.toFixed(2)}</Text>*/}
                        </HStack>
                    )}
                    <HStack justify="space-between">
                        <Text>Paid</Text>
                        <Text>${finalTotalPrice.toFixed(2)}</Text>
                    </HStack>
                </VStack>
            </Box>
        </VStack>
    );
};

export default PurchaseAndPaymentSummary;