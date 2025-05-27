import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    Divider,
    Flex,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Table,
    TableContainer,
    Text,
    Textarea,
    useDisclosure,
    useToast,
    VStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useMediaQuery,
    InputRightAddon,
} from "@chakra-ui/react";
import axios from "axios";
import {BsCash, BsCheck2} from "react-icons/bs";
import {FaRegCreditCard} from "react-icons/fa";
import {BiCheck} from "react-icons/bi";
import {format} from 'date-fns';
import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {FiChevronDown} from "react-icons/fi";
import { syncSingleReservation, syncReservationForGuides } from "../utils/calendarSync";
import { useAuth } from "../contexts/AuthContext";

const CollectPaymentModal = ({isOpen, onClose, bookingChanges, booking}) => {
    const toast = useToast();
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [tag, setTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [originalTransaction, setOriginalTransaction] = useState(null);
    const [cardInfo, setCardInfo] = useState(null);
    const [loadingCardInfo, setLoadingCardInfo] = useState(false);
    const [reservationAddons, setReservationAddons] = useState([]);
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(true);
    const [hasOriginalCardPayment, setHasOriginalCardPayment] = useState(false);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [isLoadingPendingBalance, setIsLoadingPendingBalance] = useState(true);
    const [, setTierPricing] = useState(null);
    const [isLoadingTierPricing, setIsLoadingTierPricing] = useState(true);
    const [guestPrice, setGuestPrice] = useState(0);
    const [showCardForm, setShowCardForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [, setPendingTransaction] = useState(null);
    const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
    const stripe = useStripe();
    const elements = useElements();
    
    // Add breakpoint hook for responsive layout
    const [isMobile] = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        if (isOpen) {
            fetchTransactionAndCardInfo();
            fetchAddons();
            fetchPendingTransactions();
            fetchTierPricing();
        }
    }, [isOpen, booking?.id]);

    const fetchTierPricing = async () => {
        if (!booking?.tourId) return;

        try {
            setIsLoadingTierPricing(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${booking.tourId}`,
                {
                    withCredentials: true,
                }
            );

            if (response.data && response.data.length > 0) {
                const pricingData = response.data[0];
                setTierPricing(pricingData);

                const newGuestQuantity = bookingChanges?.newGuestQuantity || booking.guestQuantity;
                const guestPrice = calculateCorrectGuestPrice(pricingData, newGuestQuantity);
                setGuestPrice(guestPrice);
            } else {
                const pricePerGuest = booking.valuePerGuest || (booking.total_price / booking.guestQuantity) || 0;
                const newGuestQuantity = bookingChanges?.newGuestQuantity || booking.guestQuantity;
                setGuestPrice(pricePerGuest * newGuestQuantity);
            }
        } catch (error) {
            const pricePerGuest = booking.valuePerGuest || (booking.total_price / booking.guestQuantity) || 0;
            const newGuestQuantity = bookingChanges?.newGuestQuantity || booking.guestQuantity;
            setGuestPrice(pricePerGuest * newGuestQuantity);
        } finally {
            setIsLoadingTierPricing(false);
        }
    };

    const calculateCorrectGuestPrice = (pricingData, guestQuantity) => {
        if (!pricingData) {
            return (booking.valuePerGuest || (booking.total_price / booking.guestQuantity) || 0) * guestQuantity;
        }

        if (pricingData.pricingType === 'flat') {
            return pricingData.basePrice * guestQuantity;
        }
        const applicableTier = pricingData.tierEntries
            ?.sort((a, b) => b.quantity - a.quantity)
            .find(tier => guestQuantity >= tier.quantity);

        return applicableTier
            ? applicableTier.price * guestQuantity
            : pricingData.basePrice * guestQuantity;
    };
    const fetchPendingTransactions = async () => {
        if (!booking?.id) return;

        setIsLoadingPendingBalance(true);
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
                filteredTransactions.forEach(transaction => {
                    if (transaction.transaction_direction === 'refund') {
                        totalPending -= transaction.amount;
                    } else {
                        totalPending += transaction.amount;
                    }
                });

                setPendingBalance(totalPending);
            }
        } catch (error) {
            console.error('Error fetching pending transactions:', error);
        } finally {
            setIsLoadingPendingBalance(false);
        }
    };

    const fetchTransactionAndCardInfo = async () => {
        try {
            setLoadingCardInfo(true);

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                {
                    withCredentials: true,
                }
            );

            if (response.data && response.data.length > 0) {
                const cardTransactions = response.data.filter(t => {
                    const isCardPayment = 
                        t.payment_method?.toLowerCase() === 'credit card' || 
                        t.payment_method?.toLowerCase() === 'card' ||
                        t.payment_method?.toLowerCase() === 'credit_card';
                    const hasPaymentId = t.paymentMethodId || t.payment_method_id || t.stripe_payment_id;

                    let hasCardInfoInMetadata = false;
                    if (t.metadata) {
                        try {
                            const meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata;
                            hasCardInfoInMetadata = meta.cardInfo || meta.paymentMethodId || 
                                                  (meta.stripe_payment_method_id) || 
                                                  (meta.payment_details?.stripe_payment_method_id);
                        } catch (e) {
                            console.error("Error parsing metadata:", e);
                        }
                    }
                    let hasCardInfoInPaymentDetails = false;
                    if (t.payment_details) {
                        try {
                            const details = typeof t.payment_details === 'string' 
                                ? JSON.parse(t.payment_details) 
                                : t.payment_details;
                            hasCardInfoInPaymentDetails = details.card_number || 
                                                        details.stripe_payment_method_id || 
                                                        details.payment_type === 'credit_card';
                        } catch (e) {
                            console.error("Error parsing payment details:", e);
                        }
                    }
                    
                    return (isCardPayment || hasPaymentId || hasCardInfoInMetadata || hasCardInfoInPaymentDetails);
                });
                
                if (cardTransactions.length > 0) {
                    setHasOriginalCardPayment(true);
                    setPaymentMethod('Credit Card');
                    const uniquePaymentMethodIds = new Set<string>();
                    
                    cardTransactions.forEach(t => {
                        if (t.paymentMethodId) uniquePaymentMethodIds.add(t.paymentMethodId);
                        if (t.payment_method_id) uniquePaymentMethodIds.add(t.payment_method_id);
                        if (t.stripe_payment_id && t.stripe_payment_id.startsWith('pm_')) {
                            uniquePaymentMethodIds.add(t.stripe_payment_id);
                        }
                        if (t.metadata) {
                            try {
                                const meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata;
                                if (meta.paymentMethodId) uniquePaymentMethodIds.add(meta.paymentMethodId);
                                if (meta.stripe_payment_method_id) uniquePaymentMethodIds.add(meta.stripe_payment_method_id);
                            } catch (e) {
                                console.error("Error parsing metadata for payment method ID:", e);
                            }
                        }
                        if (t.payment_details) {
                            try {
                                const details = typeof t.payment_details === 'string' 
                                    ? JSON.parse(t.payment_details) 
                                    : t.payment_details;
                                if (details.stripe_payment_method_id) uniquePaymentMethodIds.add(details.stripe_payment_method_id);
                            } catch (e) {
                                console.error("Error parsing payment details for payment method ID:", e);
                            }
                        }
                    });

                    if (booking.paymentMethodId) {
                        uniquePaymentMethodIds.add(booking.paymentMethodId);
                    }
                    const createTransaction = cardTransactions.find(t => t.transaction_type === 'CREATE');
                    if (createTransaction) {
                        setOriginalTransaction(createTransaction);
                    } else {
                        setOriginalTransaction(cardTransactions[0]);
                    }
                    if (uniquePaymentMethodIds.size > 0) {
                        const paymentMethods = [];

                        for (const paymentMethodId of Array.from(uniquePaymentMethodIds)) {
                            try {
                                const cardResponse = await axios.get(
                                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${paymentMethodId}`,
                                    {
                                        withCredentials: true
                                    }
                                );
                                
                                if (cardResponse.data) {
                                    paymentMethods.push({
                                        id: paymentMethodId,
                                        brand: cardResponse.data.brand,
                                        last4: cardResponse.data.last4
                                    });
                                }
                            } catch (cardError) {
                                console.error(`Error fetching card details for ${paymentMethodId}:`, cardError);

                                let cardInfo = null;
                                for (const t of cardTransactions) {
                                    if ((t.paymentMethodId === paymentMethodId || t.payment_method_id === paymentMethodId) &&
                                        t.metadata) {
                                        try {
                                            const meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata;
                                            if (meta.cardInfo) {
                                                cardInfo = meta.cardInfo;
                                                break;
                                            }
                                        } catch (e) {
                                            console.error("Error parsing metadata for card info:", e);
                                        }
                                    }
                                }
                                if (!cardInfo) {
                                    for (const t of cardTransactions) {
                                        if (t.payment_details) {
                                            try {
                                                const details = typeof t.payment_details === 'string' 
                                                    ? JSON.parse(t.payment_details) 
                                                    : t.payment_details;
                                                
                                                if (details.card_number || details.cardholder_name) {
                                                    cardInfo = {
                                                        brand: 'Card',
                                                        last4: details.card_number ? details.card_number.replace(/\*/g, '') : 'on file'
                                                    };
                                                    break;
                                                }
                                            } catch (e) {
                                                console.error("Error parsing payment details for card info:", e);
                                            }
                                        }
                                    }
                                }
                                
                                if (cardInfo) {
                                    paymentMethods.push({
                                        id: paymentMethodId,
                                        brand: cardInfo.brand || 'Card',
                                        last4: cardInfo.last4 || 'on file'
                                    });
                                } else {
                                    paymentMethods.push({
                                        id: paymentMethodId,
                                        brand: 'Card',
                                        last4: 'on file'
                                    });
                                }
                            }
                        }

                        for (const t of cardTransactions) {
                            if (t.metadata) {
                                try {
                                    const meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata;
                                    if (meta.cardInfo && meta.cardInfo.last4) {
                                        const existingCard = paymentMethods.find(
                                            card => card.last4 === meta.cardInfo.last4 && 
                                                  card.brand === (meta.cardInfo.brand || 'Card')
                                        );
                                        
                                        if (!existingCard) {
                                            const methodId = meta.paymentMethodId || 
                                                           `card_${Math.random().toString(36).substring(2, 15)}`;
                                            
                                            paymentMethods.push({
                                                id: methodId,
                                                brand: meta.cardInfo.brand || 'Card',
                                                last4: meta.cardInfo.last4
                                            });
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error parsing metadata for additional card info:", e);
                                }
                            }
                        }
                        setSavedPaymentMethods(paymentMethods);

                        if (paymentMethods.length > 0) {
                            setSelectedPaymentMethodId(paymentMethods[0].id);
                            setCardInfo(paymentMethods[0]);
                        }
                    }
                } else {
                    setHasOriginalCardPayment(false);
                    setPaymentMethod('Cash');
                }
            } else {
                setHasOriginalCardPayment(false);
                setPaymentMethod('Cash');
            }
        } catch (error) {
            console.error("Failed to fetch original transaction:", error);
            toast({
                title: "Warning",
                description: "Could not retrieve payment information.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            setHasOriginalCardPayment(false);
            setPaymentMethod('Cash');
        } finally {
            setLoadingCardInfo(false);
        }
    };

    const fetchAddons = async () => {
        if (!booking?.id) return;

        try {
            setIsLoadingAddons(true);
            const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`,
                    {
                        withCredentials: true
                    }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`,
                    {
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

    const handleCollect = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            const finalBookingChanges = {
                ...bookingChanges,
                finalAmount: bookingChanges?.finalAmount || Math.abs(bookingChanges?.priceDifference || 0),
                totalBalanceDue: bookingChanges?.totalBalanceDue || pendingBalance || 0
            };

            const isRefund = finalBookingChanges?.isRefund || finalBookingChanges?.priceDifference < 0;
            const finalBalance = calculateFinalBalance();
            const amountToCharge = Math.abs(finalBalance);

            if (paymentMethod === 'Credit Card') {
                const pendingTransactionsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                    {
                        withCredentials: true,
                        params: {payment_status: 'pending'}
                    }
                );

                const pendingTransactions = pendingTransactionsResponse.data;
                const currentPendingTransaction = pendingTransactions?.find(t =>
                    t.transaction_type !== 'CREATE'
                );

                if (!currentPendingTransaction) {
                    toast({
                        title: "Error",
                        description: "No pending transaction found for this booking.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsLoading(false);
                    return;
                }

                setPendingTransaction(currentPendingTransaction);
                const transactionMetadata = {
                    ...currentPendingTransaction.metadata,
                    originalGuestQuantity: finalBookingChanges.originalGuestQuantity,
                    newGuestQuantity: finalBookingChanges.newGuestQuantity,
                    originalPrice: finalBookingChanges.originalPrice,
                    newPrice: finalBookingChanges.newPrice,
                    totalBalanceDue: finalBookingChanges.totalBalanceDue,
                    isRefund: isRefund,
                    tag: tag || null,
                    notifyCustomer: notifyCustomer,
                    processedAt: new Date().toISOString()
                };
                const setupIntentResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/create-setup-intent-for-transaction`,
                    {
                        transactionId: currentPendingTransaction.id
                    },
                    {
                        withCredentials: true
                    }
                );

                if (!setupIntentResponse.data || !setupIntentResponse.data.clientSecret) {
                    throw new Error("Failed to create setup intent");
                }

                const {clientSecret} = setupIntentResponse.data;
                let paymentMethodId = null;

                if (!showCardForm && selectedPaymentMethodId) {
                    paymentMethodId = selectedPaymentMethodId;

                    await axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${currentPendingTransaction.id}`,
                        {
                            paymentMethodId: paymentMethodId,
                            payment_method: 'Credit Card',
                            amount: amountToCharge,
                            metadata: transactionMetadata
                        },
                        {
                            withCredentials: true
                        }
                    );
                } else {
                    if (!stripe || !elements) {
                        setErrorMessage("Stripe is not initialized properly");
                        setIsLoading(false);
                        return;
                    }

                    const cardElement = elements.getElement(CardElement);
                    if (!cardElement) {
                        setErrorMessage("Card element is not available");
                        setIsLoading(false);
                        return;
                    }

                    const paymentMethodResult = await stripe.confirmCardSetup(clientSecret, {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                name: booking.user?.name || booking.username || 'Customer',
                                email: booking.user?.email || booking.email || '',
                            },
                        },
                    });

                    if (paymentMethodResult.error) {
                        setErrorMessage(`Payment failed: ${paymentMethodResult.error.message}`);
                        setIsLoading(false);
                        return;
                    }

                    paymentMethodId = paymentMethodResult.setupIntent.payment_method;

                    await axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${currentPendingTransaction.id}`,
                        {
                            paymentMethodId: paymentMethodId,
                            payment_method: 'Credit Card',
                            amount: amountToCharge,
                            metadata: transactionMetadata
                        },
                        {
                            withCredentials: true
                        }
                    );
                }

                const processPaymentResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/process-transaction-payment`,
                    {
                        transactionId: currentPendingTransaction.id
                    },
                    {
                        withCredentials: true
                    }
                );

                if (!processPaymentResponse.data || processPaymentResponse.data.error) {
                    throw new Error(processPaymentResponse.data?.error || "Failed to process payment");
                }

                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${currentPendingTransaction.id}`,
                    {
                        payment_status: 'completed',
                        payment_method: 'Credit Card',
                        paymentMethodId: paymentMethodId,
                        paymentIntentId: processPaymentResponse.data.paymentIntentId,
                        setupIntentId: processPaymentResponse.data.setupIntentId,
                        metadata: {
                            ...transactionMetadata,
                            paymentProcessedAt: new Date().toISOString(),
                            processed: true
                        }
                    },
                    {
                        withCredentials: true
                    }
                );

                const bookingResponse = await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                    {
                        guestQuantity: finalBookingChanges.newGuestQuantity,
                        total_price: finalBookingChanges.newPrice,
                        status: booking.status
                    },
                    {
                        withCredentials: true
                    }
                );

                if (bookingResponse.data) {
                    try {
                        const { currentUser } = useAuth();
                        const userIdFromAuth = currentUser?.id;

                        if (userIdFromAuth) {
                            await syncSingleReservation(booking.id, userIdFromAuth);
                        } else {
                            console.warn("CollectPaymentModal: User ID not available from auth. Calendar sync skipped for user.");
                        }
                        await syncReservationForGuides(booking.id);
                    } catch (syncError) {
                        console.error("Error syncing calendar:", syncError);
                    }

                    toast({
                        title: "Success",
                        description: "Payment collected and booking updated successfully.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    window.location.reload();
                    onClose();
                }
            } else if (paymentMethod === 'Cash' || paymentMethod === 'Check' || paymentMethod === 'Other') {
                const pendingTransactionsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                    {
                        withCredentials: true,
                        params: {payment_status: 'pending'}
                    }
                );

                const pendingTransactions = pendingTransactionsResponse.data;
                const pendingTransaction = pendingTransactions?.find(t =>
                    t.transaction_type !== 'CREATE'
                );

                if (pendingTransaction) {
                    await axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${pendingTransaction.id}`,
                        {
                            payment_method: paymentMethod,
                            payment_status: 'completed',
                            transaction_direction: isRefund ? 'refund' : 'charge',
                            metadata: {
                                ...pendingTransaction.metadata,
                                originalGuestQuantity: finalBookingChanges.originalGuestQuantity,
                                newGuestQuantity: finalBookingChanges.newGuestQuantity,
                                originalPrice: finalBookingChanges.originalPrice,
                                newPrice: finalBookingChanges.newPrice,
                                totalBalanceDue: finalBookingChanges.totalBalanceDue,
                                isRefund: isRefund,
                                tag: tag || null,
                                notifyCustomer: notifyCustomer,
                                processedAt: new Date().toISOString()
                            }
                        },
                        {
                            withCredentials: true
                        }
                    );

                    await axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                        {
                            guestQuantity: finalBookingChanges.newGuestQuantity,
                            total_price: finalBookingChanges.newPrice,
                            status: booking.status
                        },
                        {
                            withCredentials: true
                        }
                    );

                    toast({
                        title: "Success",
                        description: isRefund ? "Refund processed successfully." : "Payment collected successfully.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    window.location.reload();
                    onClose();
                } else {
                    toast({
                        title: "Error",
                        description: "No pending transaction found for this booking.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } else {
                const transactionResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`,
                    {
                        bookingId: booking.id,
                        amount: finalBookingChanges.finalAmount,
                        payment_method: paymentMethod,
                        tag: tag || null,
                        notifyCustomer: notifyCustomer,
                        type: isRefund ? 'GUEST_QUANTITY_REFUND' : 'GUEST_QUANTITY_CHANGE',
                        transaction_direction: isRefund ? 'refund' : 'charge',
                        metadata: {
                            originalGuestQuantity: finalBookingChanges.originalGuestQuantity,
                            newGuestQuantity: finalBookingChanges.newGuestQuantity,
                            originalPrice: finalBookingChanges.originalPrice,
                            newPrice: finalBookingChanges.newPrice,
                            totalBalanceDue: finalBookingChanges.totalBalanceDue,
                            isRefund: isRefund
                        }
                    },
                    {
                        withCredentials: true
                    }
                );

                const bookingResponse = await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`,
                    {
                        guestQuantity: finalBookingChanges.newGuestQuantity,
                        total_price: finalBookingChanges.newPrice,
                        status: booking.status
                    },
                    {
                        withCredentials: true
                    }
                );

                if (transactionResponse.data && bookingResponse.data) {
                    toast({
                        title: "Success",
                        description: "Payment collected and booking updated successfully.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    window.location.reload();
                    onClose();
                }
            }
        } catch (error) {
            console.error("Failed to collect payment:", error);
            toast({
                title: "Error",
                description: "Failed to collect payment. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLater = () => {
        onClose();
    };
    const combinedAddons = allAddons.reduce((acc, addon) => {
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

    const calculateFinalBalance = () => {
        const totalBalance = bookingChanges?.totalBalanceDue !== undefined
            ? bookingChanges.totalBalanceDue
            : pendingBalance || 0;

        return isNaN(totalBalance) ? 0 : totalBalance;
    };
    const addonsTotalPrice = combinedAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity),
        0
    );
    const totalPrice = guestPrice + addonsTotalPrice;

    const finalBalance = calculateFinalBalance();
    const isDataLoading = loadingCardInfo || isLoadingAddons || isLoadingPendingBalance || isLoadingTierPricing;

    const newGuestQuantity = bookingChanges?.newGuestQuantity || booking.guestQuantity;
    const pricePerGuest = newGuestQuantity > 0 ? guestPrice / newGuestQuantity : 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "4xl"}>
            <ModalOverlay/>
            <ModalContent margin={isMobile ? 0 : "auto"} borderRadius={isMobile ? 0 : "md"}>
                <ModalHeader textAlign="center">
                    {finalBalance < 0 ? "Process Refund" : "Collect Payment"}
                </ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Flex direction={isMobile ? "column" : "row"} gap={isMobile ? 4 : 0}>
                        <Box flex="1" mr={isMobile ? 0 : 4} mb={isMobile ? 4 : 0}>
                            <Text mb={2}>Amount</Text>
                            <InputGroup mb={4}>
                                <InputLeftElement pointerEvents="none">$</InputLeftElement>
                                <Input value={(bookingChanges?.priceDifference || 0).toFixed(2)} readOnly/>
                            </InputGroup>

                            <Text mb={2}>Payment Method</Text>
                            <Flex 
                                mb={4} 
                                gap={2} 
                                flexWrap={isMobile ? "wrap" : "nowrap"}
                                justifyContent={isMobile ? "space-between" : "flex-start"}
                            >
                                <Button
                                    size={isMobile ? "xs" : "sm"}
                                    variant={paymentMethod === 'Credit Card' ? 'solid' : 'outline'}
                                    onClick={() => setPaymentMethod('Credit Card')}
                                    leftIcon={<FaRegCreditCard/>}
                                    flex={isMobile ? "1 0 48%" : "0 1 auto"}
                                >
                                    Credit Card
                                </Button>
                                <Button
                                    size={isMobile ? "xs" : "sm"}
                                    variant={paymentMethod === 'Cash' ? 'solid' : 'outline'}
                                    onClick={() => setPaymentMethod('Cash')}
                                    leftIcon={<BsCash/>}
                                    flex={isMobile ? "1 0 48%" : "0 1 auto"}
                                >
                                    Cash
                                </Button>
                                <Button
                                    size={isMobile ? "xs" : "sm"}
                                    variant={paymentMethod === 'Check' ? 'solid' : 'outline'}
                                    onClick={() => setPaymentMethod('Check')}
                                    leftIcon={<BiCheck/>}
                                    flex={isMobile ? "1 0 48%" : "0 1 auto"}
                                >
                                    Check
                                </Button>
                                <Button
                                    size={isMobile ? "xs" : "sm"}
                                    variant={paymentMethod === 'Other' ? 'solid' : 'outline'}
                                    onClick={() => setPaymentMethod('Other')}
                                    leftIcon={<BsCheck2/>}
                                    flex={isMobile ? "1 0 48%" : "0 1 auto"}
                                >
                                    Other
                                </Button>
                            </Flex>

                            {paymentMethod === 'Credit Card' && (
                                <Box mt={2} mb={4} p={3} borderWidth="1px" borderRadius="md">
                                    {loadingCardInfo ? (
                                        <Flex justify="center" py={2}>
                                            <Spinner size="sm" mr={2}/>
                                            <Text>Loading card information...</Text>
                                        </Flex>
                                    ) : savedPaymentMethods.length > 0 && !showCardForm ? (
                                        <VStack align="stretch" spacing={3}>
                                            <Text fontWeight="medium">Saved Cards</Text>
                                            {savedPaymentMethods.length > 0 && !showCardForm && (
                                                <Menu>
                                                    <MenuButton
                                                        as={Box}
                                                        p={2}
                                                        borderWidth="1px"
                                                        borderRadius="md"
                                                        borderColor="gray.200"
                                                        bg="white"
                                                        cursor="pointer"
                                                        _hover={{ borderColor: "blue.300", bg: "blue.50" }}
                                                    >
                                                        <Flex align="center" justify="space-between">
                                                            <Flex align="center">
                                                                <Icon as={FaRegCreditCard} mr={2} />
                                                                <Text fontSize={isMobile ? "sm" : "md"}>
                                                                    {selectedPaymentMethodId
                                                                        ? `${cardInfo.brand || "Card"} •••• ${cardInfo.last4}`
                                                                        : "Select a card"}
                                                                </Text>
                                                            </Flex>
                                                            <Icon as={FiChevronDown} ml={2} />
                                                        </Flex>
                                                    </MenuButton>
                                                    <MenuList>
                                                        {savedPaymentMethods.map((card) => (
                                                            <MenuItem
                                                                key={card.id}
                                                                onClick={() => {
                                                                    setSelectedPaymentMethodId(card.id);
                                                                    setCardInfo(card);
                                                                }}
                                                                _hover={{ bg: "blue.50" }}
                                                            >
                                                                <Flex align="center" justify="space-between" w="100%">
                                                                    <Flex align="center">
                                                                        <Icon as={FaRegCreditCard} mr={2} />
                                                                        <Text fontSize={isMobile ? "sm" : "md"}>
                                                                            {card.brand || "Card"} •••• {card.last4}
                                                                        </Text>
                                                                    </Flex>
                                                                    {selectedPaymentMethodId === card.id && (
                                                                        <Icon as={BsCheck2} color="green.500" boxSize={5} />
                                                                    )}
                                                                </Flex>
                                                            </MenuItem>
                                                        ))}
                                                    </MenuList>
                                                </Menu>
                                            )}
                                            <Button 
                                                size={isMobile ? "sm" : "sm"} 
                                                onClick={() => setShowCardForm(true)} 
                                                leftIcon={<FaRegCreditCard />}
                                            >
                                                Use a different card
                                            </Button>
                                        </VStack>
                                    ) : (
                                        <VStack align="stretch" spacing={3}>
                                            <Text fontWeight="medium">Enter card details</Text>
                                            <Box
                                                p={2}
                                                borderWidth="1px"
                                                borderRadius="md"
                                                borderColor="gray.300"
                                            >
                                                <CardElement
                                                    options={{
                                                        hidePostalCode: true,
                                                        style: {
                                                            base: {
                                                                iconColor: '#0c0e0e',
                                                                color: '#000',
                                                                fontWeight: '500',
                                                                fontFamily: 'Arial, sans-serif',
                                                                fontSize: isMobile ? '14px' : '16px',
                                                                fontSmoothing: 'antialiased',
                                                                '::placeholder': {
                                                                    color: '#aab7c4',
                                                                },
                                                            },
                                                            invalid: {
                                                                color: '#9e2146',
                                                                iconColor: '#fa755a',
                                                            },
                                                        },
                                                    }}
                                                />
                                            </Box>
                                            {savedPaymentMethods.length > 0 && (
                                                <Button size={isMobile ? "sm" : "sm"} onClick={() => setShowCardForm(false)}>
                                                    Use saved card
                                                </Button>
                                            )}
                                            {errorMessage && (
                                                <Text color="red.500" fontSize={isMobile ? "xs" : "sm"}>{errorMessage}</Text>
                                            )}
                                        </VStack>
                                    )}
                                </Box>
                            )}

                            <Text mb={2}>Tag</Text>
                            <Input
                                placeholder="Add a tag"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                size={isMobile ? "sm" : "md"}
                            />
                        </Box>

                        <Box flex="1" w={isMobile ? "100%" : "auto"}>
                            <VStack
                                bg="gray.50"
                                p={isMobile ? 3 : 4}
                                borderRadius="md"
                                borderWidth="1px"
                                spacing={4}
                                align="stretch"
                                w="100%"
                                minH={isMobile ? "auto" : "300px"}
                                maxH={isMobile ? "none" : "400px"}
                                overflowY={isMobile ? "visible" : "auto"}
                            >
                                {isDataLoading ? (
                                    <HStack justifyContent="center">
                                        <Spinner size="sm"/>
                                        <Text>Loading...</Text>
                                    </HStack>
                                ) : (
                                    <>
                                        <Box>
                                            <Text fontWeight="bold" mb={2} fontSize={isMobile ? "sm" : "md"}>Purchase Summary</Text>
                                            <VStack align="stretch" spacing={2}>
                                                <HStack justify="space-between">
                                                    <Text fontSize={isMobile ? "sm" : "md"}>
                                                        {`Guests ($${pricePerGuest.toFixed(2)} × ${newGuestQuantity})`}
                                                    </Text>
                                                    <Text fontSize={isMobile ? "sm" : "md"}>${guestPrice.toFixed(2)}</Text>
                                                </HStack>
                                            </VStack>

                                            {combinedAddons.length > 0 ? (
                                                combinedAddons.map((addon) => (
                                                    <HStack key={addon.id} justifyContent="space-between">
                                                        <Text fontSize={isMobile ? "sm" : "md"}>
                                                            {addon.label || 'Add-on'} (${addon.price} x {addon.quantity})
                                                        </Text>
                                                        <Text fontSize={isMobile ? "sm" : "md"}>
                                                            ${(addon.price * addon.quantity).toFixed(2)}
                                                        </Text>
                                                    </HStack>
                                                ))
                                            ) : (
                                                <Text fontSize={isMobile ? "sm" : "md"}>No add-ons selected.</Text>
                                            )}

                                            <Divider my={2}/>
                                            <HStack justify="space-between">
                                                <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>Total</Text>
                                                <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>${totalPrice.toFixed(2)}</Text>
                                            </HStack>

                                            {calculateFinalBalance() !== 0 && (
                                                <HStack justify="space-between" mt={2}>
                                                    <Text fontWeight="bold"
                                                          fontSize={isMobile ? "sm" : "md"}
                                                          color={calculateFinalBalance() < 0 ? "green.500" : "red.500"}>
                                                        {calculateFinalBalance() < 0 ? "Refund Due" : "Balance Due"}
                                                    </Text>
                                                    <Text fontWeight="bold"
                                                          fontSize={isMobile ? "sm" : "md"}
                                                          color={calculateFinalBalance() < 0 ? "green.500" : "red.500"}>
                                                        ${Math.abs(calculateFinalBalance()).toFixed(2)}
                                                    </Text>
                                                </HStack>
                                            )}
                                        </Box>

                                        <Divider/>

                                        <Box>
                                            <Text fontWeight="bold" mb={2} fontSize={isMobile ? "sm" : "md"}>Payment Summary</Text>
                                            {cardInfo && (
                                                <HStack justify="space-between">
                                                    <HStack spacing={2}>
                                                        <Box as="span" role="img" aria-label="Card Icon" fontSize={isMobile ? "md" : "lg"}>
                                                            💳
                                                        </Box>
                                                        <Text fontSize={isMobile ? "sm" : "md"}>
                                                            Original Payment
                                                            <Box
                                                                as="span"
                                                                bg="white"
                                                                px={1}
                                                                py={1}
                                                                borderRadius="md"
                                                                boxShadow="sm"
                                                                ml={1}
                                                                fontSize={isMobile ? "xs" : "sm"}
                                                            >
                                                                *{cardInfo.last4}
                                                            </Box>
                                                        </Text>
                                                    </HStack>
                                                    <Text fontSize={isMobile ? "sm" : "md"}>${booking.total_price.toFixed(2)}</Text>
                                                </HStack>
                                            )}
                                            <HStack justify="space-between" mt={2}>
                                                <Text fontSize={isMobile ? "sm" : "md"}>Paid</Text>
                                                <Text fontSize={isMobile ? "sm" : "md"}>${booking.total_price.toFixed(2)}</Text>
                                            </HStack>

                                            <HStack justify="space-between"
                                                    color={calculateFinalBalance() < 0 ? "green.500" : "red.500"} 
                                                    fontWeight="bold"
                                                    mt={2}>
                                                <Text fontSize={isMobile ? "sm" : "md"}>
                                                    {calculateFinalBalance() < 0 ? "Refund:" : "Balance Due:"}
                                                </Text>
                                                <Text fontSize={isMobile ? "sm" : "md"}>
                                                    ${Math.abs(calculateFinalBalance()).toFixed(2)}
                                                </Text>
                                            </HStack>

                                            <HStack justify="space-between" fontWeight="bold" mt={2}>
                                                <Text fontSize={isMobile ? "sm" : "md"}>Final Total:</Text>
                                                <Text fontSize={isMobile ? "sm" : "md"}>${totalPrice.toFixed(2)}</Text>
                                            </HStack>
                                        </Box>
                                    </>
                                )}
                            </VStack>
                        </Box>
                    </Flex>
                </ModalBody>
                <ModalFooter flexDirection={isMobile ? "column" : "row"} gap={isMobile ? 2 : 0}>
                    <Flex width="100%" justifyContent="space-between" alignItems={isMobile ? "stretch" : "center"} flexDirection={isMobile ? "column" : "row"} gap={isMobile ? 2 : 0}>
                        <Checkbox 
                            isChecked={notifyCustomer} 
                            onChange={(e) => setNotifyCustomer(e.target.checked)}
                            mb={isMobile ? 2 : 0}
                        >
                            Notify Customer
                        </Checkbox>
                        <HStack spacing={2} width={isMobile ? "100%" : "auto"}>
                            <Button 
                                colorScheme="gray" 
                                onClick={handleLater}
                                flex={isMobile ? 1 : "auto"}
                            >
                                Later
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleCollect}
                                isLoading={isLoading}
                                loadingText="Processing"
                                isDisabled={(paymentMethod === 'Credit Card' && savedPaymentMethods.length === 0 && !showCardForm) || 
                                           (paymentMethod === 'Credit Card' && showCardForm && !stripe)}
                                flex={isMobile ? 1 : "auto"}
                            >
                                {calculateFinalBalance() < 0 ? "Refund" : "Collect"}
                            </Button>
                        </HStack>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const CollectInvoiceModal = ({isOpen, onClose, bookingChanges, booking}) => {
    const toast = useToast();
    const [tag, setTag] = useState('');
    const [message, setMessage] = useState('');
    const [daysBeforeArrival, setDaysBeforeArrival] = useState(0);
    const [daysInputValue, setDaysInputValue] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    
    const [isMobile] = useMediaQuery("(max-width: 768px)");

    const getBookingDate = () => {
        try {
            if (booking.reservation_date) {
                const dateParts = booking.reservation_date.split('T')[0].split('-');
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);

                return new Date(year, month, day);
            } else if (booking.selectedDate) {
                const dateParts = booking.selectedDate.split('T')[0].split('-');
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);

                return new Date(year, month, day);
            } else if (booking.dateFormatted) {
                try {
                    const parts = booking.dateFormatted.split(' ');
                    const month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
                        .indexOf(parts[0].toLowerCase());
                    const day = parseInt(parts[1].replace(',', ''), 10);
                    const year = parseInt(parts[2], 10);

                    return new Date(year, month, day);
                } catch (e) {
                    return new Date(booking.dateFormatted);
                }
            } else if (booking.date) {
                return new Date(booking.date);
            } else if (booking.tourDate) {
                return new Date(booking.tourDate);
            } else {
                console.warn("No date found in booking, using current date");
                return new Date();
            }
        } catch (e) {
            console.error("Error parsing booking date:", e);
            return new Date();
        }
    };

    const bookingDate = getBookingDate();
    const calculateDueDate = () => {
        const year = bookingDate.getFullYear();
        const month = bookingDate.getMonth();
        const day = bookingDate.getDate();
        const localDate = new Date(year, month, day);
        const days = daysInputValue === '' ? 0 : parseInt(daysInputValue, 10);
        localDate.setDate(localDate.getDate() - days);

        return localDate;
    };

    const dueDate = calculateDueDate();
    const formattedDueDate = format(dueDate, 'MMMM d, yyyy');
    const formattedBookingDate = format(bookingDate, 'MMMM d, yyyy');
    
    const handleDaysChange = (e) => {
        const value = e.target.value;
        setDaysInputValue(value);
        
        if (value === '') {
            setDaysBeforeArrival(0);
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
                setDaysBeforeArrival(numValue);
            }
        }
    };
    
    const handleSendInvoice = async () => {
        try {
            setIsLoading(true);

            const isRefund = bookingChanges?.isRefund || bookingChanges?.priceDifference < 0;

            const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                    bookingId: booking.id,
                    amount: bookingChanges.finalAmount,
                    payment_method: 'INVOICE',
                    type: isRefund ? 'GUEST_QUANTITY_REFUND' : 'GUEST_QUANTITY_CHANGE',
                    transaction_direction: isRefund ? 'refund' : 'charge',
                    notifyCustomer: true,
                    tag: tag || null,
                    message: message || null,
                    dueDate: dueDate.toISOString(),
                    metadata: {
                        originalGuestQuantity: bookingChanges.originalGuestQuantity,
                        newGuestQuantity: bookingChanges.newGuestQuantity,
                        originalPrice: bookingChanges.originalPrice,
                        newPrice: bookingChanges.newPrice,
                        totalBalanceDue: bookingChanges.totalBalanceDue,
                        isRefund: isRefund
                    }
                },
                {
                    withCredentials: true,
                });
            const bookingResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status
            }, {
                withCredentials: true,
            });

            if (transactionResponse.data && bookingResponse.data) {
                try {
                    const { currentUser } = useAuth();
                    const userIdFromAuth = currentUser?.id;

                    if (userIdFromAuth) {
                        await syncSingleReservation(booking.id, userIdFromAuth);
                    } else {
                         console.warn("CollectInvoiceModal: User ID not available from auth. Calendar sync skipped for user.");
                    }
                    await syncReservationForGuides(booking.id);
                } catch (syncError) {
                    console.error("Error syncing calendar:", syncError);
                }

                toast({
                    title: "Success",
                    description: "Invoice sent and booking updated successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                window.location.reload();
                onClose();
            }
        } catch (error) {
            console.error("Failed to send invoice:", error);
            toast({
                title: "Error",
                description: "Failed to send invoice. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "lg"}>
            <ModalOverlay/>
            <ModalContent margin={isMobile ? 0 : "auto"} borderRadius={isMobile ? 0 : "md"}>
                <ModalHeader textAlign="center">Collect Payment via Invoice</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text mb={2}>Amount</Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">$</InputLeftElement>
                                <Input 
                                    value={bookingChanges?.priceDifference.toFixed(2)} 
                                    readOnly
                                    size={isMobile ? "sm" : "md"}
                                />
                            </InputGroup>
                        </Box>

                        <Box>
                            <Text mb={2}>Payment due</Text>
                            {isMobile ? (
                                <VStack align="stretch" spacing={2}>
                                    <InputGroup size="sm">
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={daysInputValue}
                                            onChange={handleDaysChange}
                                            placeholder="Days"
                                            mb={2}
                                        />
                                        <InputRightAddon children="days" />
                                    </InputGroup>
                                    <Text fontSize="sm" color="gray.600">
                                        before arrival (due on {formattedDueDate})
                                    </Text>
                                </VStack>
                            ) : (
                                <Flex align="center">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={daysInputValue}
                                        onChange={handleDaysChange}
                                        placeholder="Days"
                                        width="60px"
                                        mr={2}
                                    />
                                    <Text mr={2}>days before arrival (due on {formattedDueDate})</Text>
                                </Flex>
                            )}
                        </Box>

                        <Box>
                            <Text color="gray.500" fontSize={isMobile ? "xs" : "sm"}>
                                Reservation date: {formattedBookingDate}
                            </Text>
                        </Box>

                        <Box>
                            <Text mb={2}>Message</Text>
                            <Textarea
                                placeholder="Optional message to include in invoice"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                height="120px"
                                size={isMobile ? "sm" : "md"}
                            />
                        </Box>

                        <Box>
                            <Text mb={2}>Tag</Text>
                            <Input
                                placeholder="Add a tag"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                size={isMobile ? "sm" : "md"}
                            />
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter flexDirection={isMobile ? "column" : "row"} gap={isMobile ? 2 : 0}>
                    <Button 
                        variant="outline" 
                        mr={isMobile ? 0 : 3} 
                        mb={isMobile ? 2 : 0}
                        onClick={onClose}
                        width={isMobile ? "100%" : "auto"}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSendInvoice}
                        isLoading={isLoading}
                        loadingText="Sending"
                        width={isMobile ? "100%" : "auto"}
                    >
                        Send Invoice
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const CollectBalanceModal = ({isOpen, onClose, bookingChanges, booking}) => {
    const toast = useToast();
    const {isOpen: isPaymentModalOpen, onOpen: onPaymentModalOpen, onClose: onPaymentModalClose} = useDisclosure();
    const {isOpen: isInvoiceModalOpen, onOpen: onInvoiceModalOpen, onClose: onInvoiceModalClose} = useDisclosure();

    const [isMobile] = useMediaQuery("(max-width: 768px)");

    const handleCollectNow = () => {
        onClose();
        onPaymentModalOpen();
    };

    const handleCollectViaInvoice = () => {
        onClose();
        onInvoiceModalOpen();
    };

    const handleCollectLater = async () => {
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "4xl"}>
                <ModalOverlay/>
                <ModalContent margin={isMobile ? 0 : "auto"} borderRadius={isMobile ? 0 : "md"}>
                    <ModalHeader textAlign="center">
                        {bookingChanges?.isRefund
                            ? "How Do You Want To Process Refund?"
                            : "How Do You Want To Collect Balance?"}
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box
                                as="button"
                                p={isMobile ? 3 : 4}
                                borderWidth="1px"
                                borderRadius="md"
                                onClick={handleCollectNow}
                                _hover={{bg: "gray.50"}}
                            >
                                <Flex align="center">
                                    <Icon as={FaRegCreditCard} boxSize={isMobile ? 4 : 5} mr={4}/>
                                    <Box textAlign="left">
                                        <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>
                                            {bookingChanges?.isRefund
                                                ? "Process Refund Now"
                                                : "Collect Balance Now"}
                                        </Text>
                                        <Text fontSize={isMobile ? "xs" : "sm"}>
                                            Use standard methods of {bookingChanges?.isRefund
                                            ? "processing refund"
                                            : "collecting balance"}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>

                            <Box
                                as="button"
                                p={isMobile ? 3 : 4}
                                borderWidth="1px"
                                borderRadius="md"
                                onClick={handleCollectViaInvoice}
                                _hover={{bg: "gray.50"}}
                            >
                                <Flex align="center">
                                    <Icon as={BsCheck2} boxSize={isMobile ? 4 : 5} mr={4}/>
                                    <Box textAlign="left">
                                        <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>
                                            {bookingChanges?.isRefund
                                                ? "Process Refund via Invoice"
                                                : "Collect Balance via Invoice"}
                                        </Text>
                                        <Text fontSize={isMobile ? "xs" : "sm"}>Send an invoice to the organizer</Text>
                                    </Box>
                                </Flex>
                            </Box>

                            <Box
                                as="button"
                                p={isMobile ? 3 : 4}
                                borderWidth="1px"
                                borderRadius="md"
                                onClick={handleCollectLater}
                                _hover={{bg: "gray.50"}}
                            >
                                <Flex align="center">
                                    <Icon as={BsCash} boxSize={isMobile ? 4 : 5} mr={4}/>
                                    <Box textAlign="left">
                                        <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>
                                            {bookingChanges?.isRefund
                                                ? "Process Refund Later"
                                                : "Collect Balance Later"}
                                        </Text>
                                        <Text fontSize={isMobile ? "xs" : "sm"}>
                                            {bookingChanges?.isRefund
                                                ? "Process refund"
                                                : "Collect balance"} later
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            colorScheme="blue" 
                            variant="outline" 
                            onClick={onClose}
                            width={isMobile ? "100%" : "auto"}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <CollectPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={onPaymentModalClose}
                bookingChanges={bookingChanges}
                booking={booking}
            />

            <CollectInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={onInvoiceModalClose}
                bookingChanges={bookingChanges}
                booking={booking}
            />
        </>
    );
};

const ChangeGuestQuantityModal = ({isOpen, onClose, booking, guestCount, setGuestCount}) => {
    const [tierPricing, setTierPricing] = useState(null);
    const [bookingChanges, setBookingChanges] = useState(null);
    const [changesConfirmed, setChangesConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [isLoadingPendingBalance, setIsLoadingPendingBalance] = useState(true);
    const [cardDetails, setCardDetails] = useState(null);
    const [isLoadingCardDetails, setIsLoadingCardDetails] = useState(true);
    const [reservationAddons, setReservationAddons] = useState([]);
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(true);
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const toast = useToast();
    const {
        isOpen: isCollectBalanceOpen,
        onOpen: onCollectBalanceOpen,
        onClose: onCollectBalanceClose
    } = useDisclosure();

    const [isMobile] = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        const fetchTierPricing = async () => {
            if (!booking?.tourId) return;

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${booking.tourId}`,
                    {
                        withCredentials: true,
                    }
                );

                if (response.data && response.data.length > 0) {
                    setTierPricing(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching tier pricing:', error);
            }
        };

        const fetchPendingTransactions = async () => {
            if (!booking?.id) return;

            setIsLoadingPendingBalance(true);
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
                    filteredTransactions.forEach(transaction => {
                        if (transaction.transaction_direction === 'refund') {
                            totalPending -= transaction.amount;
                        } else {
                            totalPending += transaction.amount;
                        }
                    });

                    setPendingBalance(totalPending);
                }
            } catch (error) {
                console.error('Error fetching pending transactions:', error);
            } finally {
                setIsLoadingPendingBalance(false);
            }
        };

        const fetchCardDetails = async () => {
            if (!booking?.paymentMethodId) {
                setIsLoadingCardDetails(false);
                return;
            }
            setIsLoadingCardDetails(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${booking.paymentMethodId}`,
                    {
                        withCredentials: true,
                    }
                );
                setCardDetails(response.data);
            } catch (error) {
                console.error("Failed to fetch card details:", error);
            } finally {
                setIsLoadingCardDetails(false);
            }
        };

        const fetchAddons = async () => {
            if (!booking?.id || !booking.tourId) return;

            setIsLoadingAddons(true);
            try {
                const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`,
                        {
                            withCredentials: true,
                        }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`,
                        {
                            withCredentials: true,
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

        if (isOpen) {
            setGuestCount(booking.guestQuantity);
            setChangesConfirmed(false);
            setBookingChanges(null);
            fetchTierPricing();
            fetchPendingTransactions();
            fetchCardDetails();
            fetchAddons();
        }
    }, [setGuestCount, isOpen, booking]);

    const calculateGuestPrice = () => {
        if (!tierPricing) {
            return (booking.valuePerGuest || booking.tour?.price || 0) * guestCount;
        }

        if (tierPricing.pricingType === 'flat') {
            return tierPricing.basePrice * guestCount;
        }

        const applicableTier = tierPricing.tierEntries
            .sort((a, b) => b.quantity - a.quantity)
            .find(tier => guestCount >= tier.quantity);

        return applicableTier
            ? applicableTier.price * guestCount
            : tierPricing.basePrice * guestCount;
    };

    const calculatePricePerGuest = (quantity) => {
        if (!tierPricing) {
            return booking.valuePerGuest || booking.tour?.price || 300;
        }

        if (tierPricing.pricingType === 'flat') {
            return tierPricing.basePrice;
        }

        const applicableTier = tierPricing.tierEntries
            .sort((a, b) => b.quantity - a.quantity)
            .find(tier => quantity >= tier.quantity);

        return applicableTier
            ? applicableTier.price
            : tierPricing.basePrice;
    };

    const handleIncrease = () => setGuestCount(guestCount + 1);
    const handleDecrease = () => {
        if (guestCount > 1) setGuestCount(guestCount - 1);
    };
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    };

    function formatDateToAmerican(date) {
        if (!date) return '';
        const [year, month, day] = date.split("-");
        return `${month}/${day}/${year}`;
    }

    const guestTotalPrice = calculateGuestPrice();

    const oldPricePerGuest = calculatePricePerGuest(booking.guestQuantity);
    const newPricePerGuest = calculatePricePerGuest(guestCount);

    let priceDifference = 0;
    if (guestCount > booking.guestQuantity) {
        const guestsAdded = guestCount - booking.guestQuantity;
        priceDifference = guestsAdded * newPricePerGuest;
    } else if (guestCount < booking.guestQuantity) {
        const guestsRemoved = booking.guestQuantity - guestCount;
        priceDifference = -guestsRemoved * oldPricePerGuest;
    }

    const combinedAddons = allAddons.reduce((acc, addon) => {
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

    const finalTotalPrice = guestTotalPrice + addonsTotalPrice;

    const totalBalanceDue = guestCount === booking.guestQuantity
        ? pendingBalance
        : pendingBalance + priceDifference;

    const isRefund = totalBalanceDue < 0;
    const displayBalanceValue = Math.abs(totalBalanceDue);
    const paidTotal = booking.total_price;

    const handleChangeConfirm = async () => {
        if (booking.status === "CANCELED" || booking.status === "REJECTED") {
            toast({
                title: "Error",
                description: "Cannot modify a reservation that is canceled or rejected.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        try {
            const updatedTotalPrice = finalTotalPrice;

            const oldPricePerGuest = calculatePricePerGuest(booking.guestQuantity);
            const newPricePerGuest = calculatePricePerGuest(guestCount);

            let priceDifference = 0;
            if (guestCount > booking.guestQuantity) {
                const guestsAdded = guestCount - booking.guestQuantity;
                priceDifference = guestsAdded * newPricePerGuest;
            } else if (guestCount < booking.guestQuantity) {
                const guestsRemoved = booking.guestQuantity - guestCount;
                priceDifference = -guestsRemoved * oldPricePerGuest;
            }

            const pendingTransactionsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                {
                    withCredentials: true
                    , params: {payment_status: 'pending'}
                }
            );

            const pendingTransactions = pendingTransactionsResponse.data;
            const pendingTransaction = pendingTransactions?.find(t => t.transaction_type !== 'CREATE');
            let pendingBalance = 0;

            if (pendingTransaction) {
                pendingBalance = pendingTransaction.transaction_direction === 'refund'
                    ? -pendingTransaction.amount
                    : pendingTransaction.amount;
            }

            let totalBalanceDue = priceDifference + pendingBalance;

            const isRefund = totalBalanceDue < 0;
            const finalAmount = Math.abs(totalBalanceDue);
            const transactionType = isRefund ? 'GUEST_QUANTITY_REFUND' : 'GUEST_QUANTITY_CHANGE';

            const bookingChangesObj = {
                originalGuestQuantity: booking.guestQuantity,
                newGuestQuantity: guestCount,
                originalPrice: booking.total_price,
                newPrice: updatedTotalPrice,
                priceDifference: priceDifference,
                totalBalanceDue: totalBalanceDue,
                isRefund: isRefund,
                finalAmount: finalAmount,
                addons: combinedAddons,
                addonsTotalPrice: addonsTotalPrice
            };

            setBookingChanges(bookingChangesObj);

            let transactionSuccess = false;

            const hasPendingTransaction = pendingTransactions && pendingTransactions.length > 0;
            const createTransaction = pendingTransactions?.find(t => t.transaction_type === 'CREATE');

            if (createTransaction && priceDifference < 0) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${createTransaction.id}`,
                    {
                        amount: createTransaction.amount + finalAmount
                    },
                    {
                        withCredentials: true
                    }
                );

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                    {
                        tenant_id: booking.tenantId,
                        reservation_id: booking.id,
                        amount: finalAmount,
                        payment_status: 'archived',
                        transaction_type: 'REFUND',
                        is_history: true,
                        transaction_direction: 'refund',
                        parent_transaction_id: createTransaction.id,
                        metadata: {
                            originalGuestQuantity: booking.guestQuantity,
                            newGuestQuantity: guestCount,
                            originalPrice: booking.total_price,
                            newPrice: updatedTotalPrice,
                            modifiedAt: new Date().toISOString(),
                            previousTransactionId: createTransaction.id,
                            isHistorical: true,
                            isRefund: true,
                            totalBalanceDue: totalBalanceDue,
                            addons: combinedAddons,
                            addonsTotalPrice: addonsTotalPrice
                        }
                    },
                    {
                        withCredentials: true
                    }
                );

                transactionSuccess = true;
            } else if (createTransaction && priceDifference > 0) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${createTransaction.id}`,
                    {
                        amount: createTransaction.amount + finalAmount
                    },
                    {
                        withCredentials: true
                    }
                );
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                    {
                        tenant_id: booking.tenantId,
                        reservation_id: booking.id,
                        amount: finalAmount,
                        payment_status: 'archived',
                        transaction_type: 'GUEST_QUANTITY_CHANGE',
                        transaction_direction: 'charge',
                        is_history: true,
                        parent_transaction_id: createTransaction.id,
                        metadata: {
                            originalGuestQuantity: booking.guestQuantity,
                            newGuestQuantity: guestCount,
                            originalPrice: booking.total_price,
                            newPrice: updatedTotalPrice,
                            modifiedAt: new Date().toISOString(),
                            previousTransactionId: createTransaction.id,
                            isHistorical: true,
                            isRefund: false,
                            totalBalanceDue: totalBalanceDue,
                            addons: combinedAddons,
                            addonsTotalPrice: addonsTotalPrice
                        }
                    },
                    {
                        withCredentials: true
                    }
                );

                transactionSuccess = true;
            } else {
                if (hasPendingTransaction) {
                    const existingTransaction = pendingTransactions.find(t => t.transaction_type !== 'CREATE');
                    if (existingTransaction) {
                        await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${existingTransaction.id}`,
                            {
                                is_history: true,
                                payment_status: 'archived'
                            },
                            {
                                withCredentials: true
                            }
                        );
                        const transactionData = {
                            tenant_id: booking.tenantId,
                            reservation_id: booking.id,
                            amount: finalAmount,
                            payment_status: 'pending',
                            transaction_type: transactionType,
                            transaction_direction: isRefund ? 'refund' : 'charge',
                            parent_transaction_id: existingTransaction.id,
                            metadata: {
                                originalGuestQuantity: booking.guestQuantity,
                                newGuestQuantity: guestCount,
                                originalPrice: booking.total_price,
                                newPrice: updatedTotalPrice,
                                modifiedAt: new Date().toISOString(),
                                previousTransactionId: existingTransaction.id,
                                isRefund: isRefund,
                                totalBalanceDue: totalBalanceDue,
                                addons: combinedAddons,
                                addonsTotalPrice: addonsTotalPrice
                            }
                        };

                        await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                            transactionData,
                            {
                                withCredentials: true
                            }
                        );

                        transactionSuccess = true;
                    }
                }
            }
            if (!transactionSuccess) {
                const transactionData = {
                    tenant_id: booking.tenantId,
                    reservation_id: booking.id,
                    amount: finalAmount,
                    payment_status: 'pending',
                    transaction_type: transactionType,
                    transaction_direction: isRefund ? 'refund' : 'charge',
                    metadata: {
                        originalGuestQuantity: booking.guestQuantity,
                        newGuestQuantity: guestCount,
                        originalPrice: booking.total_price,
                        newPrice: updatedTotalPrice,
                        modifiedAt: new Date().toISOString(),
                        isRefund: isRefund,
                        totalBalanceDue: totalBalanceDue,
                        addons: combinedAddons,
                        addonsTotalPrice: addonsTotalPrice
                    }
                };

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                    transactionData,
                    {
                        withCredentials: true
                    }
                );

                transactionSuccess = true;
            }

            try {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                    guestQuantity: guestCount,
                    total_price: updatedTotalPrice,
                    status: booking.status
                },
                    {
                        withCredentials: true
                    });

                try {
                    const { currentUser } = useAuth();
                    const userIdFromAuth = currentUser?.id;

                    if (userIdFromAuth) {
                        await syncSingleReservation(booking.id, userIdFromAuth);
                    } else {
                        console.warn("ChangeGuestQuantityModal (handleChangeConfirm): User ID not available from auth. Calendar sync skipped for user.");
                    }
                    await syncReservationForGuides(booking.id);
                } catch (syncError) {
                    console.error("Error syncing calendar:", syncError);
                }
                
                const actionType = priceDifference > 0 ? "additional charge" :
                    priceDifference < 0 ? "refund" : "change";

                toast({
                    title: "Success",
                    description: transactionSuccess
                        ? `Booking updated successfully. The ${actionType} will be processed later.`
                        : `Booking updated successfully. Note: The ${actionType} transaction will need to be created manually.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                setChangesConfirmed(true);
            } catch (bookingError) {
                console.error("Error updating booking:", bookingError);
                if (bookingError.response) {
                    console.error("Booking error response:", bookingError.response.data);
                    console.error("Booking error status:", bookingError.response.status);
                }
                throw bookingError;
            }
        } catch (error) {
            console.error("Overall error in handleChangeConfirm:", error);
            toast({
                title: "Error",
                description: "Failed to update booking. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = () => {
        onCollectBalanceOpen();
        onClose();
    };

    const isLoadingData = isLoadingPendingBalance || isLoadingCardDetails || isLoadingAddons;
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "4xl"}>
                <ModalOverlay/>
                <ModalContent margin={isMobile ? 0 : "auto"} borderRadius={isMobile ? 0 : "md"}>
                    <ModalHeader textAlign={"center"}>Change Guest Quantity</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex 
                            direction={isMobile ? "column" : "row"} 
                            gap={4}
                        >
                            <Box flex="1" mr={isMobile ? 0 : 6} mb={isMobile ? 4 : 0}>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>
                                    Guest Summary
                                </Text>
                                <Flex align="center" mb={4}>
                                    <Text mr={2}>Guests</Text>
                                    <HStack spacing={2}>
                                        <Button 
                                            size={isMobile ? "md" : "sm"} 
                                            onClick={handleDecrease} 
                                            isDisabled={changesConfirmed}
                                            minW={isMobile ? "40px" : "auto"}
                                        >
                                            -
                                        </Button>
                                        <Input
                                            size={isMobile ? "md" : "sm"}
                                            width={isMobile ? "60px" : "50px"}
                                            textAlign="center"
                                            value={guestCount}
                                            isReadOnly
                                        />
                                        <Button 
                                            size={isMobile ? "md" : "sm"} 
                                            onClick={handleIncrease} 
                                            isDisabled={changesConfirmed}
                                            minW={isMobile ? "40px" : "auto"}
                                        >
                                            +
                                        </Button>
                                    </HStack>
                                </Flex>
                                <TableContainer>
                                    <Table variant="simple">
                                        {/*<Thead>*/}
                                        {/*    <Tr>*/}
                                        {/*        <Th>Name</Th>*/}
                                        {/*        <Th>Demographic</Th>*/}
                                        {/*        <Th/>*/}
                                        {/*    </Tr>*/}
                                        {/*</Thead>*/}
                                        {/*<Tbody>*/}
                                        {/*    {guests.map((guest) => (*/}
                                        {/*        <Tr key={guest.id}>*/}
                                        {/*            <Td>{guest.name}</Td>*/}
                                        {/*            <Td>*/}
                                        {/*                <Flex align="center">*/}
                                        {/*                    <EditIcon mr={2}/>*/}
                                        {/*                    {guest.demographic}*/}
                                        {/*                </Flex>*/}
                                        {/*            </Td>*/}
                                        {/*            <Td>*/}
                                        {/*                <IconButton*/}
                                        {/*                    icon={<DeleteIcon/>}*/}
                                        {/*                    size="sm"*/}
                                        {/*                    aria-label="Delete Guest"*/}
                                        {/*                />*/}
                                        {/*            </Td>*/}
                                        {/*        </Tr>*/}
                                        {/*    ))}*/}
                                        {/*</Tbody>*/}
                                    </Table>
                                </TableContainer>
                            </Box>

                            <Box flex="1" w={isMobile ? "100%" : "auto"}>
                                <VStack
                                    bg="gray.50"
                                    p={isMobile ? 4 : 6}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    spacing={4}
                                    align="stretch"
                                    w="100%"
                                    minH={isMobile ? "auto" : "300px"}
                                    overflowY={isMobile ? "visible" : "auto"}
                                >
                                    {isLoadingData ? (
                                        <HStack justifyContent="center">
                                            <Spinner size="sm"/>
                                            <Text>Loading...</Text>
                                        </HStack>
                                    ) : (
                                        <>
                                            <Box padding={isMobile ? "6px" : "10px"} w="100%">
                                                <Text fontWeight="bold" mb={2}>
                                                    Purchase Summary
                                                </Text>
                                                <VStack align="stretch" spacing={2}>
                                                    <HStack justify="space-between">
                                                        <Text fontSize={isMobile ? "sm" : "md"}>
                                                            {`Guests ($${(guestTotalPrice / guestCount).toFixed(2)} × ${guestCount})`}
                                                        </Text>
                                                        <Text fontSize={isMobile ? "sm" : "md"}>${guestTotalPrice.toFixed(2)}</Text>
                                                    </HStack>
                                                </VStack>

                                                {combinedAddons.length > 0 ? (
                                                    combinedAddons.map((addon) => (
                                                        <HStack key={addon.id} justifyContent="space-between">
                                                            <Text fontSize={isMobile ? "sm" : "md"}>
                                                                {addon.label || 'Add-on'} (${addon.price} x {addon.quantity})
                                                            </Text>
                                                            <Text fontSize={isMobile ? "sm" : "md"}>
                                                                ${(addon.price * addon.quantity).toFixed(2)}
                                                            </Text>
                                                        </HStack>
                                                    ))
                                                ) : (
                                                    <Text fontSize={isMobile ? "sm" : "md"}>No add-ons selected.</Text>
                                                )}

                                                <Divider my={2}/>
                                                <HStack justify="space-between">
                                                    <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>Total</Text>
                                                    <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>${finalTotalPrice.toFixed(2)}</Text>
                                                </HStack>

                                                {totalBalanceDue !== 0 && (
                                                    <HStack justify="space-between" mt={2}>
                                                        <Text 
                                                            fontWeight="bold" 
                                                            fontSize={isMobile ? "sm" : "md"}
                                                            color={isRefund ? "green.500" : "red.500"}>
                                                            {isRefund ? "Refund Due" : "Balance Due"}
                                                        </Text>
                                                        <Text 
                                                            fontWeight="bold" 
                                                            fontSize={isMobile ? "sm" : "md"}
                                                            color={isRefund ? "green.500" : "red.500"}>
                                                            ${displayBalanceValue.toFixed(2)}
                                                        </Text>
                                                    </HStack>
                                                )}
                                            </Box>
                                            <Box>
                                                <Text fontWeight="bold" mb={2} fontSize={isMobile ? "sm" : "md"}>
                                                    Payment Summary
                                                </Text>
                                                <VStack align="stretch" spacing={2}>
                                                    {cardDetails && (
                                                        <HStack justify="space-between">
                                                            <HStack spacing={2}>
                                                                <Box as="span" role="img" aria-label="Card Icon"
                                                                     fontSize={isMobile ? "md" : "lg"}>
                                                                    💳
                                                                </Box>
                                                                <Text fontSize={isMobile ? "sm" : "md"}>
                                                                    Payment
                                                                    <Box
                                                                        as="span"
                                                                        bg="white"
                                                                        px={1}
                                                                        py={1}
                                                                        borderRadius="md"
                                                                        boxShadow="sm"
                                                                        fontSize={isMobile ? "xs" : "sm"}
                                                                    >
                                                                        *{cardDetails.last4}
                                                                    </Box>{" "}
                                                                    {isMobile ? "" : formatDateToAmerican(formatDate(cardDetails.paymentDate))}
                                                                </Text>
                                                            </HStack>
                                                        </HStack>
                                                    )}
                                                    <HStack justify="space-between">
                                                        <Text fontSize={isMobile ? "sm" : "md"}>Paid</Text>
                                                        <Text fontSize={isMobile ? "sm" : "md"}>${paidTotal.toFixed(2)}</Text>
                                                    </HStack>
                                                </VStack>
                                            </Box>
                                        </>
                                    )}
                                </VStack>
                            </Box>
                        </Flex>
                    </ModalBody>
                    <ModalFooter flexDirection={isMobile ? "column" : "row"} gap={isMobile ? 2 : 0} alignItems={isMobile ? "stretch" : "center"}>
                        <Checkbox 
                            isChecked={notifyCustomer} 
                            onChange={(e) => setNotifyCustomer(e.target.checked)}
                            mb={isMobile ? 2 : 0} 
                            mr={isMobile ? 0 : 4}
                        >
                            Notify Customer
                        </Checkbox>
                        <Flex width={isMobile ? "100%" : "auto"} gap={2} justifyContent={isMobile ? "space-between" : "flex-end"}>
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                                flex={isMobile ? 1 : "auto"}
                            >
                                Cancel
                            </Button>
                            {!changesConfirmed ? (
                                <Button
                                    colorScheme="blue"
                                    onClick={handleChangeConfirm}
                                    isLoading={isLoading}
                                    loadingText="Updating"
                                    flex={isMobile ? 1 : "auto"}
                                >
                                    Modify
                                </Button>
                            ) : (
                                <Button
                                    colorScheme="green"
                                    onClick={handleComplete}
                                    leftIcon={<BsCheck2/>}
                                    flex={isMobile ? 1 : "auto"}
                                >
                                    Done
                                </Button>
                            )}
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <CollectBalanceModal
                isOpen={isCollectBalanceOpen}
                onClose={onCollectBalanceClose}
                bookingChanges={bookingChanges}
                booking={booking}
            />
        </>
    );
};

export default ChangeGuestQuantityModal;
export {CollectBalanceModal};