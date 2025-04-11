import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Box,
    Flex,
    Text,
    HStack,
    Input,
    Select,
    IconButton,
    Divider,
    useToast,
    InputGroup,
    InputLeftElement,
    Spinner,
    VStack
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, MinusIcon } from '@chakra-ui/icons';
import axios from 'axios';

export interface LineItem {
    id: number | string;
    name: string;
    type: 'Charge' | 'Discount';
    amount: number;
    quantity: number;
}

interface Addon {
    id: string;
    label: string;
    price: number;
    type: 'SELECT' | 'CHECKBOX';
}

interface TierEntry {
    quantity: number;
    price: number;
}

interface TierPricing {
    pricingType: 'tiered' | 'flat';
    basePrice: number;
    tierEntries: TierEntry[];
}

interface CardDetails {
    last4: string;
    paymentDate: string;
}

interface CustomLineItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (items: LineItem[]) => void;
    initialItems?: LineItem[];
    basePrice?: number;
    quantity?: number;
    reservationId?: string;
}

const CustomLineItemsModal: React.FC<CustomLineItemsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialItems = [],
    basePrice = 0,
    quantity = 1,
    reservationId,
}) => {
    const [items, setItems] = useState<LineItem[]>([]);
    const [currentQuantity, setCurrentQuantity] = useState(quantity);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [isLoadingPendingBalance, setIsLoadingPendingBalance] = useState(true);
    const [originalTotal, setOriginalTotal] = useState(0);
    const [reservationAddons, setReservationAddons] = useState<{ addonId: string; value: string }[]>([]);
    const [allAddons, setAllAddons] = useState<Addon[]>([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(true);
    const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
    const [isLoadingCardDetails, setIsLoadingCardDetails] = useState(true);
    const [tierPricing, setTierPricing] = useState<TierPricing | null>(null);
    
    const toast = useToast();

    useEffect(() => {
        if (quantity) {
            setCurrentQuantity(quantity);
        }
    }, [quantity]);

    const fetchAddons = async () => {
        if (!reservationId) return;

        try {
            const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${reservationId}`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${reservationId.split('-')[0]}`)
            ]);

            setAllAddons(allAddonsResponse.data);
            setReservationAddons(reservationAddonsResponse.data);
        } catch (error) {
            console.error('Error fetching add-ons:', error);
        } finally {
            setIsLoadingAddons(false);
        }
    };

    const fetchCardDetails = async () => {
        if (!reservationId) {
            setIsLoadingCardDetails(false);
            return;
        }
        
        try {
            const reservationResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`
            );
            
            if (reservationResponse.data && reservationResponse.data.paymentMethodId) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${reservationResponse.data.paymentMethodId}`
                );
                setCardDetails(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch card details:", error);
        } finally {
            setIsLoadingCardDetails(false);
        }
    };

    const fetchPendingTransactions = async () => {
        if (!reservationId) return;
        
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${reservationId}`,
                { params: { payment_status: 'pending' } }
            );
            
            if (response.data && response.data.length > 0) {
                const filteredTransactions = response.data.filter(
                    transaction => transaction.transaction_type !== 'CREATE'
                );
                
                let totalPending = 0;
                
                for (const transaction of filteredTransactions) {
                    if (transaction.transaction_direction === 'refund') {
                        totalPending -= transaction.amount;
                    } else {
                        totalPending += transaction.amount;
                    }
                }
                
                setPendingBalance(totalPending);
            } else {
                setPendingBalance(0);
            }
        } catch (error) {
            console.error('Error fetching pending transactions:', error);
            setPendingBalance(0);
        } finally {
            setIsLoadingPendingBalance(false);
        }
    };

    const fetchTierPricing = async () => {
        if (!reservationId) return;

        try {
            const reservationResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`
            );
            
            if (reservationResponse.data && reservationResponse.data.tourId) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${reservationResponse.data.tourId}`
                );
                
                if (response.data && response.data.length > 0) {
                    setTierPricing({
                        pricingType: response.data[0].pricingType,
                        basePrice: response.data[0].basePrice,
                        tierEntries: response.data[0].tierEntries,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching tier pricing:', error);
        }
    };

    const fetchReservationTotal = async () => {
        if (!reservationId) return;
        
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`
            );
            
            if (response.data && response.data.total_price) {
                setOriginalTotal(response.data.total_price);
            }
        } catch (error) {
            console.error('Error fetching reservation total:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setItems(initialItems.length > 0 
                ? initialItems 
                : [{id: Date.now(), type: "Charge", amount: 0, quantity: 1, name: ""}]
            );
            setCurrentQuantity(quantity);

            if (reservationId) {
                fetchPendingTransactions();
                fetchReservationTotal();
                fetchAddons();
                fetchCardDetails();
                fetchTierPricing();
            }
        }
    }, [isOpen, initialItems, quantity, reservationId]);

    const addItem = () => {
        setItems([...items, {id: Date.now(), type: "Charge", amount: 0, quantity: 1, name: ""}]);
    };

    const removeItem = async (id) => {
        const isExistingItem = typeof id === 'string';
        
        if (isExistingItem && reservationId) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/custom-items/item/${id}`);
                toast({
                    title: "Item removed successfully",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error removing item:", error);
                toast({
                    title: "Error removing item",
                    description: "Could not remove item. Please try again.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
        setItems(items.filter((item) => item.id !== id));
    };

    const updateItem = (id, field, value) => {
        setItems(items.map((item) => (item.id === id ? {...item, [field]: value} : item)));
    };

    const handleSaveLineItems = async () => {
        if (finalRefundAmount > 0 && reservationId) {
            try {
                const reservationResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`
                );
                
                if (reservationResponse.data && reservationResponse.data.tenantId) {
                    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                        tenant_id: reservationResponse.data.tenantId,
                        reservation_id: reservationId,
                        amount: finalRefundAmount,
                        payment_status: 'pending',
                        transaction_type: 'REFUND',
                        transaction_direction: 'refund',
                        metadata: {
                            refundReason: 'Custom line items discount',
                            createdAt: new Date().toISOString()
                        }
                    });
                    
                    toast({
                        title: "Refund transaction created",
                        description: `A refund of $${finalRefundAmount.toFixed(2)} has been created.`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            } catch (error) {
                console.error("Error creating refund transaction:", error);
                toast({
                    title: "Error",
                    description: "Failed to create refund transaction. Line items will still be saved.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        onSave(items);
        onClose();
    };

    let combinedAddons: (Addon & { quantity: number })[] = [];
    combinedAddons = allAddons.reduce((acc: (Addon & { quantity: number })[], addon) => {
        const selectedAddon = reservationAddons.find(resAddon => resAddon.addonId === addon.id);
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

    const addonsTotalPrice = combinedAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity),
        0
    );

    const calculateGuestPrice = () => {
        if (!tierPricing) {
            return (basePrice) * currentQuantity;
        }

        if (tierPricing.pricingType === 'flat') {
            return tierPricing.basePrice * currentQuantity;
        }

        const applicableTier = tierPricing.tierEntries
            .sort((a, b) => b.quantity - a.quantity)
            .find(tier => currentQuantity >= tier.quantity);

        return applicableTier 
            ? applicableTier.price * currentQuantity
            : tierPricing.basePrice * currentQuantity;
    };

    const guestTotalPrice = calculateGuestPrice();

    const lineItemsTotal = items.reduce((acc, item) => {
        if (!item.name && item.amount === 0) return acc;
        const totalItem = item.amount * item.quantity;
        return item.type === "Discount" ? acc - totalItem : acc + totalItem;
    }, 0);

    const finalTotalPrice = guestTotalPrice + addonsTotalPrice + lineItemsTotal;
    
    const totalPaidSoFar = originalTotal - pendingBalance;
    const currentTotal = parseFloat(finalTotalPrice.toFixed(2));
    const rawDifference = currentTotal - originalTotal;
    
    const isRefund = rawDifference < 0;
    
    const additionalBalance = !isRefund ? Math.max(0, rawDifference) : 0;
    const refundAmount = isRefund ? Math.abs(rawDifference) : 0;
    
    let finalBalanceDue = 0;
    let finalRefundAmount = 0;
    
    if (pendingBalance > 0 && isRefund) {
        if (refundAmount <= pendingBalance) {
            finalBalanceDue = pendingBalance - refundAmount;
        } else {
            finalRefundAmount = refundAmount - pendingBalance;
        }
    } else if (pendingBalance > 0) {
        finalBalanceDue = pendingBalance + additionalBalance;
    } else if (isRefund) {
        finalRefundAmount = refundAmount;
    } else {
        finalBalanceDue = additionalBalance;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    };

    function formatDateToAmerican(date) {
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year}`;
    }

    const isLoading = isLoadingAddons || isLoadingCardDetails || isLoadingPendingBalance;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay/>
            <ModalContent maxW="800px">
                <ModalHeader>Custom Line Items</ModalHeader>
                <ModalCloseButton/>

                <ModalBody>
                    <Flex gap={4}>
                        <Box flex="1.5" maxH="400px" overflowY="auto" pr={2}>
                            {items.map((item) => (
                                <Box key={item.id} pb={4} mb={4} borderBottom="1px solid" borderColor="gray.100">
                                    <Flex align="center" mb={2}>
                                        <Input
                                            placeholder="Item"
                                            value={item.name}
                                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                            mr={2}
                                            size="md"
                                        />
                                        <IconButton
                                            icon={<DeleteIcon />}
                                            colorScheme="gray"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(item.id)}
                                            aria-label="Delete item"
                                        />
                                    </Flex>
                                    <Flex align="center" justify="space-between">
                                        <Select
                                            value={item.type}
                                            onChange={(e) => updateItem(item.id, "type", e.target.value as 'Charge' | 'Discount')}
                                            width="150px"
                                            size="md"
                                        >
                                            <option value="Charge">Charge</option>
                                            <option value="Discount">Discount</option>
                                        </Select>
                                        
                                        <InputGroup width="120px" ml={2}>
                                            <InputLeftElement pointerEvents="none">
                                                <Text color="gray.500">$</Text>
                                            </InputLeftElement>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={item.amount === 0 ? '' : item.amount}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    updateItem(item.id, "amount", value === '' ? 0 : parseFloat(value));
                                                }}
                                                size="md"
                                            />
                                        </InputGroup>
                                        
                                        <Flex align="center" ml={2}>
                                            <IconButton
                                                icon={<MinusIcon />}
                                                size="sm"
                                                onClick={() => updateItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                                                aria-label="Decrease quantity"
                                                variant="outline"
                                            />
                                            <Text mx={2}>{item.quantity}</Text>
                                            <IconButton
                                                icon={<AddIcon />}
                                                size="sm"
                                                onClick={() => updateItem(item.id, "quantity", item.quantity + 1)}
                                                aria-label="Increase quantity"
                                                variant="outline"
                                            />
                                        </Flex>
                                    </Flex>
                                </Box>
                            ))}
                        </Box>

                        {isLoading ? (
                            <VStack
                                bg="gray.50"
                                p={4}
                                borderRadius="md"
                                borderWidth="1px"
                                flex="1"
                                spacing={4}
                                align="stretch"
                                w="100%"
                                h="320px"
                                minW="250px"
                                maxW="400px"
                            >
                                <HStack justifyContent="center">
                                    <Spinner size="sm"/>
                                    <Text>Loading...</Text>
                                </HStack>
                            </VStack>
                        ) : (
                            <VStack
                                bg="gray.50"
                                p={4}
                                borderRadius="md"
                                borderWidth="1px"
                                flex="1"
                                spacing={4}
                                align="stretch"
                                w="100%"
                                h="320px"
                                minW="250px"
                                maxW="400px"
                                overflowY="auto"
                            >
                                <Box padding="8px" w="100%">
                                    <Text fontWeight="bold" mb={2}>
                                        Purchase Summary
                                    </Text>
                                    <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between">
                                            <Text>
                                                {`Guests ($${(guestTotalPrice / currentQuantity).toFixed(2)} × ${currentQuantity})`}
                                            </Text>
                                            <Text>${guestTotalPrice.toFixed(2)}</Text>
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
                                    
                                    {items.map((item) => {
                                        if (!item.name && item.amount === 0) return null;
                                        const totalItem = item.amount * item.quantity;
                                        return (
                                            <HStack key={item.id} justify="space-between" mb={2}>
                                                <Text>
                                                    {item.name || "Unnamed"} 
                                                    {item.type === "Discount" ? " (-" : " ("}
                                                    ${item.amount.toFixed(2)} × {item.quantity})
                                                </Text>
                                                <Text fontWeight="semibold">
                                                    {item.type === "Discount" ? "-" : ""}
                                                    ${totalItem.toFixed(2)}
                                                </Text>
                                            </HStack>
                                        );
                                    })}
                                    
                                    <Divider my={2}/>
                                    <HStack justify="space-between">
                                        <Text fontWeight="bold">Total</Text>
                                        <Text fontWeight="bold">${finalTotalPrice.toFixed(2)}</Text>
                                    </HStack>
                                    
                                    {finalBalanceDue !== 0 && (
                                        <HStack justify="space-between" mt={2}>
                                            <Text fontWeight="bold" color={finalBalanceDue < 0 ? "green.500" : "red.500"}>
                                                {finalBalanceDue < 0 ? "Refund Due" : "Balance Due"}
                                            </Text>
                                            <Text fontWeight="bold" color={finalBalanceDue < 0 ? "green.500" : "red.500"}>
                                                ${Math.abs(finalBalanceDue).toFixed(2)}
                                            </Text>
                                        </HStack>
                                    )}
                                    
                                    {finalRefundAmount !== 0 && (
                                        <HStack justify="space-between" mt={2}>
                                            <Text fontWeight="bold" color="green.500">
                                                Refund Due
                                            </Text>
                                            <Text fontWeight="bold" color="green.500">
                                                ${finalRefundAmount.toFixed(2)}
                                            </Text>
                                        </HStack>
                                    )}
                                </Box>
                                
                                {cardDetails && (
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>
                                            Payment Summary
                                        </Text>
                                        <VStack align="stretch" spacing={2}>
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
                                                        {formatDateToAmerican(formatDate(cardDetails.paymentDate))}
                                                    </Text>
                                                </HStack>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text>Paid</Text>
                                                <Text>${totalPaidSoFar.toFixed(2)}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                )}
                            </VStack>
                        )}
                    </Flex>
                </ModalBody>

                <ModalFooter>
                    <Button 
                        variant="outline" 
                        onClick={addItem} 
                        leftIcon={<AddIcon />}
                        mr={3}
                    >
                        Add Line Item
                    </Button>
                    <Button 
                        colorScheme="blue" 
                        onClick={handleSaveLineItems}
                    >
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CustomLineItemsModal; 