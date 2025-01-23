import React, { useEffect, useState } from "react";
import {
    VStack,
    Box,
    Text,
    HStack,
    Divider,
} from "@chakra-ui/react";
import axios from "axios";

const PurchaseAndPaymentSummary = ({ booking }) => {
    const [cardDetails, setCardDetails] = useState(null);

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
                <Divider my={2} />
                <HStack justify="space-between">
                    <Text fontWeight="bold">Total</Text>
                    <Text fontWeight="bold">${parseFloat(booking.total_price).toFixed(2)}</Text>
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
                            <Text>${parseFloat(booking.total_price).toFixed(2)}</Text>
                        </HStack>
                    )}
                    <HStack justify="space-between">
                        <Text>Paid</Text>
                        <Text>${parseFloat(booking.total_price).toFixed(2)}</Text>
                    </HStack>
                </VStack>
            </Box>
        </VStack>
    );
};

export default PurchaseAndPaymentSummary;