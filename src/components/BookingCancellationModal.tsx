import {
    Box,
    Button,
    Checkbox,
    Divider,
    Flex,
    HStack,
    Icon,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    Textarea,
    useToast,
    VStack
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {FaCcAmex, FaCcDiscover, FaCcMastercard, FaCcVisa, FaRegCreditCard} from "react-icons/fa";
import {BsCash, BsCheck2} from "react-icons/bs";
import axios from "axios";
import { syncSingleReservation } from "../utils/calendarSync";
import { useAuth } from "../contexts/AuthContext";

const BookingCancellationModal = ({booking, isOpen, onClose, onStatusChange}) => {
    const [refundAmount, setRefundAmount] = useState(booking?.total_price || 0);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [comment, setComment] = useState("");
    const [originalTransaction, setOriginalTransaction] = useState(null);
    const [cardInfo, setCardInfo] = useState(null);
    const [loadingCardInfo, setLoadingCardInfo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservationAddons, setReservationAddons] = useState([]);
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(false);
    const [customItems, setCustomItems] = useState([]);
    const [isLoadingCustomItems, setIsLoadingCustomItems] = useState(false);
    const [tierPricing, setTierPricing] = useState(null);
    const [isLoadingTierPricing, setIsLoadingTierPricing] = useState(false);
    const [guestQuantity, setGuestQuantity] = useState(booking?.guestQuantity || 0);
    const [guestPrice, setGuestPrice] = useState(0);
    const [tourId, setTourId] = useState(null);
    const [generatedVoucher, setGeneratedVoucher] = useState(null);
    const [isCalculatingTotal, setIsCalculatingTotal] = useState(true);
    const toast = useToast();

    const [cardList, setCardList] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardTransactions, setCardTransactions] = useState([]);
    const [cardToTransactionMap, setCardToTransactionMap] = useState({});
    const [paymentTransactions, setPaymentTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [maxRefundableAmount, setMaxRefundableAmount] = useState(0);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [refundHistory, setRefundHistory] = useState([]);

    const ALREADY_CANCELED_TOAST_ID = 'already-canceled-toast';
    const ALREADY_REFUNDED_TOAST_ID = 'already-refunded-toast';
    const NO_TRANSACTION_TOAST_ID = 'no-transaction-toast';
    const NO_PAYMENT_INTENT_TOAST_ID = 'no-payment-intent-toast';
    const REFUND_ERROR_TOAST_ID = 'refund-error-toast';
    const MISSING_TENANT_TOAST_ID = 'missing-tenant-toast';
    const GENERAL_ERROR_TOAST_ID = 'general-error-toast';
    const SUCCESS_TOAST_ID = 'success-toast';
    const VOUCHER_TOAST_ID = 'voucher-toast';
    const NO_ACTION_TOAST_ID = 'no-action-toast';

    useEffect(() => {
        if (isOpen && !isCalculatingTotal) {
            const total = calculateTotalPrice();
            if (total > 0) {
                setRefundAmount(total);
            }
        }
    }, [reservationAddons, customItems, guestQuantity, tourId, isCalculatingTotal]);

    useEffect(() => {
        if (booking?.total_price && booking.total_price > 0) {
            setRefundAmount(booking.total_price);
        }
    }, [booking?.total_price]);
    
    useEffect(() => {
        if (isOpen) {
            setIsCalculatingTotal(true);
            
            if (booking?.total_price) {
                setRefundAmount(booking.total_price);
            }
            
            setReservationAddons([]);
            setAllAddons([]);
            setCustomItems([]);
            
            fetchAllPaymentTransactions();
            fetchReservationDetails()
                .then(() => {
                    setTimeout(() => {
                        const calculatedTotal = calculateTotalPrice();
                        if (calculatedTotal > 0) {
                            setRefundAmount(calculatedTotal);
                        }
                        setIsCalculatingTotal(false);
                    }, 800);
                });
        }
    }, [isOpen, booking?.id]);

    useEffect(() => {
        if (selectedCardId && cardList.length > 0) {
            const card = cardList.find(c => c.id === selectedCardId);
            if (card) {
                setSelectedCard(card);
            }
        }
    }, [selectedCardId, cardList]);

    const fetchOriginalTransaction = async () => {
        try {
            setLoadingCardInfo(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                {
                    withCredentials: true,
                }
            );

            if (response.data && response.data.length > 0) {
                const createTransaction = response.data.find(t =>
                    t.transaction_type === 'CREATE' &&
                    (t.payment_method?.toLowerCase() === 'credit card' ||
                        t.payment_method?.toLowerCase() === 'card')
                );

                if (createTransaction) {
                    setOriginalTransaction(createTransaction);
                    let cardDetails = null;
                    if (createTransaction.metadata && createTransaction.metadata.cardInfo) {
                        cardDetails = createTransaction.metadata.cardInfo;
                    }
                    if (!cardDetails || !cardDetails.brand || !cardDetails.last4) {
                        const paymentMethodId = createTransaction.payment_method_id ||
                            createTransaction.paymentMethodId ||
                            booking.paymentMethodId;

                        if (paymentMethodId) {
                            try {
                                const paymentMethodResponse = await axios.get(
                                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${paymentMethodId}`,
                                    {
                                        withCredentials: true,
                                    }
                                );

                                if (paymentMethodResponse.data) {
                                    cardDetails = {
                                        brand: paymentMethodResponse.data.brand || 'card',
                                        last4: paymentMethodResponse.data.last4 || '1234',
                                        exp_month: paymentMethodResponse.data.exp_month,
                                        exp_year: paymentMethodResponse.data.exp_year
                                    };
                                }
                            } catch (err) {
                                console.error("Failed to fetch payment method details:", err);
                            }
                        }
                    }
                    if (!cardDetails) {
                        cardDetails = {
                            brand: 'card',
                            last4: '1234'
                        };
                    }
                    
                    setCardInfo(cardDetails);
                    setPaymentMethod("Credit Card");
                } else {
                    setPaymentMethod("Cash");
                }
            }
        } catch (error) {
            console.error("Failed to fetch original transaction:", error);
            toast({
                title: "Warning",
                description: "Could not retrieve saved card information.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoadingCardInfo(false);
        }
    };

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

            if (transactions.length > 0 && !booking.tenantId) {
                const firstTransaction = transactions.find(t => t.tenant_id);
                if (firstTransaction && firstTransaction.tenant_id) {
                    booking.tenantId = firstTransaction.tenant_id;
                }
            }

            const chargeTransactions = transactions.filter(
                (t) => t.transaction_direction === 'charge' &&
                    (t.payment_status === 'completed' || t.payment_status === 'paid')
            );

            const refundTransactions = transactions.filter(
                (t) => t.transaction_direction === 'refund' &&
                    t.payment_status === 'completed'
            );

            setRefundHistory(refundTransactions);

            const creditCardTransactions = chargeTransactions.filter(
                (t) => (t.payment_method?.toLowerCase().includes('card') ||
                        t.payment_method?.toLowerCase() === 'credit_card') &&
                    (t.paymentMethodId || t.paymentIntentId || t.setupIntentId)
            );

            const transactionsWithCardDetails = await Promise.all(creditCardTransactions.map(async (transaction) => {
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

                if (!cardDetails && transaction.metadata && transaction.metadata.cardInfo) {
                    const metaCardInfo = typeof transaction.metadata === 'string' 
                        ? JSON.parse(transaction.metadata).cardInfo 
                        : transaction.metadata.cardInfo;
                    
                    if (metaCardInfo) {
                        cardDetails = {
                            id: metaCardInfo.id || transaction.paymentMethodId || `card_${Math.random().toString(36).substring(2, 15)}`,
                            brand: metaCardInfo.brand || 'Card',
                            last4: metaCardInfo.last4 || '****',
                            paymentDate: transaction.created_at,
                            transactionId: transaction.id,
                            amount: transaction.amount
                        };
                    }
                }

                const relatedRefunds = refundTransactions.filter(
                    (r) => r.metadata?.originalTransactionId === transaction.id ||
                        r.parent_transaction_id === transaction.id
                );

                const refundedAmount = transaction.refunded_amount ||
                    relatedRefunds.reduce((sum, refund) => sum + refund.amount, 0);
                
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
                setPaymentMethod("Credit Card");

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
            setLoadingCardInfo(false);
        }
    };

    const fetchReservationDetails = async () => {
        if (!booking?.id) return;

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                {
                    withCredentials: true,
                }
            );

            if (response.data) {
                setTourId(response.data.tourId || response.data.tour_id);
                setGuestQuantity(response.data.guestQuantity || booking.guestQuantity || 0);

                if (response.data.guestQuantity && response.data.total_price) {
                    setGuestPrice(response.data.total_price / response.data.guestQuantity);
                } else if (booking.guestQuantity && booking.total_price) {
                    setGuestPrice(booking.total_price / booking.guestQuantity);
                }

                if (response.data.tourId || response.data.tour_id) {
                    const tid = response.data.tourId || response.data.tour_id;
                    await Promise.all([
                        fetchTierPricing(tid),
                        fetchAddons(tid)
                    ]);
                }

                await fetchCustomItems();
            }
        } catch (error) {
            console.error("Failed to fetch reservation details:", error);
        }
    };

    const fetchTierPricing = async (tid) => {
        if (!tid) return;

        try {
            setIsLoadingTierPricing(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${tid}`,
                {
                    withCredentials: true,
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
            console.error("Failed to fetch tier pricing:", error);
        } finally {
            setIsLoadingTierPricing(false);
        }
    };

    const fetchAddons = async (tid) => {
        if (!tid || !booking?.id) return;

        try {
            setIsLoadingAddons(true);
            const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`,
                    {
                        withCredentials: true,
                    }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${tid}`,
                    {
                        withCredentials: true,
                    }),
            ]);

            setReservationAddons(reservationAddonsResponse.data || []);
            setAllAddons(allAddonsResponse.data || []);
        } catch (error) {
            console.error("Failed to fetch addons:", error);
            toast({
                title: "Warning",
                description: "Could not retrieve addon information.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoadingAddons(false);
        }
    };

    const fetchCustomItems = async () => {
        if (!booking?.id) return;

        try {
            setIsLoadingCustomItems(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/custom-items/reservation/${booking.id}`,
                {
                    withCredentials: true,
                }
            );

            const formattedItems = response.data.map(item => ({
                id: item.id,
                name: item.label,
                type: item.description,
                amount: Number(item.amount),
                quantity: Number(item.quantity)
            }));

            setCustomItems(formattedItems || []);
        } catch (error) {
            console.error("Failed to fetch custom items:", error);
            toast({
                title: "Warning", 
                description: "Could not retrieve custom item information.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoadingCustomItems(false);
        }
    };

    const getCombinedAddons = () => {
        if (!allAddons.length || !reservationAddons.length) return [];

        return allAddons.reduce((acc, addon) => {
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
        if (!customItems || customItems.length === 0) return 0;

        return customItems.reduce((total, item) => {
            const itemTotal = item.amount * item.quantity;
            return item.type === 'Discount' ? total - itemTotal : total + itemTotal;
        }, 0);
    };

    const calculateTotalPrice = () => {
        if (isLoadingAddons || isLoadingCustomItems || isLoadingTierPricing) {
            return booking?.total_price || 0;
        }
        
        const guestTotal = calculateGuestPrice();
        const addonTotal = calculateAddonTotal();
        const customItemsTotal = calculateCustomItemsTotal();
        
        const totalPrice = guestTotal + addonTotal + customItemsTotal;
        
        if (totalPrice === 0 && booking?.total_price) {
            return booking.total_price;
        }
        
        return totalPrice;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleCardSelection = (card) => {
        if (selectedCardId === card.id) {
            clearCardSelection();
            return;
        }

        setSelectedCardId(card.id);
        setSelectedCard(card);

        const cardTxs = cardTransactions
            .filter(t => 
                t.cardDetails?.id === card.id &&
                (t.refundableAmount || 0) > 0
            )
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
        if (cardTxs.length > 0) {
            setSelectedTransaction(cardTxs[0]);
            
            const totalRefundable = card.refundableAmount || 0;
            
            if (refundAmount > totalRefundable && totalRefundable > 0) {
                setRefundAmount(totalRefundable);
            }
        }
    };

    const clearCardSelection = () => {
        setSelectedCardId(null);
        setSelectedCard(null);
        setSelectedTransaction(null);
        setRefundAmount(calculateTotalPrice());
    };

    const handleAmountChange = (e) => {
        const inputValue = e.target.value;
        if (inputValue === '') {
            setRefundAmount(0);
            return;
        }
        const cleanValue = inputValue.replace(/[^\d.]/g, '');
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            return;
        }
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue)) {
            setRefundAmount(0);
            return;
        }

        let maxValue = calculateTotalPrice();
        
        if (paymentMethod === 'Credit Card' && selectedCard) {
            maxValue = Math.min(maxValue, selectedCard.refundableAmount || 0);
        } else if (paymentMethod === 'Credit Card') {
            maxValue = Math.min(maxValue, maxRefundableAmount);
        }
        
        if (numValue > maxValue) {
            setRefundAmount(maxValue);
        } else {
            setRefundAmount(numValue);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const finalRefundAmount = refundAmount > 0 ? refundAmount : calculateTotalPrice();
            
            if (finalRefundAmount <= 0) {
                toast.close(GENERAL_ERROR_TOAST_ID);
                toast({
                    id: GENERAL_ERROR_TOAST_ID,
                    title: "Error",
                    description: "Refund amount must be greater than zero.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            
            if (!paymentMethod) {
                toast.close(NO_ACTION_TOAST_ID);
                toast({
                    id: NO_ACTION_TOAST_ID,
                    title: "Payment Method Required",
                    description: "Please select a payment method to continue.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                });
                return;
            }
            setIsSubmitting(true);

            try {
                const reservationResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                    { withCredentials: true }
                );
                
                if (reservationResponse.data && reservationResponse.data.status === "CANCELED") {
                    toast.close(ALREADY_CANCELED_TOAST_ID);
                    toast({
                        id: ALREADY_CANCELED_TOAST_ID,
                        title: "Already Canceled",
                        description: "This reservation has already been canceled.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }

                const transactionsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                    { withCredentials: true }
                );
                
                if (transactionsResponse.data && transactionsResponse.data.length > 0) {
                    const hasCancellationTransaction = transactionsResponse.data.some(
                        transaction => 
                            transaction.transaction_type === 'CANCELLATION_REFUND' || 
                            (transaction.description && transaction.description.toLowerCase().includes('cancelled booking'))
                    );
                    
                    if (hasCancellationTransaction) {
                        toast.close(ALREADY_REFUNDED_TOAST_ID);
                        toast({
                            id: ALREADY_REFUNDED_TOAST_ID,
                            title: "Already Processed",
                            description: "A refund for this booking has already been processed.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                        setIsSubmitting(false);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error checking reservation status:", error);
            }

            if (paymentMethod === 'Credit Card') {
                if (!originalTransaction && !selectedTransaction) {
                    toast.close(NO_TRANSACTION_TOAST_ID);
                    toast({
                        id: NO_TRANSACTION_TOAST_ID,
                        title: "Error",
                        description: "No original payment transaction found.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }

                const transaction = selectedTransaction || originalTransaction;
                const paymentIntentId = transaction.paymentIntentId ||
                    transaction.stripe_payment_id;

                if (!paymentIntentId) {
                    toast.close(NO_PAYMENT_INTENT_TOAST_ID);
                    toast({
                        id: NO_PAYMENT_INTENT_TOAST_ID,
                        title: "Error",
                        description: "No payment intent ID found for this transaction.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }

                try {
                    const refundPayload = {
                        paymentIntentId: paymentIntentId,
                        paymentMethodId: transaction.paymentMethodId,
                        amount: finalRefundAmount
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
                            withCredentials:true,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    const cardTenantId = booking.tenantId || transaction.tenant_id || 
                                    (paymentTransactions.length > 0 ? paymentTransactions[0].tenant_id : null);

                    if (!cardTenantId) {
                        throw new Error('Tenant ID is missing. Cannot create refund transaction.');
                    }

                    const cardInfoToUse = selectedCard || cardInfo;

                    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                            tenant_id: cardTenantId,
                            reservation_id: booking.id,
                            amount: finalRefundAmount,
                            payment_status: 'completed',
                            payment_method: 'Credit Card',
                            transaction_type: 'CANCELLATION_REFUND',
                            transaction_direction: 'refund',
                            description: `Refund of $${finalRefundAmount.toFixed(2)} processed for cancelled booking`,
                            reference_number: `RF-${Date.now().toString().slice(-6)}`,
                            stripe_payment_id: paymentIntentId,
                            paymentIntentId: paymentIntentId,
                            parent_transaction_id: transaction.id,
                            metadata: {
                                originalPrice: calculateTotalPrice(),
                                refundAmount: finalRefundAmount,
                                comment: comment,
                                refundDate: new Date().toISOString(),
                                cardInfo: cardInfoToUse,
                                originalTransactionId: transaction.id,
                                notifyCustomer: notifyCustomer,
                                paymentMethodId: transaction.paymentMethodId
                            }
                        },
                        {
                            withCredentials: true,
                        });
                    const bookingResponse = await axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}?preserveOriginalTransaction=true`,
                        {
                            status: "CANCELED"
                        },
                        {withCredentials: true}
                    );

                    if (bookingResponse.data) {
                        toast.close(SUCCESS_TOAST_ID);
                        toast({
                            id: SUCCESS_TOAST_ID,
                            title: "Success",
                            description: "Refund processed and booking canceled successfully.",
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                        if (onStatusChange) {
                            onStatusChange("CANCELED");
                        }
                        onClose();

                        try {
                            const { currentUser } = useAuth();
                            const userIdFromAuth = currentUser?.id;

                            if (userIdFromAuth) {
                                await syncSingleReservation(booking.id, userIdFromAuth);
                            } else {
                                console.warn("BookingCancellationModal: User ID not available from auth. Calendar sync skipped for user.");
                            }
                            const guidesResponse = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${booking.id}/guides`,
                                { withCredentials: true }
                            );
                            
                            if (guidesResponse.data && guidesResponse.data.length > 0) {
                                const guides = guidesResponse.data;
                                for (const guide of guides) {
                                    try {
                                        await syncSingleReservation(booking.id, guide.guideId);
                                    } catch (guideError) {
                                        console.error(`Error syncing calendar for guide ${guide.guideId}:`, guideError);
                                    }
                                }
                            } else {
                                console.error('No guides found for this reservation');
                            }
                        } catch (syncError) {
                            console.error("Error syncing calendar after cancellation:", syncError);
                        }
                    }
                } catch (error) {
                    console.error("Stripe refund error:", error);
                    toast.close(REFUND_ERROR_TOAST_ID);
                    toast({
                        id: REFUND_ERROR_TOAST_ID,
                        title: "Refund Error",
                        description: error.response?.data?.message || "Failed to process refund with Stripe.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }
            } else if (paymentMethod === 'Cash') {
                const cashTenantId = booking.tenantId || originalTransaction?.tenant_id || 
                                (paymentTransactions.length > 0 ? paymentTransactions[0].tenant_id : null);

                if (!cashTenantId) {
                    toast.close(MISSING_TENANT_TOAST_ID);
                    toast({
                        id: MISSING_TENANT_TOAST_ID,
                        title: "Error",
                        description: "Tenant ID is missing. Cannot create refund transaction.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }

                const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                    tenant_id: cashTenantId,
                    reservation_id: booking.id,
                    amount: finalRefundAmount,
                    payment_status: 'completed',
                    payment_method: 'Cash',
                    transaction_type: 'CANCELLATION_REFUND',
                    transaction_direction: 'refund',
                    description: `Cash refund of $${finalRefundAmount.toFixed(2)} for cancelled booking`,
                    reference_number: `RF-${Date.now().toString().slice(-6)}`,
                    metadata: {
                        originalPrice: calculateTotalPrice(),
                        refundAmount: finalRefundAmount,
                        comment: comment,
                        refundDate: new Date().toISOString(),
                        notifyCustomer: notifyCustomer
                    }
                },
                    {
                        withCredentials: true
                    });

                if (transactionResponse.data) {
                    const bookingResponse = await axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}?preserveOriginalTransaction=true`,
                        {
                            status: "CANCELED"
                        },
                        {
                            withCredentials: true
                        }
                    );

                    if (bookingResponse.data) {
                        toast.close(SUCCESS_TOAST_ID);
                        toast({
                            id: SUCCESS_TOAST_ID,
                            title: "Success",
                            description: "Cash refund recorded and booking canceled successfully.",
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                        if (onStatusChange) {
                            onStatusChange("CANCELED");
                        }
                        onClose();
                    }
                }
            } else if (paymentMethod === "store") {
                try {
                    const storeTenantId = booking.tenantId || originalTransaction?.tenant_id;

                    if (!storeTenantId) {
                        toast.close(MISSING_TENANT_TOAST_ID);
                        toast({
                            id: MISSING_TENANT_TOAST_ID,
                            title: "Error",
                            description: "Tenant ID is missing. Cannot create store credit voucher.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                        setIsSubmitting(false);
                        return;
                    }

                    const voucherResponse = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/voucher/generate`,
                        {
                            amount: finalRefundAmount,
                            originReservationId: booking.id,
                            tenantId: storeTenantId
                        },
                        {
                            withCredentials: true
                        }
                    );

                    if (voucherResponse.data && voucherResponse.data.voucher) {
                        const voucherCode = voucherResponse.data.voucher.code;
                        setGeneratedVoucher({
                            code: voucherCode,
                            amount: finalRefundAmount
                        });

                        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                            tenant_id: storeTenantId,
                            reservation_id: booking.id,
                            amount: finalRefundAmount,
                            payment_status: 'completed',
                            payment_method: 'Store Credit',
                            transaction_type: 'CANCELLATION_REFUND',
                            transaction_direction: 'refund',
                            description: `Store credit voucher of $${finalRefundAmount.toFixed(2)} issued for cancelled booking`,
                            reference_number: `RF-${Date.now().toString().slice(-6)}`,
                            metadata: {
                                originalPrice: calculateTotalPrice(),
                                refundAmount: finalRefundAmount,
                                comment: comment,
                                refundDate: new Date().toISOString(),
                                notifyCustomer: notifyCustomer,
                                voucherCode: voucherCode,
                                voucherId: voucherResponse.data.voucher.id
                            }
                        },
                            {
                                withCredentials: true
                            });

                        const bookingResponse = await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}?preserveOriginalTransaction=true`,
                            {
                                status: "CANCELED"
                            },
                            {
                                withCredentials: true
                            }
                        );

                        if (bookingResponse.data) {
                            toast.close(SUCCESS_TOAST_ID);
                            toast({
                                id: SUCCESS_TOAST_ID,
                                title: "Success",
                                description: "Refund processed and booking canceled successfully.",
                                status: "success",
                                duration: 5000,
                                isClosable: true,
                            });
                            if (onStatusChange) {
                                onStatusChange("CANCELED");
                            }
                            onClose();
                        }
                    }
                } catch (error) {
                    throw new Error(error.response?.data?.message || "Failed to generate voucher");
                }
            } else if (paymentMethod === "other") {
                try {
                    const otherTenantId = booking.tenantId || 
                                     originalTransaction?.tenant_id || 
                                     (paymentTransactions.length > 0 ? paymentTransactions[0].tenant_id : null);

                    if (!otherTenantId) {
                        toast({
                            title: "Error",
                            description: "Tenant ID is missing. Cannot process refund.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                        setIsSubmitting(false);
                        return;
                    }
                    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                        tenant_id: otherTenantId,
                        reservation_id: booking.id,
                        amount: finalRefundAmount,
                        payment_status: 'completed',
                        payment_method: 'Other',
                        transaction_type: 'CANCELLATION_REFUND',
                        transaction_direction: 'refund',
                        description: `Refund of $${finalRefundAmount.toFixed(2)} processed for cancelled booking (Other method)`,
                        reference_number: `RF-${Date.now().toString().slice(-6)}`,
                        metadata: {
                            originalPrice: calculateTotalPrice(),
                            refundAmount: finalRefundAmount,
                            comment: comment,
                            refundDate: new Date().toISOString(),
                            notifyCustomer: notifyCustomer
                        }
                    },
                        {
                            withCredentials: true
                        });

                    const bookingResponse = await axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}?preserveOriginalTransaction=true`,
                        {
                            status: "CANCELED"
                        },
                        {
                            withCredentials: true
                        }
                    );

                    if (bookingResponse.data) {
                        toast.close(SUCCESS_TOAST_ID);
                        toast({
                            id: SUCCESS_TOAST_ID,
                            title: "Success",
                            description: "Refund recorded and booking canceled successfully.",
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                        if (onStatusChange) {
                            onStatusChange("CANCELED");
                        }
                        onClose();
                    }
                } catch (error) {
                    console.error("Failed to process cancellation:", error);
                    toast.close(GENERAL_ERROR_TOAST_ID);
                    toast({
                        id: GENERAL_ERROR_TOAST_ID,
                        title: "Error",
                        description: error.message || "Failed to process cancellation. Please try again.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } else {
                toast.close(NO_ACTION_TOAST_ID);
                toast({
                    id: NO_ACTION_TOAST_ID,
                    title: "No Action",
                    description: "Please select a payment method.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                });
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Failed to process cancellation:", error);
            toast.close(GENERAL_ERROR_TOAST_ID);
            toast({
                id: GENERAL_ERROR_TOAST_ID,
                title: "Error",
                description: error.message || "Failed to process cancellation. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "5xl" }}>
            <ModalOverlay/>
            <ModalContent maxW={{ base: "100%", md: "5xl" }}>
                <ModalHeader textAlign="center">
                    Reduce Booking Value and Return Payment
                </ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Box>
                        <Flex 
                            direction={{ base: "column", lg: "row" }} 
                            align="start" 
                            gap={{ base: 6, lg: 10 }}
                        >
                            <VStack align="start" spacing={5} flex="2.5" w={{ base: "100%", lg: "auto" }}>
                                <Box w="full" p={4} borderWidth="1px" borderRadius="md" bg="gray.100">
                                    <Text fontWeight="bold">{booking.user?.name || "Guest"}</Text>
                                    <Divider/>
                                    <HStack marginTop={"5px"}>
                                        <Image
                                            src={booking.imageUrl || "https://via.placeholder.com/150x100"}
                                            alt={booking.name ? `Avatar of ${booking.name}` : "Default avatar"}
                                            boxSize="70px"
                                            borderRadius="md"
                                        />
                                        <VStack align="start">
                                            <Text fontWeight={"bold"}>
                                                {booking.title || booking.tour?.name || "Booking"}
                                            </Text>
                                            <Text>
                                                {booking.dateFormatted || booking.reservation_date || "No date"} at{" "}
                                                {booking.time || "No time"}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </Box>

                                <Box w="full">
                                    <Text mb={2}>Amount</Text>
                                    {isCalculatingTotal ? (
                                        <Flex align="center" borderWidth="1px" borderRadius="md" p={2} bg="gray.100">
                                            <Spinner size="sm" mr={2}/>
                                            <Text>Calculating total refund amount...</Text>
                                        </Flex>
                                    ) : (
                                        <Flex>
                                            <Input
                                                value={refundAmount === 0 ? '' : refundAmount}
                                                onChange={handleAmountChange}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={selectedCard?.refundableAmount || maxRefundableAmount || calculateTotalPrice()}
                                                placeholder="$ 0.00"
                                                bg="white"
                                            />
                                        </Flex>
                                    )}
                                    <Text fontSize="sm" mt={1}>
                                        {paymentMethod === 'Credit Card' && selectedCard
                                            ? `Maximum refund available: $${selectedCard.refundableAmount?.toFixed(2)}`
                                            : paymentMethod === 'Credit Card' && cardTransactions.length > 0
                                                ? `Maximum refund available: $${maxRefundableAmount.toFixed(2)}`
                                                : `Full refund of $${calculateTotalPrice().toFixed(2)}`
                                        }
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text mb={2}>Payment Method</Text>
                                    <Flex 
                                        flexWrap="wrap" 
                                        gap={3} 
                                        direction={{ base: "column", sm: "row" }}
                                    >
                                        {cardList.length > 0 ? (
                                            <Button
                                                variant={paymentMethod === "Credit Card" ? "solid" : "outline"}
                                                onClick={() => setPaymentMethod("Credit Card")}
                                                leftIcon={<FaRegCreditCard/>}
                                                borderColor={paymentMethod === "Credit Card" ? 'blue.500' : 'gray.200'}
                                                bg={paymentMethod === "Credit Card" ? 'blue.50' : 'white'}
                                                color={paymentMethod === "Credit Card" ? 'blue.700' : 'gray.700'}
                                                _hover={{bg: paymentMethod === "Credit Card" ? 'blue.100' : 'gray.100'}}
                                                width={{ base: "full", sm: "auto" }}
                                            >
                                                Credit Card
                                            </Button>
                                        ) : null}
                                        <Button
                                            size="md"
                                            leftIcon={<BsCash/>}
                                            variant={paymentMethod === "Cash" ? "solid" : "outline"}
                                            onClick={() => setPaymentMethod("Cash")}
                                            borderColor={paymentMethod === "Cash" ? 'blue.500' : 'gray.200'}
                                            bg={paymentMethod === "Cash" ? 'blue.50' : 'white'}
                                            color={paymentMethod === "Cash" ? 'blue.700' : 'gray.700'}
                                            _hover={{bg: paymentMethod === "Cash" ? 'blue.100' : 'gray.100'}}
                                            width={{ base: "full", sm: "auto" }}
                                        >
                                            Cash
                                        </Button>
                                        <Button
                                            variant={paymentMethod === "store" ? "solid" : "outline"}
                                            onClick={() => setPaymentMethod("store")}
                                            leftIcon={<BsCheck2/>}
                                            borderColor={paymentMethod === "store" ? 'blue.500' : 'gray.200'}
                                            bg={paymentMethod === "store" ? 'blue.50' : 'white'}
                                            color={paymentMethod === "store" ? 'blue.700' : 'gray.700'}
                                            _hover={{bg: paymentMethod === "store" ? 'blue.100' : 'gray.100'}}
                                            width={{ base: "full", sm: "auto" }}
                                        >
                                            Store Credit
                                        </Button>
                                        <Button
                                            variant={paymentMethod === "other" ? "solid" : "outline"}
                                            onClick={() => setPaymentMethod("other")}
                                            leftIcon={<BsCheck2/>}
                                            borderColor={paymentMethod === "other" ? 'blue.500' : 'gray.200'}
                                            bg={paymentMethod === "other" ? 'blue.50' : 'white'}
                                            color={paymentMethod === "other" ? 'blue.700' : 'gray.700'}
                                            _hover={{bg: paymentMethod === "other" ? 'blue.100' : 'gray.100'}}
                                            width={{ base: "full", sm: "auto" }}
                                        >
                                            Other
                                        </Button>
                                    </Flex>

                                    {paymentMethod === 'store' && (
                                        <Box mt={2} p={3} bg="green.50" borderRadius="md" borderColor="green.200"
                                             borderWidth="1px">
                                            <Text fontSize="sm" color="green.700">
                                                A voucher code will be generated for the refund amount. The customer can
                                                use this voucher for future bookings.
                                            </Text>
                                        </Box>
                                    )}
                                </Box>

                                {paymentMethod === 'Credit Card' && (
                                    <Box w="full" mt={2} mb={4}>
                                        {isLoadingTransactions || loadingCardInfo ? (
                                            <Flex justify="center" py={2} borderWidth="1px" borderRadius="md" p={3}>
                                                <Spinner size="sm" mr={2}/>
                                                <Text>Loading card information...</Text>
                                            </Flex>
                                        ) : cardList && cardList.length > 0 ? (
                                            <VStack spacing={3} align="stretch">
                                                <Text fontWeight="medium">Select a card for refund:</Text>
                                                {cardList.map(card => (
                                                    <Box
                                                        key={card.id}
                                                        borderWidth="1px"
                                                        borderRadius="md"
                                                        p={3}
                                                        bg={selectedCardId === card.id ? "blue.50" : "white"}
                                                        borderColor={selectedCardId === card.id ? "blue.500" : "gray.200"}
                                                        _hover={{ borderColor: "blue.300", cursor: "pointer" }}
                                                        onClick={() => handleCardSelection(card)}
                                                    >
                                                        <Flex 
                                                            align="center" 
                                                            justify="space-between"
                                                            direction={{ base: "column", sm: "row" }}
                                                            gap={2}
                                                        >
                                                            <Flex align="center">
                                                                {card.brand?.toLowerCase() === 'visa' ? (
                                                                    <Icon as={FaCcVisa} boxSize="24px" color="blue.600" mr={2}/>
                                                                ) : card.brand?.toLowerCase() === 'mastercard' ? (
                                                                    <Icon as={FaCcMastercard} boxSize="24px" color="red.500" mr={2}/>
                                                                ) : card.brand?.toLowerCase() === 'amex' ? (
                                                                    <Icon as={FaCcAmex} boxSize="24px" color="blue.500" mr={2}/>
                                                                ) : card.brand?.toLowerCase() === 'discover' ? (
                                                                    <Icon as={FaCcDiscover} boxSize="24px" color="orange.500" mr={2}/>
                                                                ) : (
                                                                    <Icon as={FaRegCreditCard} boxSize="20px" mr={2}/>
                                                                )}
                                                                <Text fontWeight="medium">
                                                                    {card.brand || 'Card'} •••• {card.last4}
                                                                </Text>
                                                            </Flex>
                                                            <VStack align={{ base: "center", sm: "flex-end" }} spacing={0}>
                                                                <Text fontSize="sm" fontWeight="bold">
                                                                    ${card.refundableAmount?.toFixed(2)} available
                                                                </Text>
                                                                {card.refundedAmount > 0 && (
                                                                    <Text fontSize="xs" color="gray.500">
                                                                        ${card.refundedAmount.toFixed(2)} already refunded
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </Flex>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        ) : cardInfo ? (
                                            <Box
                                                borderWidth="1px"
                                                borderRadius="md"
                                                p={3}
                                                bg="white"
                                                boxShadow="sm"
                                            >
                                                <Flex align="center">
                                                    {cardInfo.brand?.toLowerCase() === 'visa' ? (
                                                        <Icon as={FaCcVisa} boxSize="24px" color="blue.600" mr={2}/>
                                                    ) : cardInfo.brand?.toLowerCase() === 'mastercard' ? (
                                                        <Icon as={FaCcMastercard} boxSize="24px" color="red.500"
                                                              mr={2}/>
                                                    ) : cardInfo.brand?.toLowerCase() === 'amex' ? (
                                                        <Icon as={FaCcAmex} boxSize="24px" color="blue.500" mr={2}/>
                                                    ) : cardInfo.brand?.toLowerCase() === 'discover' ? (
                                                        <Icon as={FaCcDiscover} boxSize="24px" color="orange.500"
                                                              mr={2}/>
                                                    ) : (
                                                        <Icon as={FaRegCreditCard} boxSize="20px" mr={2}/>
                                                    )}
                                                    <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                                                        {cardInfo.brand?.toLowerCase() === 'visa' ? 'Visa' :
                                                            cardInfo.brand?.toLowerCase() === 'mastercard' ? 'MasterCard' :
                                                                cardInfo.brand?.toLowerCase() === 'amex' ? 'American Express' :
                                                                    cardInfo.brand?.toLowerCase() === 'discover' ? 'Discover' :
                                                                        cardInfo.brand || 'Card'} •••• ••••
                                                        •••• {cardInfo.last4 || 'xxxx'}
                                                    </Text>
                                                </Flex>
                                            </Box>
                                        ) : (
                                            <Box borderWidth="1px" borderRadius="md" p={3}>
                                                <Text color="gray.500">No saved card information found</Text>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                <Box w="full">
                                    <Text mb={2}>Comment</Text>
                                    <Textarea
                                        placeholder="Cancellation reason"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </Box>
                            </VStack>

                            <VStack
                                bg="gray.100"
                                p={4}
                                borderRadius="md"
                                alignSelf="start"
                                flex="2"
                                spacing={5}
                                w={{ base: "100%", lg: "600px" }}
                            >
                                <Box w="full">
                                    <Text fontWeight="bold">Purchase Summary</Text>
                                    <VStack align="stretch" spacing={3} mt={3}>
                                        {isLoadingTierPricing || isLoadingAddons || isLoadingCustomItems ? (
                                            <Flex justify="center" py={4}>
                                                <Spinner size="sm" mr={2}/>
                                                <Text fontSize="sm" color="gray.600">Loading booking details...</Text>
                                            </Flex>
                                        ) : (
                                            <>
                                                <Flex justifyContent="space-between" 
                                                      direction={{ base: "column", sm: "row" }}
                                                      gap={{ base: 1, sm: 0 }}>
                                                    <Text fontSize={{ base: "sm", md: "md" }}>
                                                        {`Guests ($${(tierPricing && tierPricing.pricingType === 'flat'
                                                            ? tierPricing.basePrice
                                                            : guestPrice).toFixed(2)} × ${guestQuantity})`}
                                                    </Text>
                                                    <Text fontSize={{ base: "sm", md: "md" }}>${calculateGuestPrice().toFixed(2)}</Text>
                                                </Flex>

                                                {getCombinedAddons().length > 0 && (
                                                    <>
                                                        <Divider />
                                                        <Text fontWeight="semibold">Add-ons:</Text>
                                                        {getCombinedAddons().map((addon) => (
                                                            <Flex key={addon.id} justify="space-between"
                                                                  direction={{ base: "column", sm: "row" }}
                                                                  gap={{ base: 1, sm: 0 }}>
                                                                <Text fontSize={{ base: "sm", md: "md" }}>
                                                                    {addon.label || addon.name} (${addon.price.toFixed(2)} x {addon.quantity})
                                                                </Text>
                                                                <Text fontSize={{ base: "sm", md: "md" }}>
                                                                    ${(addon.price * addon.quantity).toFixed(2)}
                                                                </Text>
                                                            </Flex>
                                                        ))}
                                                        <Flex justify="space-between" mt={1}
                                                              direction={{ base: "column", sm: "row" }}
                                                              gap={{ base: 1, sm: 0 }}>
                                                            <Text fontWeight="semibold">Add-ons Subtotal</Text>
                                                            <Text fontWeight="semibold">
                                                                ${calculateAddonTotal().toFixed(2)}
                                                            </Text>
                                                        </Flex>
                                                    </>
                                                )}

                                                {customItems && customItems.length > 0 && (
                                                    <>
                                                        <Divider />
                                                        <Text fontWeight="semibold">Custom Items:</Text>
                                                        {customItems.map((item) => (
                                                            <Flex key={item.id} justify="space-between"
                                                                  direction={{ base: "column", sm: "row" }}
                                                                  gap={{ base: 1, sm: 0 }}>
                                                                <Text fontSize={{ base: "sm", md: "md" }}>
                                                                    {item.name} (${item.amount.toFixed(2)} × {item.quantity})
                                                                    {item.type === 'Discount' && ' - Discount'}
                                                                </Text>
                                                                <Text fontSize={{ base: "sm", md: "md" }}>
                                                                    {item.type === 'Discount' ? '-' : ''}
                                                                    ${(item.amount * item.quantity).toFixed(2)}
                                                                </Text>
                                                            </Flex>
                                                        ))}
                                                        <Flex justify="space-between" mt={1}
                                                              direction={{ base: "column", sm: "row" }}
                                                              gap={{ base: 1, sm: 0 }}>
                                                            <Text fontWeight="semibold">Custom Items Subtotal</Text>
                                                            <Text fontWeight="semibold">
                                                                ${calculateCustomItemsTotal().toFixed(2)}
                                                            </Text>
                                                        </Flex>
                                                    </>
                                                )}

                                                <Divider />
                                                <Flex justifyContent="space-between" mt={2}
                                                      direction={{ base: "column", sm: "row" }}
                                                      gap={{ base: 1, sm: 0 }}>
                                                    <Text fontWeight="bold">Total:</Text>
                                                    <Text fontWeight="bold">${calculateTotalPrice().toFixed(2)}</Text>
                                                </Flex>

                                                <Flex justifyContent="space-between" color="red.500"
                                                      direction={{ base: "column", sm: "row" }}
                                                      gap={{ base: 1, sm: 0 }}>
                                                    <Text>Cancellation:</Text>
                                                    <Text>-${refundAmount > 0 ? refundAmount.toFixed(2) : calculateTotalPrice().toFixed(2)}</Text>
                                                </Flex>

                                                <Divider/>
                                                <Flex justifyContent="space-between"
                                                      direction={{ base: "column", sm: "row" }}
                                                      gap={{ base: 1, sm: 0 }}>
                                                    <Text fontWeight="bold">Final Total:</Text>
                                                    <Text fontWeight="bold">
                                                        ${(calculateTotalPrice() - refundAmount).toFixed(2)}
                                                    </Text>
                                                </Flex>
                                            </>
                                        )}
                                    </VStack>
                                </Box>
                                <Box w="full">
                                    <Text fontWeight="bold">Payment Summary</Text>
                                    <VStack align="stretch" spacing={3} mt={3}>
                                        {cardInfo && (
                                            <Flex justifyContent="space-between"
                                                  direction={{ base: "column", sm: "row" }}
                                                  gap={{ base: 1, sm: 0 }}>
                                                <HStack>
                                                    {cardInfo.brand?.toLowerCase() === 'visa' ? (
                                                        <Icon as={FaCcVisa} boxSize="20px" color="blue.600"/>
                                                    ) : cardInfo.brand?.toLowerCase() === 'mastercard' ? (
                                                        <Icon as={FaCcMastercard} boxSize="20px" color="red.500"/>
                                                    ) : cardInfo.brand?.toLowerCase() === 'amex' ? (
                                                        <Icon as={FaCcAmex} boxSize="20px" color="blue.500"/>
                                                    ) : cardInfo.brand?.toLowerCase() === 'discover' ? (
                                                        <Icon as={FaCcDiscover} boxSize="20px" color="orange.500"/>
                                                    ) : (
                                                        <Icon as={FaRegCreditCard} boxSize="16px"/>
                                                    )}
                                                    <Text fontSize={{ base: "sm", md: "md" }}>
                                                        Payment {booking.dateFormatted || formatDate(new Date().toISOString())}:
                                                        {` *${cardInfo.last4 || 'xxxx'}`}
                                                    </Text>
                                                </HStack>
                                                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                                                    ${calculateTotalPrice().toFixed(2)}
                                                </Text>
                                            </Flex>
                                        )}

                                        <Flex justifyContent="space-between"
                                              direction={{ base: "column", sm: "row" }}
                                              gap={{ base: 1, sm: 0 }}>
                                            <HStack>
                                                {paymentMethod === 'Credit Card' && cardInfo ? (
                                                    <>
                                                        {cardInfo.brand?.toLowerCase() === 'visa' ? (
                                                            <Icon as={FaCcVisa} boxSize="20px" color="blue.600"/>
                                                        ) : cardInfo.brand?.toLowerCase() === 'mastercard' ? (
                                                            <Icon as={FaCcMastercard} boxSize="20px" color="red.500"/>
                                                        ) : cardInfo.brand?.toLowerCase() === 'amex' ? (
                                                            <Icon as={FaCcAmex} boxSize="20px" color="blue.500"/>
                                                        ) : cardInfo.brand?.toLowerCase() === 'discover' ? (
                                                            <Icon as={FaCcDiscover} boxSize="20px" color="orange.500"/>
                                                        ) : (
                                                            <Icon as={FaRegCreditCard} boxSize="16px"/>
                                                        )}
                                                    </>
                                                ) : paymentMethod === 'Cash' ? (
                                                    <Icon as={BsCash} boxSize="16px"/>
                                                ) : paymentMethod === 'store' ? (
                                                    <Icon as={BsCheck2} boxSize="16px"/>
                                                ) : (
                                                    <Icon as={BsCheck2} boxSize="16px"/>
                                                )}
                                                <Text color="blue.500" fontSize={{ base: "sm", md: "md" }}>
                                                    Return Payment {formatDate(new Date().toISOString())}
                                                    {paymentMethod === 'Credit Card' && cardInfo && ` *${cardInfo.last4 || 'xxxx'}`}
                                                </Text>
                                            </HStack>
                                            <Text fontWeight="bold" color="blue.500" fontSize={{ base: "sm", md: "md" }}>
                                                -${refundAmount > 0 ? refundAmount.toFixed(2) : calculateTotalPrice().toFixed(2)}
                                            </Text>
                                        </Flex>

                                        <Divider mt={4}/>
                                        <Flex justifyContent="space-between" 
                                              direction={{ base: "column", sm: "row" }}
                                              gap={{ base: 1, sm: 0 }}>
                                            <Text fontWeight="bold">Paid:</Text>
                                            <Text fontWeight="bold">
                                                ${(calculateTotalPrice() - refundAmount).toFixed(2)}
                                            </Text>
                                        </Flex>
                                    </VStack>
                                </Box>
                            </VStack>
                        </Flex>
                    </Box>
                </ModalBody>

                <ModalFooter>
                    {generatedVoucher ? (
                        <VStack w="100%" spacing={4} align="stretch">
                            <Box p={4} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                                <VStack spacing={3} align="stretch">
                                    <Text fontWeight="bold" fontSize="lg" color="green.700">
                                        Store Credit Voucher Generated
                                    </Text>
                                    <Flex justify="space-between"
                                          direction={{ base: "column", sm: "row" }}
                                          gap={{ base: 1, sm: 0 }}>
                                        <Text>Amount:</Text>
                                        <Text fontWeight="bold">${generatedVoucher.amount.toFixed(2)}</Text>
                                    </Flex>
                                    <Flex justify="space-between"
                                          direction={{ base: "column", sm: "row" }}
                                          gap={{ base: 2, sm: 0 }}
                                          align={{ base: "start", sm: "center" }}>
                                        <Text>Voucher Code:</Text>
                                        <Box
                                            bg="white"
                                            p={2}
                                            borderRadius="md"
                                            fontFamily="monospace"
                                            fontWeight="bold"
                                            fontSize={{ base: "md", md: "lg" }}
                                            boxShadow="sm"
                                            w={{ base: "full", sm: "auto" }}
                                            textAlign="center"
                                            overflowX="auto"
                                        >
                                            {generatedVoucher.code}
                                        </Box>
                                    </Flex>
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
                        <Flex 
                            width="100%" 
                            justifyContent={{ base: "center", sm: "space-between" }}
                            flexDirection={{ base: "column", sm: "row" }}
                            gap={3}
                        >
                            <Checkbox
                                isChecked={notifyCustomer}
                                onChange={(e) => setNotifyCustomer(e.target.checked)}
                            >
                                Notify Customer
                            </Checkbox>
                            <HStack spacing={3}>
                                <Button onClick={onClose} width={{ base: "full", sm: "auto" }}>Cancel</Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={handleSaveChanges}
                                    isLoading={isSubmitting}
                                    isDisabled={isLoadingTierPricing || isLoadingAddons || isLoadingCustomItems || !paymentMethod}
                                    width={{ base: "full", sm: "auto" }}
                                >
                                    Process Cancellation
                                </Button>
                            </HStack>
                        </Flex>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BookingCancellationModal;