import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Badge,
    Box,
    Button,
    Checkbox,
    CloseButton,
    Divider,
    Flex,
    HStack,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    Select,
    Text,
    Textarea,
    useToast,
    VStack,
} from '@chakra-ui/react';
import {FaRegCreditCard} from 'react-icons/fa';
import {BsCash, BsCheck2} from 'react-icons/bs';
import {LineItem} from './CustomLineItemsModal';

interface RefundPayload {
    paymentIntentId?: string;
    paymentMethodId: string;
    amount: number;
    originalTransactionId: string;
    chargeId?: string;
}

interface CardDetails {
    id: string;
    brand: string;
    last4: string;
    paymentDate: string;
    transactionId?: string;
    amount?: number;
    refundableAmount?: number;
    refundedAmount?: number;
}

interface PaymentTransactionData {
    id: string;
    amount: number;
    payment_method?: string;
    payment_status: string;
    stripe_payment_id?: string;
    paymentMethodId?: string;
    paymentIntentId?: string;
    transaction_direction?: string;
    transaction_type?: string;
    created_at: string;
    metadata?: any;
    payment_details?: any;
    refundableAmount?: number;
    refundedAmount?: number;
    available_refund_amount?: number;
    cardDetails?: CardDetails;
    parent_transaction_id?: string;
    child_transactions?: PaymentTransactionData[];
    relatedRefunds?: PaymentTransactionData[];
    chargeId?: string;
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

const RefundHistorySection: React.FC<{
    refundHistory: PaymentTransactionData[];
    isLoading: boolean;
}> = ({refundHistory, isLoading}) => {
    if (isLoading) {
        return <Text fontSize="sm">Loading refund history...</Text>;
    }
    
    if (refundHistory.length === 0) {
        return null;
    }
    
    return (
        <Box mt={4} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
            <Text fontWeight="bold" mb={2}>Refund History</Text>
            <VStack spacing={1} align="stretch">
                {refundHistory.map((refund, idx) => (
                    <HStack key={idx} justify="space-between">
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm">
                                {refund.payment_method === 'credit_card' ? 'Credit Card' :
                                    refund.payment_method === 'store_credit' ? 'Store Credit' :
                                        refund.payment_method?.charAt(0).toUpperCase() + refund.payment_method?.slice(1) || 'Unknown'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {new Date(refund.created_at).toLocaleDateString('en-US', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </VStack>
                        <HStack>
                            {refund.metadata?.isPartial && (
                                <Badge colorScheme="blue" variant="subtle">Partial</Badge>
                            )}
                            <Text fontWeight="semibold" color="red.500">
                                -${refund.amount.toFixed(2)}
                            </Text>
                        </HStack>
                    </HStack>
                ))}
                <Divider my={1}/>
                <HStack justify="space-between">
                    <Text fontWeight="semibold">Total Refunded</Text>
                    <Text fontWeight="semibold" color="red.500">
                        ${refundHistory.reduce((total, r) => total + r.amount, 0).toFixed(2)}
                    </Text>
                </HStack>
            </VStack>
        </Box>
    );
};

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
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [generatedVoucher, setGeneratedVoucher] = useState<{ code: string, amount: number } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransactionData[]>([]);
    const [cardTransactions, setCardTransactions] = useState<PaymentTransactionData[]>([]);
    const [cardToTransactionMap, setCardToTransactionMap] = useState<Record<string, any[]>>({});
    const [isRefundPartial, setIsRefundPartial] = useState<boolean>(false);
    const [maxRefundableAmount, setMaxRefundableAmount] = useState<number>(0);
    const [balanceDue, setBalanceDue] = useState<number>(0);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransactionData | null>(null);
    const [refundHistory, setRefundHistory] = useState<PaymentTransactionData[]>([]);
    const [selectedCard, setSelectedCard] = useState<CardDetails | null>(null);

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
                    `${process.env.NEXT_PUBLIC_API_URL}/custom-items/reservation/${booking.id}`,
                    {
                        withCredentials: true,
                    }
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
                        `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                        {
                            withCredentials: true,
                        }
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
                                `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${paymentMethodId}`,
                                {
                                    withCredentials: true,
                                }
                            );
                            if (response.data) {
                                const cardData: CardDetails = {
                                    id: paymentMethodId,
                                    brand: response.data.brand,
                                    last4: response.data.last4,
                                    paymentDate: response.data.paymentDate
                                };
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
                    {
                        withCredentials: true
                        , params: {payment_status: 'pending'}
                    }
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
                    setPendingTransactions(filteredTransactions);
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
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                    {
                        withCredentials: true
                    }
                );

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
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`, {
                        withCredentials: true
                    }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${tourId}`, {
                        withCredentials: true
                    })
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
                    `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${tourId}`,
                    {
                        withCredentials: true
                    }
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

    useEffect(() => {
        if (isOpen) {
            const trueTotal = calculateTotalPrice();
            setAmount(trueTotal);
            console.log('Calculated Components:', {
                guestPrice: tierPricing && tierPricing.pricingType === 'flat' ? tierPricing.basePrice : guestPrice,
                guestQuantity,
                guestTotal: calculateGuestPrice(),
                addons: getCombinedAddons(),
                addonTotal: calculateAddonTotal(),
                customItems: fetchedCustomItems,
                customItemsTotal: calculateCustomItemsTotal(),
                totalCalculated: trueTotal
            });
        }
    }, [isOpen, tierPricing, reservationAddons, fetchedCustomItems, guestQuantity]);

    useEffect(() => {
        const fetchAllPaymentTransactions = async () => {
            if (!booking?.id || !isOpen) return;
            
            setIsLoadingTransactions(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                    {withCredentials: true}
                );
                
                if (!response.data || response.data.length === 0) {
                    setIsLoadingTransactions(false);
                    return;
                }
                
                const transactions = response.data;

                const chargeTransactions = transactions.filter(
                    (t: any) => t.transaction_direction === 'charge' &&
                        (t.payment_status === 'completed' || t.payment_status === 'paid')
                );

                const refundTransactions = transactions.filter(
                    (t: any) => t.transaction_direction === 'refund' &&
                        t.payment_status === 'completed'
                );

                setRefundHistory(refundTransactions);

                const creditCardTransactions = chargeTransactions.filter(
                    (t: any) => (t.payment_method?.toLowerCase().includes('card') ||
                            t.payment_method?.toLowerCase() === 'credit_card') &&
                        (t.paymentMethodId || t.paymentIntentId || t.setupIntentId)
                );

                const transactionsWithCardDetails = await Promise.all(creditCardTransactions.map(async (transaction: any) => {
                    let cardDetails = null;
                    const paymentMethodId = transaction.paymentMethodId;
                    
                    if (paymentMethodId) {
                        try {
                            const cardResponse = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${paymentMethodId}`,
                                {withCredentials: true}
                            );
                            
                            if (cardResponse.data) {
                                cardDetails = {
                                    id: paymentMethodId,
                                    brand: cardResponse.data.brand || 'Card',
                                    last4: cardResponse.data.last4 || '****',
                                    paymentDate: transaction.created_at,
                                    transactionId: transaction.id,
                                    amount: transaction.amount
                                };
                            }
                        } catch (err) {
                            console.error('Error fetching card details:', err);
                        }
                    }

