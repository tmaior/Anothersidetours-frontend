import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Box,
    Text,
    Input,
    VStack,
    HStack,
    Image,
    Checkbox,
    Select,
    Textarea,
    CloseButton,
    Flex,
    useToast,
} from '@chakra-ui/react';
import { FaRegCreditCard } from 'react-icons/fa';
import { BsCash, BsCheck2 } from 'react-icons/bs';
import { LineItem } from './CustomLineItemsModal';

interface CardDetails {
    id: string;
    brand: string;
    last4: string;
    paymentDate: string;
}

interface ReturnPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: {
        id: string;
        title: string;
        imageUrl?: string;
        dateFormatted: string;
        time: string;
        user: {
            name: string;
        };
        total_price: number;
        setupIntentId?: string;
        paymentMethodId?: string;
        paymentIntentId?: string;
        guestQuantity?: number;
        tour?: {
            id?: string;
            price?: number;
        };
        valuePerGuest?: number;
        PaymentTransaction?: {
            paymentIntentId?: string;
            stripe_payment_id?: string;
            paymentMethodId?: string;
        }[];
    };
    refundAmount?: number;
    customLineItems?: LineItem[];
}

const ReturnPaymentModal: React.FC<ReturnPaymentModalProps> = ({
    isOpen,
    onClose,
    booking,
    refundAmount,
    customLineItems = []
}) => {
    const toast = useToast();
    const [amount, setAmount] = useState(refundAmount || booking?.total_price || 0);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [comment, setComment] = useState('');
    const [cardList, setCardList] = useState<CardDetails[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchedCustomItems, setFetchedCustomItems] = useState<LineItem[]>([]);
    const [isLoadingCustomItems, setIsLoadingCustomItems] = useState(false);
    const [hasOriginalCardPayment, setHasOriginalCardPayment] = useState(false);
    const [pendingBalance, setPendingBalance] = useState<number>(0);
    const [isLoadingPendingBalance, setIsLoadingPendingBalance] = useState<boolean>(true);
    const [reservationAddons, setReservationAddons] = useState([]);
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState<boolean>(true);
    const [tierPricing, setTierPricing] = useState(null);
    const [isLoadingTierPricing, setIsLoadingTierPricing] = useState<boolean>(true);
    const [tourId, setTourId] = useState<string | null>(null);
    const [isLoadingTourId, setIsLoadingTourId] = useState<boolean>(true);
    const [guestQuantity, setGuestQuantity] = useState<number>(0);
    const [guestPrice, setGuestPrice] = useState<number>(0);

    useEffect(() => {
        if (refundAmount) {
            setAmount(refundAmount);
        }
    }, [refundAmount]);

    useEffect(() => {
        if (isOpen && refundAmount) {
            setAmount(refundAmount);
        }
    }, [isOpen, refundAmount]);

    useEffect(() => {
        const fetchCustomLineItems = async () => {
            if (!booking?.id || !isOpen) return;

            setIsLoadingCustomItems(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/custom-items/reservation/${booking.id}`
                );

                const customItems = response.data.map(item => ({
                    id: item.id,
                    name: item.label,
                    type: item.description as 'Charge' | 'Discount',
                    amount: Number(item.amount),
                    quantity: Number(item.quantity)
                }));

                setFetchedCustomItems(customItems);
                console.log('Fetched custom items:', customItems);
            } catch (error) {
                console.error('Error fetching custom line items:', error);
            } finally {
                setIsLoadingCustomItems(false);
            }
        };

        fetchCustomLineItems();
    }, [booking?.id, isOpen]);

    useEffect(() => {
        const fetchCardsFromSetupIntent = async () => {
            console.log('Full booking object:', booking);
            console.log('Important booking fields:', {
                id: booking?.id,
                paymentIntentId: booking?.paymentIntentId,
                paymentMethodId: booking?.paymentMethodId,
                setupIntentId: booking?.setupIntentId
            });
            
            setIsLoading(true);
            
            try {
                if (booking?.id) {
                    const transactionsResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`
                    );
                    const createTransaction = transactionsResponse.data?.find(
                        (t: any) => t.transaction_type === 'CREATE' && 
                        (t.payment_method?.toLowerCase() === 'credit card' || 
                         t.payment_method?.toLowerCase() === 'card')
                    );
                    
                    if (createTransaction) {
                        setHasOriginalCardPayment(true);
                        setPaymentMethod('credit_card');
                        const paymentMethodId = booking.paymentMethodId || 
                                               createTransaction.payment_method_id ||
                                               createTransaction.paymentMethodId;
                        if (paymentMethodId) {
                            const response = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${paymentMethodId}`
                            );
                            if (response.data) {
                                const cardData: CardDetails = {
                                    id: paymentMethodId,
                                    brand: response.data.brand,
                                    last4: response.data.last4,
                                    paymentDate: response.data.paymentDate
                                };
                                
                                console.log('Card data formatted:', cardData);
                                setCardList([cardData]);
                                setSelectedCardId(cardData.id);
                            }
                        }
                    } else {
                        setHasOriginalCardPayment(false);
                        setPaymentMethod('cash');
                    }
                }
            } catch (error) {
                console.error('Error fetching payment details:', error);
                setHasOriginalCardPayment(false);
                setPaymentMethod('cash');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchCardsFromSetupIntent();
        }
    }, [booking?.id, booking?.paymentMethodId, isOpen, toast]);

    useEffect(() => {
        const fetchPendingTransactions = async () => {
            if (!booking?.id) return;
            
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
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
                }
            } catch (error) {
                console.error('Error fetching pending transactions:', error);
            } finally {
                setIsLoadingPendingBalance(false);
            }
        };
        
        if (isOpen) {
            fetchPendingTransactions();
        } else {
            setIsLoadingPendingBalance(false);
        }
    }, [booking?.id, isOpen]);

    useEffect(() => {
        const fetchReservationDetails = async () => {
            if (!booking?.id) return;
            
            setIsLoadingTourId(true);
            try {
                console.log("Fetching reservation details for:", booking.id);
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`
                );
                
                console.log("Reservation data:", response.data);
                
                if (response.data) {
                    if (response.data.tourId) {
                        setTourId(response.data.tourId);
                    } else if (response.data.tour_id) {
                        setTourId(response.data.tour_id);
                    }
                    if (response.data.guestQuantity) {
                        setGuestQuantity(response.data.guestQuantity);
                    } else {
                        setGuestQuantity(booking.guestQuantity || 3);
                    }
                    const guests = response.data.guestQuantity || booking.guestQuantity || 3;
                    const pricePerGuest = response.data.total_price / guests;
                    setGuestPrice(pricePerGuest);
                }
            } catch (error) {
                console.error('Error fetching reservation details:', error);
                setGuestQuantity(booking.guestQuantity || 3);
            } finally {
                setIsLoadingTourId(false);
            }
        };
        
        if (isOpen) {
            fetchReservationDetails();
        }
    }, [booking?.id, booking.guestQuantity, isOpen]);

    useEffect(() => {
        const fetchAddons = async () => {
            if (!booking?.id || !tourId) return;

            try {
                const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${tourId}`)
                ]);

                setAllAddons(allAddonsResponse.data);
                setReservationAddons(reservationAddonsResponse.data);
            } catch (error) {
                console.error('Error fetching add-ons:', error);
            } finally {
                setIsLoadingAddons(false);
            }
        };

        if (isOpen && !isLoadingTourId) {
            setIsLoadingAddons(true);
            fetchAddons();
        } else if (!isOpen) {
            setIsLoadingAddons(false);
        }
    }, [booking?.id, tourId, isOpen, isLoadingTourId]);

    useEffect(() => {
        const fetchTierPricing = async () => {
            if (!tourId) return;

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${tourId}`
                );
                
                if (response.data && response.data.length > 0) {
                    setTierPricing({
                        pricingType: response.data[0].pricingType,
                        basePrice: response.data[0].basePrice,
                        tierEntries: response.data[0].tierEntries,
                    });
                }
            } catch (error) {
                console.error('Error fetching tier pricing:', error);
            } finally {
                setIsLoadingTierPricing(false);
            }
        };

        if (isOpen && !isLoadingTourId) {
            setIsLoadingTierPricing(true);
            fetchTierPricing();
        } else if (!isOpen) {
            setIsLoadingTierPricing(false);
        }
    }, [tourId, isOpen, isLoadingTourId]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || value === undefined) {
            setAmount(0);
            return;
        }
        const cleanValue = value.replace(/[^\d.]/g, '');
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            return;
        }
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue)) {
            setAmount(0);
            return;
        }
        if (numValue > (booking?.total_price || 0)) {
            return;
        }
        setAmount(numValue);
    };

    const handleSaveChanges = async () => {
        console.log('Starting save changes...');
        console.log('Current booking state:', {
            id: booking?.id,
            paymentIntentId: booking?.paymentIntentId,
            paymentMethodId: booking?.paymentMethodId,
            setupIntentId: booking?.setupIntentId,
            total_price: booking?.total_price,
            refund_amount: amount
        });

        if (paymentMethod === 'credit_card' && !selectedCardId) {
            toast({
                title: 'Error',
                description: 'Please select a card for refund',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (paymentMethod === 'credit_card' && !hasOriginalCardPayment) {
            toast({
                title: 'Error',
                description: 'Cannot refund to credit card as the original payment was not made by card.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (amount <= 0 || amount > (booking?.total_price || 0)) {
            toast({
                title: 'Error',
                description: 'Invalid refund amount. Please enter a value between 0 and the total price.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            if (paymentMethod === 'credit_card') {
                const paymentIntentId = booking.PaymentTransaction?.[0]?.paymentIntentId || 
                                    booking.PaymentTransaction?.[0]?.stripe_payment_id || 
                                    booking.paymentIntentId;
                const paymentMethodId = booking.PaymentTransaction?.[0]?.paymentMethodId || 
                                    booking.paymentMethodId;

                const refundPayload = {
                    paymentIntentId: paymentIntentId,
                    paymentMethodId: selectedCardId || paymentMethodId,
                    amount: Math.round(amount * 100)
                };

                if (!refundPayload.paymentIntentId || refundPayload.paymentIntentId.trim() === '') {
                    throw new Error('Payment Intent ID cannot be empty');
                }

                if (refundPayload.paymentIntentId.startsWith('seti_')) {
                    throw new Error('Invalid Payment Intent ID. A setup intent cannot be used for refunds.');
                }
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/refund`,
                    refundPayload,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                    {
                        tenant_id: booking.id.split('-')[1],
                        reservation_id: booking.id,
                        amount: amount,
                        payment_status: 'completed',
                        payment_method: paymentMethod,
                        transaction_type: 'REFUND',
                        transaction_direction: 'refund',
                        metadata: {
                            comment: comment,
                            notifyCustomer: notifyCustomer,
                            refundDate: new Date().toISOString()
                        }
                    }
                );
            }

            toast({
                title: 'Success',
                description: `Refund of $${amount.toFixed(2)} processed successfully!`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onClose();
        } catch (error: any) {
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                paymentIntentId: booking?.paymentIntentId,
                setupIntentId: booking?.setupIntentId,
                PaymentTransaction: booking?.PaymentTransaction,
                refundAmount: amount
            });

            const errorMessage = error.response?.data?.message || 'Failed to process refund';
            toast({
                title: 'Error',
                description: errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const displayedCustomItems = fetchedCustomItems.length > 0 ? fetchedCustomItems : customLineItems;

    const getCombinedAddons = () => {
        let combinedAddons = [];

        combinedAddons = allAddons.reduce((acc, addon) => {
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

        return combinedAddons;
    };

    const calculateGuestPrice = () => {
        if (!tierPricing) {
            return guestPrice * guestQuantity;
        }

        if (tierPricing.pricingType === 'flat') {
            return tierPricing.basePrice * guestQuantity;
        }

        const applicableTierEntry = tierPricing.tierEntries
            ?.sort((a, b) => b.quantity - a.quantity)
            .find(tier => guestQuantity >= tier.quantity);

        if (applicableTierEntry) {
            return applicableTierEntry.price * guestQuantity;
        } else {
            return tierPricing.basePrice * guestQuantity;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <ModalOverlay />
            <ModalContent maxW="1000px">
                <ModalHeader>
                    Return Payment Only
                    <CloseButton
                        position="absolute"
                        right="8px"
                        top="8px"
                        onClick={onClose}
                    />
                </ModalHeader>
                <ModalBody>
                    <Flex gap={6}>
                        <Box flex="1">
                            <Box bg="gray.50" p={4} borderRadius="md" mb={4}>
                                <Text fontWeight="bold">{booking?.user?.name}</Text>
                                <HStack mt={2}>
                                    <Image
                                        src={booking?.imageUrl || "https://via.placeholder.com/80"}
                                        alt={booking?.title}
                                        boxSize="80px"
                                        objectFit="cover"
                                        borderRadius="md"
                                    />
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="semibold">{booking?.title}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            {booking?.dateFormatted} {booking?.time}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>

                            <VStack spacing={4} align="stretch">
                                <Box>
                                    <Text mb={2}>Amount</Text>
                                    <Input
                                        value={amount}
                                        onChange={handleAmountChange}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={booking?.total_price}
                                        placeholder="Enter amount"
                                    />
                                    <Text fontSize="sm" color="gray.600" mt={1}>
                                        up to ${booking?.total_price}
                                    </Text>
                                </Box>

                                <Box>
                                    <Text mb={2}>Payment Method</Text>
                                    <HStack spacing={2}>
                                        {hasOriginalCardPayment && (
                                            <Button
                                                leftIcon={<FaRegCreditCard />}
                                                variant={paymentMethod === 'credit_card' ? 'solid' : 'outline'}
                                                onClick={() => setPaymentMethod('credit_card')}
                                            >
                                                Credit Card
                                            </Button>
                                        )}
                                        <Button
                                            leftIcon={<BsCash />}
                                            variant={paymentMethod === 'cash' ? 'solid' : 'outline'}
                                            onClick={() => setPaymentMethod('cash')}
                                        >
                                            Cash
                                        </Button>
                                        <Button
                                            leftIcon={<BsCheck2 />}
                                            variant={paymentMethod === 'store_credit' ? 'solid' : 'outline'}
                                            onClick={() => setPaymentMethod('store_credit')}
                                        >
                                            Store Credit
                                        </Button>
                                        <Button
                                            leftIcon={<BsCheck2 />}
                                            variant={paymentMethod === 'other' ? 'solid' : 'outline'}
                                            onClick={() => setPaymentMethod('other')}
                                        >
                                            Other
                                        </Button>
                                    </HStack>
                                </Box>

                                {paymentMethod === 'credit_card' && hasOriginalCardPayment && (
                                    <Box>
                                        <Text mb={2}>Credit Card</Text>
                                        {isLoading ? (
                                            <HStack spacing={2} py={2}>
                                                <Text>Loading card information...</Text>
                                            </HStack>
                                        ) : cardList.length > 0 ? (
                                            <Box p={3} borderWidth="1px" borderRadius="md">
                                                <HStack>
                                                    <FaRegCreditCard />
                                                    <Text>
                                                        {cardList[0].brand.charAt(0).toUpperCase() + cardList[0].brand.slice(1)} •••• •••• •••• {cardList[0].last4}
                                                    </Text>
                                                </HStack>
                                            </Box>
                                        ) : (
                                            <Text color="red.500">No card information found</Text>
                                        )}
                                    </Box>
                                )}

                                <Box>
                                    <Text mb={2}>Reason</Text>
                                    <Select defaultValue="return_payment">
                                        <option value="reduce_booking">Reduce Booking Value and Return Payment</option>
                                        <option value="return_payment">Return Payment Only</option>
                                        <option value="change_guest">Change Guest Quantity</option>
                                    </Select>
                                </Box>

                                <Box>
                                    <Text mb={2}>Comment</Text>
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add a comment..."
                                    />
                                </Box>
                            </VStack>
                        </Box>

                        <Box flex="1" bg="gray.50" p={6} borderRadius="md">
                            <VStack spacing={6} align="stretch">
                                <Box>
                                    <Text fontWeight="bold" mb={3}>Purchase Summary</Text>
                                    {isLoadingTierPricing || isLoadingAddons || isLoadingTourId ? (
                                        <Text fontSize="sm" color="gray.500">Loading...</Text>
                                    ) : (
                                        <>
                                            <HStack justify="space-between">
                                                <Text>
                                                    {`Guests ($${(tierPricing && tierPricing.pricingType === 'flat' ? tierPricing.basePrice : guestPrice).toFixed(2)} × ${guestQuantity})`}
                                                </Text>
                                                <Text>${calculateGuestPrice().toFixed(2)}</Text>
                                            </HStack>

                                            {getCombinedAddons().length > 0 ? (
                                                getCombinedAddons().map((addon) => (
                                                    <HStack key={addon.id} justify="space-between">
                                                        <Text>{addon.label || addon.name} (${addon.price.toFixed(2)} x {addon.quantity})</Text>
                                                        <Text>${(addon.price * addon.quantity).toFixed(2)}</Text>
                                                    </HStack>
                                                ))
                                            ) : null}

                                            {displayedCustomItems && displayedCustomItems.length > 0 && (
                                                <>
                                                    {displayedCustomItems.map((item) => (
                                                        <HStack key={item.id} justify="space-between">
                                                            <Text>
                                                                {item.name} (${item.amount.toFixed(2)} × {item.quantity})
                                                                {item.type === 'Discount' && ' - Discount'}
                                                            </Text>
                                                            <Text>
                                                                {item.type === 'Discount' ? '-' : ''}
                                                                ${(item.amount * item.quantity).toFixed(2)}
                                                            </Text>
                                                        </HStack>
                                                    ))}
                                                </>
                                            )}
                                            
                                            <HStack justify="space-between" mt={2}>
                                                <Text fontWeight="bold">Total</Text>
                                                <Text fontWeight="bold">${booking?.total_price}</Text>
                                            </HStack>

                                            {!isLoadingPendingBalance && pendingBalance !== 0 && (
                                                <HStack justify="space-between" mt={2} color={pendingBalance > 0 ? "red.500" : "green.500"}>
                                                    <Text fontWeight="semibold">
                                                        {pendingBalance < 0 ? "Refund Due" : "Balance Due"}
                                                    </Text>
                                                    <Text fontWeight="semibold">
                                                        ${Math.abs(pendingBalance).toFixed(2)}
                                                    </Text>
                                                </HStack>
                                            )}
                                        </>
                                    )}
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={3}>Payment Summary</Text>
                                    <VStack align="stretch" spacing={2}>
                                        {cardList.length > 0 && (
                                            <>
                                                <HStack justify="space-between">
                                                    <Text>
                                                        Payment *{cardList[0].last4} {formatDate(cardList[0].paymentDate)}
                                                    </Text>
                                                    <Text>${booking?.total_price}</Text>
                                                </HStack>
                                            </>
                                        )}
                                    </VStack>
                                    
                                    {(refundAmount !== undefined && amount < refundAmount) ? (
                                        <>
                                            <HStack justify="space-between" color="blue.500">
                                                <Text>
                                                    Return Payment {formatDate(new Date().toISOString())} *{cardList[0]?.last4}
                                                </Text>
                                                <Text>-${amount.toFixed(2)}</Text>
                                            </HStack>
                                            <HStack justify="space-between" mt={4} color="green.500">
                                                <Text fontWeight="bold" fontSize="lg">Refund</Text>
                                                <Text fontWeight="bold" fontSize="lg">${(refundAmount - amount).toFixed(2)}</Text>
                                            </HStack>
                                        </>
                                    ) : (
                                        <HStack justify="space-between" mt={2} color="blue.500">
                                            <Text fontSize="sm">
                                                Return Payment {formatDate(new Date().toISOString())}
                                            </Text>
                                            <Text fontSize="sm">-${amount.toFixed(2)}</Text>
                                        </HStack>
                                    )}
                                    
                                    <HStack justify="space-between" mt={4}>
                                        <Text fontWeight="bold">Paid</Text>
                                        <Text fontWeight="bold">${(booking?.total_price - (refundAmount || 0)).toFixed(2)}</Text>
                                    </HStack>
                                </Box>
                            </VStack>
                        </Box>
                    </Flex>
                </ModalBody>

                <ModalFooter borderTopWidth={1} borderColor="gray.200">
                    <HStack spacing={4}>
                        <Checkbox
                            isChecked={notifyCustomer}
                            onChange={(e) => setNotifyCustomer(e.target.checked)}
                        >
                            Notify Customer
                        </Checkbox>
                        <Button variant="ghost" onClick={onClose}>Skip</Button>
                        <Button 
                            colorScheme="blue" 
                            onClick={handleSaveChanges}
                            isLoading={isLoading}
                        >
                            Save Changes
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReturnPaymentModal; 