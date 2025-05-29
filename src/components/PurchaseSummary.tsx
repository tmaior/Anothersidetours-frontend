import React from 'react';
import {Box, Button, Divider, FormControl, FormLabel, HStack, IconButton, Image, Input, Text, VStack} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

interface Addon {
    id: string;
    label: string;
    price: number;
    quantity?: number;
    type?: 'CHECKBOX' | 'SELECT';
    tourId?: string;
    description?: string;
}

interface LineItem {
    name: string;
    type: 'Charge' | 'Discount';
    amount: number;
    quantity: number;
}

interface ItemFormData {
    quantity: number;
    date: string;
    time: string;
    organizerName: string;
    emailEnabled: boolean;
    organizerEmail: string;
    phoneEnabled: boolean;
    organizerPhone: string;
    organizerAttending: boolean;
    attendees: Array<{name: string, info: string}>;
    purchaseTags: string;
    purchaseNote: string;
    selectedAddOns: Array<{
        addOnId: string;
        quantity: number;
        checked: boolean;
    }>;
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
    customLineItems: {[key: string]: any[]};
    voucherDiscount: number;
    totalWithDiscount: number;
    items: { type: string; amount: number; quantity: number; name: string }[];
    voucherCode: string;
    setVoucherCode: (value: string) => void;
    voucherError?: string;
    handleValidateVoucher: () => void;
    removeFromCart: (index: number) => void;
    selectedCartItemIndex: number;
    onSelectCartItem: (index: number) => void;
    formDataMap: {[key: string]: ItemFormData};
    addons: Addon[];
    addonsMap?: {[key: string]: Addon[]};
    getPriceForQuantity?: (quantity: number, tourId: string) => number;
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
    voucherCode,
    setVoucherCode,
    voucherError,
    handleValidateVoucher,
    removeFromCart,
    selectedCartItemIndex,
    onSelectCartItem,
    formDataMap,
    addons,
    addonsMap,
    getPriceForQuantity,
}) => {
    const getItemKey = (item: { id: string }, index: number): string => `${item.id}_${index}`;
    
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        const date = new Date(year, month - 1, day);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };
    
    const calculateCartTotal = () => {
        return cart.reduce((total, tour, index) => {
            const itemKey = getItemKey(tour, index);
            const tourFormData = formDataMap[itemKey];
            const itemQuantity = tourFormData ? tourFormData.quantity : quantity;
            
            const itemPrice = getPriceForQuantity 
                ? getPriceForQuantity(itemQuantity, tour.id) 
                : tour.price;
                
            const itemTotal = itemPrice * itemQuantity;
            let addonTotal = 0;
            const tourSpecificAddons = addonsMap && addonsMap[itemKey] ? addonsMap[itemKey] : addons;
            if (tourFormData && tourFormData.selectedAddOns) {
                addonTotal = tourFormData.selectedAddOns.reduce((sum, selectedAddon) => {
                    const addonInfo = tourSpecificAddons.find(a => a.id === selectedAddon.addOnId);
                    if (!addonInfo) return sum;
                    
                    if (addonInfo.type === 'CHECKBOX' && selectedAddon.checked) {
                        return sum + addonInfo.price;
                    }
                    if (addonInfo.type === 'SELECT') {
                        return sum + (addonInfo.price * selectedAddon.quantity);
                    }
                    return sum;
                }, 0);
            } else {
                addonTotal = combinedAddons.reduce((sum, addon) => 
                    sum + (addon.price * (addon.quantity || 1)), 0);
            }
            let customItemsTotal = 0;
            if (isCustomLineItemsEnabled && customLineItems[itemKey]) {
                customItemsTotal = customLineItems[itemKey].reduce((sum, item) => {
                    const itemAmount = item.amount * item.quantity;
                    return item.type === "Discount" ? sum - itemAmount : sum + itemAmount;
                }, 0);
            }
            
            return total + itemTotal + addonTotal + customItemsTotal;
        }, 0);
    };
    
    const cartTotal = calculateCartTotal();
    const finalTotal = Math.max(cartTotal - voucherDiscount, 0);
    
    return (
        <>
            <VStack spacing={4} align="stretch" mb={4}>
                {cart.map((tour, index) => {
                    const itemKey = getItemKey(tour, index);
                    const tourFormData = formDataMap[itemKey];
                    const itemQuantity = tourFormData ? tourFormData.quantity : quantity;
                    const itemDate = tourFormData ? tourFormData.date : date;
                    const itemTime = tourFormData ? tourFormData.time : time;
                    const tourSpecificAddons = addonsMap && addonsMap[itemKey] ? addonsMap[itemKey] : addons;
                    
                    const itemPrice = getPriceForQuantity 
                        ? getPriceForQuantity(itemQuantity, tour.id) 
                        : tour.price;
                    
                    const itemTotal = itemPrice * itemQuantity;
                    return (
                        <Box 
                            key={`tour_${tour.id}_${index}`}
                            bg={selectedCartItemIndex === index ? "blue.100" : "blue.50"}
                            p={4} 
                            borderRadius="md" 
                            w="120%" 
                            ml="-10%"
                            position="relative"
                            cursor="pointer"
                            onClick={() => onSelectCartItem(index)}
                            _hover={{ bg: "blue.100" }}
                            borderWidth={selectedCartItemIndex === index ? "2px" : "0"}
                            borderStyle="solid"
                            borderColor={selectedCartItemIndex === index ? "blue.500" : "transparent"}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromCart(index);
                                }}
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
                                {formatDate(itemDate)} - {itemTime}
                            </Text>
                            <HStack justify="space-between">
                                <Text mt={2}>
                                    Guests (${itemPrice.toFixed(2)} × {itemQuantity})
                                </Text>
                                <Text>
                                    ${itemTotal.toFixed(2)}
                                </Text>
                            </HStack>
                            {tourFormData && tourFormData.selectedAddOns && tourFormData.selectedAddOns.length > 0 ? (
                                tourFormData.selectedAddOns
                                    .filter(addon => addon.checked || addon.quantity > 0)
                                    .map((selectedAddon) => {
                                        const addonInfo = tourSpecificAddons.find(a => a.id === selectedAddon.addOnId);
                                        if (!addonInfo) return null;
                                        
                                        const quantity = addonInfo.type === 'CHECKBOX' ? 1 : selectedAddon.quantity;
                                        const price = addonInfo.price;
                                        
                                        return (
                                            <HStack key={`${selectedAddon.addOnId}_${index}`} justifyContent="space-between">
                                                <Text>
                                                    {addonInfo.label} (${price.toFixed(2)} {quantity > 1 ? `× ${quantity}` : ''})
                                                </Text>
                                                <Text>
                                                    ${(price * quantity).toFixed(2)}
                                                </Text>
                                            </HStack>
                                        );
                                    })
                            ) : (
                                <>
                                    {combinedAddons.length > 0 ? (
                                        combinedAddons.map((addon) => (
                                            <HStack key={`${addon.id}_${index}`} justifyContent="space-between">
                                                <Text>
                                                    {addon.label} (${addon.price.toFixed(2)} {(addon.quantity || 0) > 1 ? `× ${addon.quantity}` : ''})
                                                </Text>
                                                <Text>
                                                    ${(addon.price * (addon.quantity || 1)).toFixed(2)}
                                                </Text>
                                            </HStack>
                                        ))
                                    ) : (
                                        <Text fontSize="sm" color="gray.500">No add-ons selected</Text>
                                    )}
                                </>
                            )}
                            
                            {isCustomLineItemsEnabled && customLineItems[itemKey] && customLineItems[itemKey].length > 0 && (
                                customLineItems[itemKey].map(item => {
                                    const itemAmount = item.amount * item.quantity;
                                    return (
                                        <HStack key={`${item.id}_${index}`} justify="space-between">
                                            <Text>
                                                {item.name || 'Custom item'} ({item.type === 'Discount' ? '-' : ''}${item.amount.toFixed(2)} × {item.quantity})
                                            </Text>
                                            <Text>
                                                {item.type === 'Discount' ? '-' : ''}${itemAmount.toFixed(2)}
                                            </Text>
                                        </HStack>
                                    );
                                })
                            )}
                        </Box>
                    );
                })}
            </VStack>
            
            <Divider mb={4} />
            
            <HStack justify="space-between" mb={2}>
                <Text>Subtotal:</Text>
                <Text fontWeight="medium">${cartTotal.toFixed(2)}</Text>
            </HStack>
            
            {voucherDiscount > 0 && (
                <HStack justify="space-between" mb={2}>
                    <Text>Voucher Discount:</Text>
                    <Text fontWeight="medium" color="green.500">-${voucherDiscount.toFixed(2)}</Text>
                </HStack>
            )}
            
            <HStack justify="space-between" mb={4}>
                <Text fontWeight="bold">Total:</Text>
                <Text fontWeight="bold" fontSize="lg">${finalTotal.toFixed(2)}</Text>
            </HStack>
            
            <Divider mb={4} />
            
            <Box>
                <FormControl mb={2}>
                    <FormLabel fontSize="sm">Apply Voucher</FormLabel>
                    <HStack>
                        <Input 
                            placeholder="Enter voucher code"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                        />
                        <Button 
                            onClick={handleValidateVoucher}
                            isDisabled={!voucherCode}
                        >
                            Apply
                        </Button>
                    </HStack>
                </FormControl>
                {voucherError && (
                    <Text color="red.500" fontSize="sm" mb={4}>
                        {voucherError}
                    </Text>
                )}
            </Box>
        </>
    );
};

export default PurchaseSummary;