                    const relatedRefunds = refundTransactions.filter(
                        (r: any) => r.metadata?.originalTransactionId === transaction.id ||
                            r.parent_transaction_id === transaction.id
                    );

                    const refundedAmount = transaction.refunded_amount ||
                        relatedRefunds.reduce((sum: number, refund: any) => sum + refund.amount, 0);
                    
                    let refundableAmount;
                    if (transaction.available_refund_amount !== undefined) {
                        refundableAmount = transaction.available_refund_amount;
                    } else if (refundedAmount === 0 && transaction.amount > 0) {
                        refundableAmount = transaction.amount;
                    } else {
                        refundableAmount = Math.max(0, transaction.amount - refundedAmount);
                    }
                    
                    return {
                        ...transaction,
                        cardDetails,
                        refundableAmount,
                        refundedAmount,
                        hasBeenRefunded: refundedAmount > 0,
                        fullyRefunded: refundableAmount === 0,
                        partiallyRefunded: refundedAmount > 0 && refundableAmount > 0,
                        relatedRefunds
                    };
                }));

                setCardTransactions(transactionsWithCardDetails);

                const cardToTransactionMap = {};
                transactionsWithCardDetails.forEach(tx => {
                    if (tx.cardDetails && tx.cardDetails.id) {
                        if (!cardToTransactionMap[tx.cardDetails.id]) {
                            cardToTransactionMap[tx.cardDetails.id] = [];
                        }
                        cardToTransactionMap[tx.cardDetails.id].push({
                            transactionId: tx.id,
                            paymentIntentId: tx.paymentIntentId || tx.stripe_payment_id,
                            amount: tx.amount,
                            refundableAmount: tx.refundableAmount || 0,
                            refundedAmount: tx.refundedAmount || 0
                        });
                    }
                });

                setCardToTransactionMap(cardToTransactionMap);

                const uniqueCardIds = new Set();
                const uniqueCards = [];
                
                for (const tx of transactionsWithCardDetails) {
                    if (tx.cardDetails && !uniqueCardIds.has(tx.cardDetails.id)) {
                        uniqueCardIds.add(tx.cardDetails.id);

                        const cardTransactions = transactionsWithCardDetails.filter(
                            t => t.cardDetails?.id === tx.cardDetails.id
                        );
                        
                        const totalAmount = cardTransactions.reduce(
                            (sum, t) => sum + t.amount, 0
                        );
                        
                        const totalRefundable = cardTransactions.reduce(
                            (sum, t) => sum + (t.refundableAmount || 0), 0
                        );

                        const totalRefunded = cardTransactions.reduce(
                            (sum, t) => sum + (t.refundedAmount || 0), 0
                        );
                        
                        uniqueCards.push({
                            ...tx.cardDetails,
                            amount: totalAmount,
                            refundableAmount: totalRefundable > 0 ? totalRefundable : totalAmount,
                            refundedAmount: totalRefunded
                        });
                    }
                }
                
                if (uniqueCards.length > 0) {
                    setCardList(uniqueCards);
                    setSelectedCardId(uniqueCards[0].id);
                    setHasOriginalCardPayment(true);
                    setPaymentMethod('credit_card');

                    const totalRefundable = transactionsWithCardDetails.reduce(
                        (sum, t) => sum + (t.refundableAmount || 0), 0
                    );
                    setMaxRefundableAmount(totalRefundable > 0 ? totalRefundable : transactionsWithCardDetails.reduce((sum, t) => sum + t.amount, 0));

                    const firstCardTransactions = transactionsWithCardDetails.filter(
                        t => t.cardDetails?.id === uniqueCards[0].id
                    );
                    if (firstCardTransactions.length > 0) {
                        setSelectedTransaction(firstCardTransactions[0]);
                    }
                }
                
                setPaymentTransactions(transactions);
            } catch (error) {
                console.error('Error fetching payment transactions:', error);
            } finally {
                setIsLoadingTransactions(false);
            }
        };
        
        if (isOpen) {
            fetchAllPaymentTransactions();
        }
    }, [booking?.id, isOpen]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        if (inputValue === '') {
            setAmount(0);
            return;
        }
        const cleanValue = inputValue.replace(/[^\d.]/g, '');
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            return;
        }
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue)) {
            setAmount(0);
            return;
        }

        let maxValue = calculateTotalPrice();
        
        if (paymentMethod === 'credit_card' && selectedCard) {
            maxValue = Math.min(maxValue, selectedCard.refundableAmount || 0);
        } else if (paymentMethod === 'credit_card') {
            maxValue = Math.min(maxValue, maxRefundableAmount);
        }
        
        if (numValue > maxValue) {
            setAmount(maxValue);
            return;
        }
        
        setAmount(numValue);

        const isPartial = numValue < maxValue;
        setIsRefundPartial(isPartial);
        
        if (isPartial && !isRefundPartial && selectedCard) {
            const balanceAmount = selectedCard.refundableAmount - numValue;
            toast({
                title: 'Partial Refund Selected',
                description: `A balance due of $${balanceAmount.toFixed(2)} will be created after processing.`,
                status: 'info',
                duration: 4000,
                isClosable: true,
            });
        }
    };

    const handleSaveChanges = async () => {
        if (paymentMethod === 'credit_card' && !selectedCardId && cardList.length > 0) {
            toast({
                title: 'Attention',
                description: 'Select a card for refund or change payment method.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (paymentMethod === 'credit_card' && !hasOriginalCardPayment) {
            toast({
                title: 'Erro',
                description: 'Refunds cannot be made to a credit card as the original payment was not made by card.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        
        if (amount <= 0) {
            toast({
                title: 'Erro',
                description: 'The refund amount must be greater than zero.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const selectedCard = cardList.find(c => c.id === selectedCardId);
        if (paymentMethod === 'credit_card' && selectedCard && amount > selectedCard.refundableAmount) {
            toast({
                title: 'Erro',
                description: `The amount exceeds the maximum available for reimbursement $${selectedCard.refundableAmount.toFixed(2)}.`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        let tenantId = '';
        try {
            const reservationResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                { withCredentials: true }
            );
            
            if (reservationResponse.data && reservationResponse.data.tenantId) {
                tenantId = reservationResponse.data.tenantId;
            } else if (reservationResponse.data && reservationResponse.data.tenant_id) {
                tenantId = reservationResponse.data.tenant_id;
            }
        } catch (err) {
            console.error('Error fetching reservation details:', err);
        }

        if (!tenantId) {
            const parts = booking.id.split('-');
            if (parts.length > 1) {
                tenantId = parts[1];
            }
        }
        
        if (!tenantId) {
            toast({
                title: 'Error',
                description: 'Could not determine tenant ID for this booking',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        
        setIsProcessing(true);
        try {
            if (paymentMethod === 'credit_card') {
                const cardTxs = cardTransactions
                    .filter(t =>
                        (!selectedCardId || t.cardDetails?.id === selectedCardId) &&
                        t.transaction_direction === 'charge' &&
                        (t.payment_status === 'completed' || t.payment_status === 'paid') &&
                        (t.refundableAmount || 0) > 0
                    )
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                
                if (cardTxs.length === 0) {
                    throw new Error('No transactions available for refund were found.' +
                        (selectedCardId ? 'on this card.' : '.'));
                }

                let remainingToRefund = amount;
                let successfulRefunds = 0;
                let balanceDueTransaction = null;

                for (const tx of cardTxs) {
                    if (remainingToRefund <= 0) break;

                    const refundFromTx = Math.min(remainingToRefund, tx.refundableAmount || 0);
                    
                    if (refundFromTx <= 0) continue;
                    
                    const paymentIntentId = tx.paymentIntentId || tx.stripe_payment_id;
                    const paymentMethodId = selectedCardId;

                    let chargeId = tx.chargeId || tx.metadata?.chargeId;
                    
                    if (!chargeId && paymentIntentId) {
                        chargeId = await fetchChargeId(paymentIntentId);
                    }

                    if (!chargeId && !paymentIntentId) {
                        console.error(`Skipping transaction ${tx.id} - No valid payment ID or charge ID`);
                        continue;
                    }
                    
                    const refundPayload: RefundPayload = {
                        paymentMethodId: paymentMethodId,
                        amount: refundFromTx,
                        originalTransactionId: tx.id
                    };

                    if (chargeId) {
                        refundPayload.chargeId = chargeId;
                    } else if (paymentIntentId) {
                        if (paymentIntentId.startsWith('seti_')) {
                            console.error(`Skipping transaction ${tx.id} - Invalid Payment ID (setup intent)`);
                            continue;
                        }
                        refundPayload.paymentIntentId = paymentIntentId;
                    }

                    try {
                        const refundResponse = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/refund`,
                            refundPayload,
                            {
                                withCredentials: true,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (refundResponse.data && refundResponse.data.success) {
                            const isFullRefund = Math.abs(tx.refundableAmount - refundFromTx) < 0.01;
                            const transactionData = {
                                tenant_id: tenantId,
                                reservation_id: booking.id,
                                amount: refundFromTx,
                                payment_status: 'completed',
                                payment_method: 'credit_card',
                                transaction_type: 'REFUND',
                                transaction_direction: 'refund',
                                description: `Refund to credit card`,
                                reference_number: refundResponse.data.id || `RF-${Date.now().toString().slice(-6)}`,
                                paymentIntentId: refundResponse.data.id,
                                paymentMethodId: paymentMethodId,
                                parent_transaction_id: tx.id,
                                is_price_adjustment: false,
                                chargeId: chargeId,
                                metadata: {
                                    comment: comment,
                                    notifyCustomer: notifyCustomer,
                                    refundDate: new Date().toISOString(),
                                    paymentMethod: 'credit_card',
                                    refundReason: 'return_payment',
                                    isPartial: !isFullRefund,
                                    isFullRefund: isFullRefund,
                                    isSplitRefund: amount > refundFromTx,
                                    originalTransactionId: tx.id,
                                    cardId: paymentMethodId,
                                    originalAmount: tx.amount,
                                    refundTotal: amount,
                                    refundPortion: refundFromTx,
                                    remaining: (tx.refundableAmount || 0) - refundFromTx,
                                    tenantId: tenantId,
                                    chargeId: chargeId
                                }
                            };
                            
                            const refundTxResponse = await axios.post(
                                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                                transactionData,
                                {
                                    withCredentials: true
                                }
                            );

                            balanceDueTransaction = await createBalanceDueTransaction(
                                tx,
                                refundTxResponse.data,
                                refundFromTx
                            );
                            
                            successfulRefunds++;
                            remainingToRefund -= refundFromTx;
                        }
                    } catch (err) {
                        console.error(`Error processing refund for transaction ${tx.id}:`, err);
                        console.error('Error details:', {
                            message: err.message,
                            response: err.response?.data,
                            status: err.response?.status,
                            transaction: {
                                id: tx.id,
                                paymentIntentId: paymentIntentId,
                                paymentMethodId: paymentMethodId,
                                amount: refundFromTx,
                                refundableAmount: tx.refundableAmount
                            }
                        });

                        toast({
                            title: 'Refund Error',
                            description: `Failed to process refund for transaction ${tx.id.slice(0, 8)}...: ${err.response?.data?.message || err.message}`,
                            status: 'error',
                            duration: 7000,
                            isClosable: true,
                        });
                    }
                }
                
                if (successfulRefunds === 0) {
                    throw new Error('Failed to process any refund. Please check payment IDs.');
                }
                
                if (remainingToRefund > 0) {
                    toast({
                        title: 'Partial refund processed',
                        description: `Just $${(amount - remainingToRefund).toFixed(2)} of the $${amount.toFixed(2)} requested could be refunded.`,
                        status: 'warning',
                        duration: 5000,
                        isClosable: true,
                    });
                }

                if (balanceDueTransaction) {
                    toast({
                        title: 'Refund Processed',
                        description: `Refund of $${amount.toFixed(2)} processed successfully. A balance due of $${balanceDueTransaction.amount.toFixed(2)} has been created.`,
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                } else {
                    toast({
                        title: 'Success',
                        description: `Refund of $${amount.toFixed(2)} processed successfully!`,
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } else {
                const pendingRefundTx = pendingTransactions.find(tx =>
                    tx.transaction_direction === 'refund' && Math.abs(tx.amount - amount) < 0.01
                );
                const tenantId = booking.id.split('-')[1] || '';
                if (pendingRefundTx) {
                    await axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${pendingRefundTx.id}`,
                        {
                            payment_status: 'completed',
                            payment_method: paymentMethod,
                            updated_at: new Date().toISOString(),
                            metadata: {
                                ...pendingRefundTx.metadata,
                                comment: comment,
                                notifyCustomer: notifyCustomer,
                                refundDate: new Date().toISOString(),
                                paymentMethod: paymentMethod,
                                isPartial: isRefundPartial
                            }
                        },
                        {
                            withCredentials: true
                        }
                    );
                } else {
                    const pendingRefunds = pendingTransactions.filter(tx => tx.transaction_direction === 'refund');
                    if (pendingRefunds.length > 0) {
                        for (const tx of pendingRefunds) {
                            await axios.put(
                                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${tx.id}`,
                                {
                                    payment_status: 'archived',
                                    updated_at: new Date().toISOString()
                                },
                                {
                                    withCredentials: true
                                }
                            );
                        }
                    }
                    const transactionData = {
                        tenant_id: tenantId,
                        reservation_id: booking.id,
                        amount: amount,
                        payment_status: 'completed',
                        payment_method: paymentMethod,
                        transaction_type: 'REFUND',
                        transaction_direction: 'refund',
                        description: `Refund via ${paymentMethod}`,
                        reference_number: `RF-${Date.now().toString().slice(-6)}`,
                        parent_transaction_id: selectedTransaction?.id,
                        metadata: {
                            comment: comment,
                            notifyCustomer: notifyCustomer,
                            refundDate: new Date().toISOString(),
                            paymentMethod: paymentMethod,
                            refundReason: 'return_payment',
                            isPartial: isRefundPartial,
                            originalTransactionId: selectedTransaction?.id
                        }
                    };
                    
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                        transactionData,
                        {
                            withCredentials: true
                        }
                    );
                }
                if (paymentMethod === 'store_credit') {
                    try {
                        const voucherResponse = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/voucher/generate`,
                            {
                                amount: amount,
                                originReservationId: booking.id
                            },
                            {
                                withCredentials: true
                            }
                        );
                        
                        if (voucherResponse.data && voucherResponse.data.voucher) {
                            const voucherCode = voucherResponse.data.voucher.code;
                            setGeneratedVoucher({
                                code: voucherCode,
                                amount: amount
                            });
                            toast({
                                title: 'Store Credit Generated',
                                description: `Voucher code: ${voucherCode} for $${amount.toFixed(2)} has been created.`,
                                status: 'success',
                                duration: 8000,
                                isClosable: true,
                            });
                        }
                    } catch (voucherError) {
                        console.error('Error generating voucher:', voucherError);
                        toast({
                            title: 'Voucher Generation Error',
                            description: 'The refund was processed, but there was an error creating the store credit voucher.',
                            status: 'warning',
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                }
            }

            if (paymentMethod !== 'store_credit' || !generatedVoucher) {
                onClose();
            }
        } catch (error: any) {
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method,
                params: error.config?.params,
                headers: error.config?.headers,
                requestData: error.config?.data,
                paymentIntentId: selectedTransaction?.paymentIntentId || booking?.paymentIntentId,
                setupIntentId: booking?.setupIntentId,
                selectedCardId: selectedCardId,
                amount: amount
            });

            let errorMessage = 'Failed to process refund';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if (!errorMessage.includes('refund') && !errorMessage.includes('Refund')) {
                errorMessage = `Failed to process refund: ${errorMessage}`;
            }

            toast({
                title: 'Error',
                description: errorMessage,
                status: 'error',
                duration: 7000,
                isClosable: true,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const createBalanceDueTransaction = async (originalTransaction, refundTransaction, refundAmount) => {
        try {
            if (!originalTransaction || !refundTransaction) {
                console.error('Missing transaction data for balance due creation');
                return null;
            }

            let tenantId = '';

            if (originalTransaction.tenant_id) {
                tenantId = originalTransaction.tenant_id;
            } 
            else if (refundTransaction.tenant_id) {
                tenantId = refundTransaction.tenant_id;
            }
            else if (booking.id) {
                const parts = booking.id.split('-');
                if (parts.length > 1) {
                    tenantId = parts[1];
                }
            }
            
            if (!tenantId) {
                console.error('Could not determine valid tenant_id for balance due transaction');
                toast({
                    title: 'Error',
                    description: 'Failed to create balance due: Missing tenant information',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
                return null;
            }

            const balanceDue = refundAmount;
            
            if (balanceDue <= 0) {
                console.error('Cannot create balance due with zero or negative amount');
                return null;
            }
            
            const pendingChargeData = {
                tenant_id: tenantId,
                reservation_id: booking.id,
                amount: balanceDue,
                payment_status: 'pending',
                payment_method: originalTransaction.payment_method,
                transaction_type: 'CHARGE',
                transaction_direction: 'charge',
                description: 'Balance due equal to refund amount',
                reference_number: `BD-${Date.now().toString().slice(-6)}`,
                parent_transaction_id: refundTransaction.id,
                is_price_adjustment: true,
                metadata: {
                    notifyCustomer: notifyCustomer,
                    createdDate: new Date().toISOString(),
                    partialRefundId: refundTransaction.id,
                    originalTransactionId: originalTransaction.id,
                    originalAmount: originalTransaction.amount,
                    refundAmount: refundAmount,
                    balanceDue: balanceDue,
                    comment: comment || 'Balance due for refund'
                }
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                pendingChargeData,
                {
                    withCredentials: true
                }
            );
            
            if (response.data) {
                setBalanceDue(balanceDue);
                return response.data;
            } else {
                console.error('No data returned from balance due transaction creation');
                return null;
            }
        } catch (error) {
            console.error('Error creating balance due transaction:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            toast({
                title: 'Error',
                description: `Failed to create balance due: ${error.response?.data?.message || error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            
            return null;
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

    const calculateAddonTotal = () => {
        const addons = getCombinedAddons();
        return addons.reduce((total, addon) => {
            return total + (addon.price * addon.quantity);
        }, 0);
    };

    const calculateCustomItemsTotal = () => {
        if (!displayedCustomItems || displayedCustomItems.length === 0) return 0;
        
        return displayedCustomItems.reduce((total, item) => {
            const itemTotal = item.amount * item.quantity;
            return item.type === 'Discount' ? total - itemTotal : total + itemTotal;
        }, 0);
    };

    const calculateTotalPrice = () => {
        const guestTotal = calculateGuestPrice();
        const addonTotal = calculateAddonTotal();
        const customItemsTotal = calculateCustomItemsTotal();
        
        return guestTotal + addonTotal + customItemsTotal;
    };

    const handleCardSelection = (card: CardDetails) => {
        if (selectedCardId === card.id) {
            clearCardSelection();
            return;
        }

        setSelectedCardId(card.id);
        setSelectedCard(card);

        const mappedTransactions = cardToTransactionMap[card.id] || [];

        const cardTxs = cardTransactions
            .filter(t => 
                t.cardDetails?.id === card.id &&
                (t.refundableAmount || 0) > 0
            )
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
        if (cardTxs.length > 0) {
            setSelectedTransaction(cardTxs[0]);
            
            const totalRefundable = card.refundableAmount || 0;
            
            if (amount > totalRefundable && totalRefundable > 0) {
                setAmount(totalRefundable);
            }
        }
    };

    useEffect(() => {
        if (selectedCardId && cardList.length > 0) {
            const card = cardList.find(c => c.id === selectedCardId);
            if (card) {
                setSelectedCard(card);
            }
        }
    }, [selectedCardId, cardList]);


    const clearCardSelection = () => {
        setSelectedCardId(null);
        setSelectedCard(null);
        setSelectedTransaction(null);
        setAmount(refundAmount || booking?.total_price || 0);
    };

    const fetchChargeId = async (paymentIntentId: string) => {
        try {

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-intent/${paymentIntentId}`,
                { withCredentials: true }
            );
            
            if (response?.data?.charges?.data && response.data.charges.data.length > 0) {
                const chargeId = response.data.charges.data[0].id;
                return chargeId;
            }

            try {
                const txResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-payment-intent/${paymentIntentId}`,
                    { withCredentials: true }
                );
                
                if (txResponse?.data?.length > 0) {
                    const txWithCharge = txResponse.data.find(tx => tx.chargeId);
                    if (txWithCharge?.chargeId) {
                        return txWithCharge.chargeId;
                    }

                    for (const tx of txResponse.data) {
                        if (tx.metadata?.chargeId) {
                            return tx.metadata.chargeId;
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching transactions by payment intent:', err);
            }
            return null;
        } catch (error) {
            console.error('Error fetching charge ID:', error);
            return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <ModalOverlay/>
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
                                    <HStack mb={2} justify="space-between">
                                        <Text>Amount</Text>
                                        {selectedCard && (
                                            <Text fontSize="sm" color="blue.600">
                                                Maximum available: ${selectedCard.refundableAmount?.toFixed(2)}
                                            </Text>
                                        )}
                                    </HStack>
                                    <Flex>
                                        <Input
                                            value={amount === 0 ? '' : amount}
                                            onChange={handleAmountChange}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={selectedCard?.refundableAmount || maxRefundableAmount}
                                            placeholder="$ 0.00"
                                        />
                                    </Flex>
                                    <Text fontSize="sm" color="gray.600" mt={1}>
                                        {paymentMethod === 'credit_card' && selectedCard
                                            ? `until $${selectedCard.refundableAmount?.toFixed(2)}`
                                            : paymentMethod === 'credit_card' && cardTransactions.length > 0
                                                ? `until $${maxRefundableAmount.toFixed(2)} total on all cards`
                                                : `until $${calculateTotalPrice().toFixed(2)}`
                                        }
                                    </Text>
                                </Box>

                                <Box>
                                    <Text mb={2}>Payment Method</Text>
                                    <HStack spacing={2}>
                                        {hasOriginalCardPayment && (
                                            <Button
                                                leftIcon={<FaRegCreditCard/>}
                                                variant={paymentMethod === 'credit_card' ? 'solid' : 'outline'}
                                                borderColor={paymentMethod === 'credit_card' ? 'blue.500' : 'gray.200'}
                                                bg={paymentMethod === 'credit_card' ? 'blue.50' : 'white'}
                                                color={paymentMethod === 'credit_card' ? 'blue.700' : 'gray.700'}
                                                _hover={{bg: paymentMethod === 'credit_card' ? 'blue.100' : 'gray.100'}}
                                                onClick={() => setPaymentMethod('credit_card')}
                                            >
                                                Credit Card
                                            </Button>
                                        )}
                                        <Button
                                            leftIcon={<BsCash/>}
                                            variant={paymentMethod === 'cash' ? 'solid' : 'outline'}
                                            borderColor={paymentMethod === 'cash' ? 'blue.500' : 'gray.200'}
                                            bg={paymentMethod === 'cash' ? 'blue.50' : 'white'}
                                            color={paymentMethod === 'cash' ? 'blue.700' : 'gray.700'}
                                            _hover={{bg: paymentMethod === 'cash' ? 'blue.100' : 'gray.100'}}
                                            onClick={() => setPaymentMethod('cash')}
                                        >
                                            Cash
                                        </Button>
                                        <Button
                                            leftIcon={<BsCheck2/>}
                                            variant={paymentMethod === 'store_credit' ? 'solid' : 'outline'}
                                            borderColor={paymentMethod === 'store_credit' ? 'blue.500' : 'gray.200'}
                                            bg={paymentMethod === 'store_credit' ? 'blue.50' : 'white'}
                                            color={paymentMethod === 'store_credit' ? 'blue.700' : 'gray.700'}
                                            _hover={{bg: paymentMethod === 'store_credit' ? 'blue.100' : 'gray.100'}}
                                            onClick={() => setPaymentMethod('store_credit')}
                                        >
                                            Store Credit
                                        </Button>
                                        <Button
                                            leftIcon={<BsCheck2/>}
                                            variant={paymentMethod === 'other' ? 'solid' : 'outline'}
                                            borderColor={paymentMethod === 'other' ? 'blue.500' : 'gray.200'}
                                            bg={paymentMethod === 'other' ? 'blue.50' : 'white'}
                                            color={paymentMethod === 'other' ? 'blue.700' : 'gray.700'}
                                            _hover={{bg: paymentMethod === 'other' ? 'blue.100' : 'gray.100'}}
                                            onClick={() => setPaymentMethod('other')}
                                        >
                                            Other
                                        </Button>
                                    </HStack>
                                    
                                    {paymentMethod === 'store_credit' && (
                                        <Box mt={2} p={3} bg="green.50" borderRadius="md" borderColor="green.200"
                                             borderWidth="1px">
                                            <Text fontSize="sm" color="green.700">
                                                A voucher code will be generated for the refund amount. The customer can
                                                use this voucher for future bookings.
                                            </Text>
                                        </Box>
                                    )}
                                </Box>

                                {paymentMethod === 'credit_card' && hasOriginalCardPayment && (
                                    <Box>
                                        {!selectedCardId && cardList.length > 0 && (
                                            <Box p={3} mb={3} borderWidth="1px" borderRadius="md" borderColor="blue.200"
                                                 bg="blue.50">
                                                <Text fontSize="sm">
                                                    Select a card to process the refund or choose another payment
                                                    method.
                                                </Text>
                                            </Box>
                                        )}
                                        
                                        {isLoadingTransactions ? (
                                            <HStack spacing={2} py={2}>
                                                <Text>Loading card information...</Text>
                                            </HStack>
                                        ) : cardList.length > 0 ? (
                                            <VStack spacing={2} align="stretch">
                                                {cardList.map((card) => (
                                                    <Box
                                                        key={card.id}
                                                        p={3}
                                                        borderWidth="1px"
                                                        borderRadius="md"
                                                        borderColor={selectedCardId === card.id ? "blue.500" : "gray.200"}
                                                        bg={selectedCardId === card.id ? "blue.50" : "white"}
                                                        cursor="pointer"
                                                        onClick={() => handleCardSelection(card)}
                                                        position="relative"
                                                        _hover={{
                                                            borderColor: "blue.300",
                                                            boxShadow: "sm"
                                                        }}
                                                    >
                                                        <HStack justify="space-between" mb={2}
                                                                mt={selectedCardId === card.id ? 4 : 0}>
                                                            <Radio value={card.id} colorScheme="blue"
                                                                   isChecked={selectedCardId === card.id}>
                                                                <HStack>
                                                                    <FaRegCreditCard/>
                                                                    <Text>
                                                                        {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} •••• {card.last4}
                                                                    </Text>
                                                                </HStack>
                                                            </Radio>
                                                            <Text fontSize="sm" color="gray.500">
                                                                {formatDate(card.paymentDate)}
                                                            </Text>
                                                        </HStack>

                                                        <HStack justify="space-between" mt={2} p={2} bg="gray.50"
                                                                borderRadius="md">
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" fontWeight="medium"
                                                                      color="gray.600">Available:</Text>
                                                            </VStack>
                                                            <VStack align="end" spacing={0}>
                                                                <Text
                                                                    fontSize="sm"
                                                                    fontWeight="semibold"
                                                                    color={(card.refundableAmount > 0 || (card.refundedAmount === 0 && card.amount > 0)) ? "green.500" : "red.500"}
                                                                >
                                                                    ${card.refundableAmount?.toFixed(2)}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>

                                                        {selectedCardId === card.id && refundHistory.some(
                                                            r => r.metadata?.paymentMethodId === selectedCardId ||
                                                                r.metadata?.cardId === selectedCardId
                                                        ) && (
                                                            <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                                                                <Text fontWeight="semibold" fontSize="sm" mb={1}>Previous
                                                                    refunds</Text>
                                                                {refundHistory
                                                                    .filter(r => r.metadata?.paymentMethodId === selectedCardId ||
                                                                        r.metadata?.cardId === selectedCardId)
                                                                    .map((refund, idx) => (
                                                                        <HStack key={idx} justify="space-between">
                                                                            <Text fontSize="sm">
                                                                                {formatDate(refund.created_at)}
                                                                            </Text>
                                                                            <Text fontSize="sm" color="red.500">
                                                                                -${refund.amount.toFixed(2)}
                                                                            </Text>
                                                                        </HStack>
                                                                    ))
                                                                }
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ))}
                                            </VStack>
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

                                {refundHistory.length > 0 && (
                                    <RefundHistorySection
                                        refundHistory={refundHistory}
                                        isLoading={isLoadingTransactions}
                                    />
                                )}
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

                                            {getCombinedAddons().length > 0 && (
                                                <>
                                                    {getCombinedAddons().map((addon) => (
                                                        <HStack key={addon.id} justify="space-between">
                                                            <Text>{addon.label || addon.name} (${addon.price.toFixed(2)} x {addon.quantity})</Text>
                                                            <Text>${(addon.price * addon.quantity).toFixed(2)}</Text>
                                                        </HStack>
                                                    ))}
                                                </>
                                            )}

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
                                                    <HStack justify="space-between" mt={1}>
                                                        <Text fontWeight="semibold">Custom Items Subtotal</Text>
                                                        <Text
                                                            fontWeight="semibold">${calculateCustomItemsTotal().toFixed(2)}</Text>
                                                    </HStack>
                                                </>
                                            )}
                                            
                                            <HStack justify="space-between" mt={2}>
                                                <Text fontWeight="bold">Total</Text>
                                                <Text fontWeight="bold">${calculateTotalPrice().toFixed(2)}</Text>
                                            </HStack>

                                            {!isLoadingPendingBalance && pendingBalance !== 0 && (
                                                <HStack justify="space-between" mt={2}
                                                        color={pendingBalance > 0 ? "red.500" : "green.500"}>
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
                                        {!isLoadingTransactions ? (
                                            <>
                                                {cardTransactions
                                                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                                    .map((transaction) => (
                                                        <React.Fragment key={transaction.id}>
                                                            <HStack justify="space-between">
                                                                <HStack>
                                                                    <FaRegCreditCard/>
                                                                    <Text>
                                                                        {transaction.payment_method?.charAt(0).toUpperCase() + transaction.payment_method?.slice(1)}
                                                                        {transaction.cardDetails?.last4 ? ` •••• ${transaction.cardDetails.last4}` : ''}
                                                                    </Text>
                                                                </HStack>
                                                                <Text>${transaction.amount.toFixed(2)}</Text>
                                                            </HStack>
                                                            <HStack justify="space-between" pl={4}>
                                                                <Text fontSize="sm" color="gray.600">
                                                                    Payment {formatDate(transaction.created_at)}
                                                                </Text>
                                                                {/*<Text fontSize="sm">${transaction.amount.toFixed(2)}</Text>*/}
                                                            </HStack>

                                                            {transaction.relatedRefunds && transaction.relatedRefunds.length > 0 &&
                                                                transaction.relatedRefunds.map((refund, idx) => (
                                                                    <HStack key={`refund-${idx}`}
                                                                            justify="space-between" color="red.500"
                                                                            pl={4}>
                                                                        <Text fontSize="sm">
                                                                            Refund {formatDate(refund.created_at)}
                                                                            {refund.payment_method && ` (${refund.payment_method})`}
                                                                        </Text>
                                                                        <Text
                                                                            fontSize="sm">-${refund.amount.toFixed(2)}</Text>
                                                                    </HStack>
                                                                ))
                                                            }

                                                            {transaction.refundedAmount > 0 && (
                                                                <HStack justify="space-between" pl={4} mt={1} mb={2}
                                                                        color="red.500">
                                                                    <Text fontSize="sm">Total refunded:</Text>
                                                                    <Text
                                                                        fontSize="sm">-${transaction.refundedAmount.toFixed(2)}</Text>
                                                                </HStack>
                                                            )}

                                                            <Divider my={2}/>
                                                        </React.Fragment>
                                                    ))}

                                                {/*{amount > 0 && (*/}
                                                {/*    <HStack justify="space-between" color="blue.500" mt={2}>*/}
                                                {/*        <Text fontSize="sm" fontWeight="medium">*/}
                                                {/*            {paymentMethod === 'credit_card' && selectedCardId && cardList.find(c => c.id === selectedCardId) ? */}
                                                {/*                `Return Payment ${formatDate(new Date().toISOString())} *${cardList.find(c => c.id === selectedCardId)?.last4}` :*/}
                                                {/*                `Return Payment ${formatDate(new Date().toISOString())} (${paymentMethod})`*/}
                                                {/*            }*/}
                                                {/*            {isRefundPartial && " (Partial)"}*/}
                                                {/*        </Text>*/}
                                                {/*        <Text fontSize="sm" fontWeight="medium">-${amount.toFixed(2)}</Text>*/}
                                                {/*    </HStack>*/}
                                                {/*)}*/}

                                                <Divider my={2}/>

                                                {refundHistory.length > 0 && (
                                                    <HStack justify="space-between" color="red.500">
                                                        <Text fontWeight="bold">Total Refunded</Text>
                                                        <Text fontWeight="bold">
                                                            -${refundHistory.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                                                        </Text>
                                                    </HStack>
                                                )}

                                                <HStack justify="space-between" mt={1}>
                                                    <Text fontWeight="bold">Paid</Text>
                                                    <Text fontWeight="bold">${calculateTotalPrice().toFixed(2)}</Text>
                                                </HStack>
                                            </>
                                        ) : (
                                            <Text fontSize="sm" color="gray.500">Loading payment information...</Text>
                                        )}
                                    </VStack>
                                </Box>
                            </VStack>
                        </Box>
                    </Flex>
                </ModalBody>

                <ModalFooter borderTopWidth={1} borderColor="gray.200">
                    {generatedVoucher ? (
                        <VStack w="100%" spacing={4} align="stretch">
                            <Box p={4} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                                <VStack spacing={3} align="stretch">
                                    <Text fontWeight="bold" fontSize="lg" color="green.700">
                                        Store Credit Voucher Generated
                                    </Text>
                                    <HStack justify="space-between">
                                        <Text>Amount:</Text>
                                        <Text fontWeight="bold">${generatedVoucher.amount.toFixed(2)}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Voucher Code:</Text>
                                        <Box
                                            bg="white"
                                            p={2}
                                            borderRadius="md"
                                            fontFamily="monospace"
                                            fontWeight="bold"
                                            fontSize="lg"
                                            boxShadow="sm"
                                        >
                                            {generatedVoucher.code}
                                        </Box>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600">
                                        The customer can use this code for future bookings.
                                    </Text>
                                </VStack>
                            </Box>
                            <Flex justify="flex-end">
                                <Button colorScheme="blue" onClick={onClose}>
                                    Close
                                </Button>
                            </Flex>
                        </VStack>
                    ) : (
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
                                isLoading={isProcessing}
                            >
                                Save Changes
                            </Button>
                        </HStack>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReturnPaymentModal; 