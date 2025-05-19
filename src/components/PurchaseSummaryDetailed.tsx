import React from 'react';
import {Box, Button, Divider, Flex, Text, VStack,} from '@chakra-ui/react';
import {CiCircleInfo} from "react-icons/ci";

interface AddonItem {
    name: string;
    price: number;
    quantity: number;
}

interface TourItem {
    name: string;
    bookingFeePercent: number;
    pricePerGuest: number;
    guestCount: number;
    gratuityAmount: number;
    gratuityPercent: number;
    addons?: AddonItem[];
    total?: number;
}

interface PaymentInfo {
    date: string;
    amount: number;
}

interface PurchaseSummaryDetailedProps {
    tours: TourItem[];
    payments: PaymentInfo[];
    onApplyCode?: () => void;
}

const PurchaseSummaryDetailed: React.FC<PurchaseSummaryDetailedProps> = ({
                                                                             tours,
                                                                             payments,
                                                                             onApplyCode,
                                                                         }) => {
    const formatCurrency = (amount: number) => {
        return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const calculateTourTotal = (tour: TourItem) => {
        if (tour.total !== undefined) {
            return tour.total;
        }
        const guestsTotal = tour.pricePerGuest * tour.guestCount;
        const addonsTotal = tour.addons?.reduce((sum, addon) =>
            sum + (addon.price * addon.quantity), 0) || 0;
        return guestsTotal + tour.gratuityAmount + addonsTotal;
    };

    const grandTotal = tours.reduce((total, tour) => total + calculateTourTotal(tour), 0);

    return (
        <Box bg="gray.50" p={6} borderRadius="md">
            <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg" mb={2}>Purchase Summary</Text>

                {tours.map((tour, index) => {
                    const guestsTotal = tour.pricePerGuest * tour.guestCount;
                    const tourTotal = calculateTourTotal(tour);
                    return (
                        <Box key={index} mb={index < tours.length - 1 ? 5 : 0}>
                            <Text fontWeight="bold" fontSize="md" mb={1}>{tour.name}</Text>

                            <Flex justify="space-between" mb={1}>
                                <Text color="gray.600"
                                      fontSize="sm">{`Guests ($${formatCurrency(tour.pricePerGuest)} × ${tour.guestCount})`}</Text>
                                <Text fontWeight="normal" fontSize="sm"
                                      textAlign="right">${formatCurrency(guestsTotal)}</Text>
                            </Flex>
                            {tour.gratuityAmount > 0 && (
                                <Flex justify="space-between" mb={1}>
                                    <Text color="gray.600" fontSize="sm">{`${tour.gratuityPercent}% Gratuity`}</Text>
                                    <Text fontWeight="normal" fontSize="sm"
                                          textAlign="right">${formatCurrency(tour.gratuityAmount)}</Text>
                                </Flex>
                            )}
                            {tour.addons && tour.addons.length > 0 && (
                                <>
                                    {tour.addons.map((addon, addonIndex) => (
                                        <Flex key={`addon-${addonIndex}`} justify="space-between" mb={1}>
                                            <Text color="gray.600"
                                                  fontSize="sm">{`${addon.name} ($${formatCurrency(addon.price)} × ${addon.quantity})`}</Text>
                                            <Text fontWeight="normal" fontSize="sm"
                                                  textAlign="right">${formatCurrency(addon.price * addon.quantity)}</Text>
                                        </Flex>
                                    ))}
                                </>
                            )}

                            <Flex justify="space-between" mt={3} mb={3}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    // colorScheme="black"
                                    height="28px"
                                    fontSize="sm"
                                    background={"white"}
                                    fontWeight="normal"
                                    borderRadius="md"
                                >
                                    <Text fontWeight="medium">
                                        Modify
                                    </Text>
                                </Button>
                                <Flex direction="column" align="flex-end">
                                    <Text color="gray.600" fontSize="sm">Total</Text>
                                    <Text fontSize="sm" fontWeight="bold">${formatCurrency(tourTotal)}</Text>
                                </Flex>
                            </Flex>
                            {index < tours.length - 1 && <Divider/>}
                        </Box>
                    );
                })}

                <Divider my={2}/>
                <Flex justify="space-between" mb={4}>
                    <Text fontWeight="bold" fontSize="lg">Grand Total</Text>
                    <Text fontWeight="bold" fontSize="lg">${formatCurrency(grandTotal)}</Text>
                </Flex>

                <Box mt={2}>
                    <Text fontWeight="bold" fontSize="lg" mb={2}>Payment Summary</Text>
                    <VStack align="stretch" spacing={1} mt={2}>
                        {payments.map((payment, index) => (
                            <Flex key={index} justify="space-between" mb={1}>
                                <Flex alignItems="center">
                                    <Box
                                        as="span"
                                        borderRadius="full"
                                        // bg="gray.200"
                                        // color="gray.500"
                                        p={1}
                                        mr={2}
                                        fontSize="xs"
                                    >
                                        <CiCircleInfo
                                            style={{
                                                fontSize: "15px",
                                            }}/>
                                    </Box>
                                    <Text color="gray.600" fontSize="sm">Payment {payment.date}</Text>
                                </Flex>
                                <Text fontSize="sm">${formatCurrency(payment.amount)}</Text>
                            </Flex>
                        ))}
                    </VStack>
                </Box>

                <Flex justify="space-between" mt={4} align="center">
                    <Box>
                        <Button
                            size="sm"
                            variant="outline"
                            // colorScheme="blue"
                            onClick={onApplyCode}
                            height="28px"
                            fontSize="sm"
                            fontWeight="normal"
                            borderRadius="md"
                            background={`white`}
                        >
                            <Text fontWeight="medium">
                                Apply Code
                            </Text>
                        </Button>
                    </Box>
                    <Flex direction="column" align="flex-end">
                        <Text color="gray.600" fontSize="sm">Paid</Text>
                        <Text fontSize="md" fontWeight="bold">${formatCurrency(grandTotal)}</Text>
                    </Flex>
                </Flex>
            </VStack>
        </Box>
    );
};

export default PurchaseSummaryDetailed;