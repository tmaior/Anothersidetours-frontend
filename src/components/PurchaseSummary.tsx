import React from 'react';
import {Box, Button, Divider, FormControl, FormLabel, Heading, HStack, Image, Input, Text,} from '@chakra-ui/react';

interface Addon {
    id: string;
    label: string;
    price: number;
    quantity: number;
}

interface LineItem {
    name: string;
    type: 'Charge' | 'Discount';
    amount: number;
    quantity: number;
}

interface PurchaseSummaryProps {
    tour: { imageUrl: string; name: string };
    date: string;
    time: string;
    basePrice: number;
    quantity: number;
    combinedAddons: Addon[];
    isCustomLineItemsEnabled: boolean;
    customLineItems: LineItem[];
    voucherDiscount: number;
    totalWithDiscount: number;
    items: { type: string; amount: number; quantity: number; name: string }[];
    voucherCode: string;
    setVoucherCode: (value: string) => void;
    voucherError?: string;
    handleValidateVoucher: () => void;
}

const PurchaseSummary: React.FC<PurchaseSummaryProps> = ({
                                                             tour,
                                                             date,
                                                             time,
                                                             basePrice,
                                                             quantity,
                                                             combinedAddons,
                                                             isCustomLineItemsEnabled,
                                                             customLineItems,
                                                             voucherDiscount,
                                                             totalWithDiscount,
                                                             items,
                                                             voucherCode,
                                                             setVoucherCode,
                                                             voucherError,
                                                             handleValidateVoucher,
                                                         }) => {
    return (
        <Box w={{base: "100%", md: "400px"}} bg="white" p={6} borderRadius="md" boxShadow="sm">
            <Heading size="md" mb={4}>Purchase Summary</Heading>
            <Box bg="blue.50" p={4} borderRadius="md" mb={4} w="120%" ml="-10%">
                <HStack>
                    <Image
                        src={tour.imageUrl}
                        boxSize="40px"
                        borderRadius="md"
                        alt="Tour Icon"
                        objectFit="fill"
                    />
                    <Text fontWeight="bold">{tour.name}</Text>
                </HStack>
                <Text fontSize="sm">
                    {date} - {time}
                </Text>
                <HStack justify="space-between">
                    <Text mt={2}>
                        Guests (${basePrice} × {quantity})
                    </Text>
                    <Text>
                        ${(quantity * basePrice).toFixed(2)}
                    </Text>
                </HStack>
                {combinedAddons.length > 0 ? (
                    combinedAddons.map((addon) => (
                        <HStack key={addon.id} justifyContent="space-between">
                            <Text>
                                {addon.label} (${addon.price} x {addon.quantity})
                            </Text>
                            <Text>
                                ${(addon.price * addon.quantity).toFixed(2)}
                            </Text>
                        </HStack>
                    ))
                ) : (
                    <Text>No add-ons selected.</Text>
                )}
                {isCustomLineItemsEnabled && customLineItems.length > 0 && (
                    <Box>
                        {customLineItems.map((item, index) => (
                            <HStack key={index} justify="space-between">
                                <Text>
                                    {item.name || "Unnamed"} ({item.type === "Discount" ? "-" : ""}${item.amount} × {item.quantity})
                                </Text>
                                <Text fontWeight="semibold">
                                    {item.type === "Discount" ? "-" : ""}${(item.amount * item.quantity).toFixed(2)}
                                </Text>
                            </HStack>
                        ))}
                    </Box>
                )}
            </Box>
            {voucherDiscount > 0 && (
                <Box bg="green.50" p={4} borderRadius="md" mb={4}>
                    <Text fontWeight="bold" color="green.600">
                        Discount Applied
                    </Text>
                    <Text>- ${voucherDiscount.toFixed(2)}</Text>
                </Box>
            )}
            <Divider mb={4}/>
            <Text fontWeight="bold" mb={2}>Grand Total</Text>
            <Text fontSize="xl" mb={4}>
                US${(totalWithDiscount +
                items.reduce((acc, item) => {
                    const totalItem = item.amount * item.quantity;
                    return item.type === "Discount" ? acc - totalItem : acc + totalItem;
                }, 0)
            ).toFixed(2)}
            </Text>
            <FormControl mb={4}>
                <FormLabel>Code</FormLabel>
                <HStack>
                    <Input
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Enter code"
                    />
                    <Button onClick={handleValidateVoucher}>Apply Code</Button>
                </HStack>
                {voucherError && <Text color="red.500">{voucherError}</Text>}
            </FormControl>
        </Box>
    );
};

export default PurchaseSummary;