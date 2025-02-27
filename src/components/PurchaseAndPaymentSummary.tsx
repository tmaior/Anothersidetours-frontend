import React, {useEffect, useState} from "react";
import {Box, Divider, HStack, Spinner, Text, VStack,} from "@chakra-ui/react";
import axios from "axios";

interface Addon {
    id: string;
    label: string;
    price: number;
    type: 'SELECT' | 'CHECKBOX';
}

interface CardDetails {
    last4: string;
    paymentDate: string;
}

interface Booking {
    id: string;
    tourId: string;
    valuePerGuest?: number;
    tour?: { price: number };
    paymentMethodId?: string;
    reservationAddons?: { addonId: string; value: string }[];
    cardLast4?: string;
    paymentDate?: string;
}

interface PurchaseAndPaymentSummaryProps {
    booking: Booking;
    guestQuantity: number;
    selectedAddons?: Record<string, number | boolean>;
    allAddons?: Addon[];
    cardDetails?: CardDetails;
}

const PurchaseAndPaymentSummary: React.FC<PurchaseAndPaymentSummaryProps> = ({
                                                                                 booking,
                                                                                 guestQuantity,
                                                                                 selectedAddons = {},
                                                                                 allAddons = [],
                                                                                 cardDetails,
                                                                             }) => {
    const [internalReservationAddons, setInternalReservationAddons] = useState<{
        addonId: string;
        value: string
    }[]>([]);
    const [internalAllAddons, setInternalAllAddons] = useState<Addon[]>([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState<boolean>(true);
    const [internalCardDetails, setInternalCardDetails] = useState<CardDetails | null>(null);
    const [isLoadingCardDetails, setIsLoadingCardDetails] = useState<boolean>(true);

    useEffect(() => {
        if (allAddons.length === 0) {
            const fetchAddons = async () => {
                if (!booking?.id || !booking.tourId) return;

                try {
                    const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`)
                    ]);

                    setInternalAllAddons(allAddonsResponse.data);
                    setInternalReservationAddons(reservationAddonsResponse.data);
                } catch (error) {
                    console.error('Error fetching add-ons:', error);
                } finally {
                    setIsLoadingAddons(false);
                }
            };

            fetchAddons();
        } else {
            setIsLoadingAddons(false);
        }
    }, [allAddons, booking]);

    useEffect(() => {
        if (!cardDetails && booking.paymentMethodId) {
            const fetchCardDetails = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${booking.paymentMethodId}`
                    );
                    setInternalCardDetails(response.data);
                } catch (error) {
                    console.error("Failed to fetch card details:", error);
                } finally {
                    setIsLoadingCardDetails(false);
                }
            };

            fetchCardDetails();
        } else {
            setIsLoadingCardDetails(false);
        }
    }, [cardDetails, booking.paymentMethodId]);

    let combinedAddons: (Addon & { quantity: number })[] = [];
    if (allAddons.length > 0) {
        combinedAddons = allAddons.reduce((acc: (Addon & { quantity: number })[], addon) => {
            const selectedValue = selectedAddons[addon.id];
            if (addon.type === 'SELECT' && typeof selectedValue === 'number' && selectedValue > 0) {
                acc.push({
                    ...addon,
                    quantity: selectedValue,
                });
            } else if (addon.type === 'CHECKBOX' && selectedValue === true) {
                acc.push({
                    ...addon,
                    quantity: 1,
                });
            }
            return acc;
        }, []);
    } else {
        combinedAddons = internalAllAddons.reduce((acc: (Addon & { quantity: number })[], addon) => {
            const selectedAddon = internalReservationAddons.find(resAddon => resAddon.addonId === addon.id);
            if (addon.type === 'SELECT' && selectedAddon && parseInt(selectedAddon.value, 10) > 0) {
                acc.push({
                    ...addon,
                    quantity: parseInt(selectedAddon.value, 10),
                });
            } else if (addon.type === 'CHECKBOX' && selectedAddon && selectedAddon.value === "1") {
                acc.push({
                    ...addon,
                    quantity: 1,
                });
            }
            return acc;
        }, []);
    }

    const addonsTotalPrice = combinedAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity),
        0
    );

    const finalTotalPrice = ((booking.valuePerGuest || booking.tour?.price) * guestQuantity) + addonsTotalPrice;

    const formattedCardDetails = cardDetails || internalCardDetails;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    };

    function formatDateToAmerican(date) {
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year}`;
    }

    if (isLoadingAddons || isLoadingCardDetails) {
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
                <HStack justifyContent="center">
                    <Spinner size="sm"/>
                    <Text>Loading Add-ons...</Text>
                </HStack>
            </VStack>
        );
    }

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
                        <Text>{`Guests ($${(booking.valuePerGuest || booking.tour?.price).toFixed(2)} × ${guestQuantity})`}</Text>
                        <Text>${((booking.valuePerGuest || booking.tour?.price) * guestQuantity).toFixed(2)}</Text>
                    </HStack>
                </VStack>
                {combinedAddons.length > 0 ? (
                    combinedAddons.map((addon) => (
                        <HStack key={addon.id} justifyContent="space-between">
                            <Text>{addon.label} (${addon.price} x {addon.quantity})</Text>
                            <Text>${(addon.price * addon.quantity).toFixed(2)}</Text>
                        </HStack>
                    ))
                ) : (
                    <Text>No add-ons selected.</Text>
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
                    {formattedCardDetails && (
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
                                        *{formattedCardDetails.last4}
                                    </Box>{" "}
                                    {formatDateToAmerican(formatDate(formattedCardDetails.paymentDate))}
                                </Text>
                            </HStack>
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