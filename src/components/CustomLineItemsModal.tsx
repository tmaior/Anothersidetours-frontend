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
    InputLeftElement
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
    const toast = useToast();

    useEffect(() => {
        if (quantity) {
            setCurrentQuantity(quantity);
        }
    }, [quantity]);

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
            }
        }
    }, [isOpen, initialItems, quantity, reservationId]);

    const fetchPendingTransactions = async () => {
        if (!reservationId) return;
        
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${reservationId}`,
                { params: { payment_status: 'pending' } }
            );
            
            if (response.data && response.data.length > 0) {
                const totalPending = response.data.reduce(
                    (sum, transaction) => sum + transaction.amount, 
                    0
                );
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

    const calculateTotal = () => {
        const numericBasePrice = Number(basePrice) || 0;
        const numericQuantity = Number(currentQuantity) || 0;
        const baseTotal = numericQuantity * numericBasePrice;
        
        const lineItemsTotal = items.reduce((acc, item) => {
            if (!item.name && item.amount === 0) return acc;
            const totalItem = item.amount * item.quantity;
            return item.type === "Discount" ? acc - totalItem : acc + totalItem;
        }, 0);
        
        return (baseTotal + lineItemsTotal).toFixed(2);
    };

    const currentTotal = parseFloat(calculateTotal());
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay/>
            <ModalContent maxW="800px">
                <ModalHeader>Custom Line Items</ModalHeader>
                <ModalCloseButton/>

                <ModalBody>
                    <Flex gap={4}>
                        <Box flex="1" maxH="300px" overflowY="auto" pr={2}>
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

                        <Box 
                            flex="1" 
                            bg="gray.50" 
                            p={4} 
                            borderRadius="md" 
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                            h="300px"
                        >
                            <Text fontWeight="bold" mb={4}>Purchase Summary</Text>
                            
                            <HStack justify="space-between" mb={3}>
                                <Text>Guests (${Number(basePrice).toFixed(2)} × {currentQuantity})</Text>
                                <Text fontWeight="semibold">${(Number(basePrice) * currentQuantity).toFixed(2)}</Text>
                            </HStack>
                            
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
                            
                            <Box mt="auto">
                                <Divider my={4} />
                                <Flex justify="space-between">
                                    <Text fontWeight="bold" fontSize="lg">Total:</Text>
                                    <Text fontWeight="bold" fontSize="lg">${calculateTotal()}</Text>
                                </Flex>
                                
                                {!isLoadingPendingBalance && finalBalanceDue > 0 && (
                                    <Flex justify="space-between" mt={2}>
                                        <Text fontWeight="bold" color="red.500">Balance Due:</Text>
                                        <Text fontWeight="bold" color="red.500">${finalBalanceDue.toFixed(2)}</Text>
                                    </Flex>
                                )}
                                
                                {!isLoadingPendingBalance && finalRefundAmount > 0 && (
                                    <Flex justify="space-between" mt={2}>
                                        <Text fontWeight="bold" color="green.500">Refund:</Text>
                                        <Text fontWeight="bold" color="green.500">${finalRefundAmount.toFixed(2)}</Text>
                                    </Flex>
                                )}
                            </Box>
                        </Box>
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