import React from 'react';
import {Box, Button, Divider, FormControl, FormLabel, HStack, IconButton, Image, Input, Text, VStack} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

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
    cart: Array<{
        id: string;
        imageUrl: string;
        name: string;
        price: number;
        valuePerGuest?: number;
    }>;
    date: string;
    time: string;
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
    removeFromCart: (index: number) => void;
}

const PurchaseSummary: React.FC<PurchaseSummaryProps> = ({
    cart,
    date,
    time,
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
    removeFromCart,
}) => {
    const calculateCartTotal = () => {
        return cart.reduce((total, tour, index) => {
            const itemTotal = tour.price * quantity;
            const addonTotal = combinedAddons.reduce((sum, addon) => 
                sum + (addon.price * addon.quantity), 0);
            const customItemsTotal = isCustomLineItemsEnabled 
                ? customLineItems.reduce((sum, item) => {
                    const itemAmount = item.amount * item.quantity;
                    return item.type === "Discount" ? sum - itemAmount : sum + itemAmount;
                  }, 0)
                : 0;
                
            return total + itemTotal + addonTotal + customItemsTotal;
        }, 0);
    };
    
    const cartTotal = calculateCartTotal();
    const finalTotal = Math.max(cartTotal - voucherDiscount, 0);
    
    return (
        <>
            <VStack spacing={4} align="stretch" mb={4}>
                {cart.map((tour, index) => (
                    <Box 
                        key={`${tour.id}-${index}`} 
                        bg="blue.50" 
                        p={4} 
                        borderRadius="md" 
                        w="120%" 
                        ml="-10%"
                        position="relative"
                    >
                        <IconButton
                            aria-label="Remove item"
                            icon={<DeleteIcon />}
                            size="sm"
                            position="absolute"
                            top={2}
                            right={2}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeFromCart(index)}
                        />
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
                                Guests (${tour.price} × {quantity})
                            </Text>
                            <Text>
                                ${(quantity * tour.price).toFixed(2)}
                            </Text>
                        </HStack>
                        {combinedAddons.length > 0 ? (
                            combinedAddons.map((addon) => (
                                <HStack key={`${addon.id}-${index}`} justifyContent="space-between">
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
                                {customLineItems.map((item, itemIndex) => (
                                    <HStack key={`${itemIndex}-${index}`} justify="space-between">
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
                ))}
            </VStack>
            
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
                US${finalTotal.toFixed(2)}
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
        </>
    );
};

export default PurchaseSummary;