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

const BookingCancellationModal = ({booking, isOpen, onClose, onStatusChange}) => {
    const [refundAmount, setRefundAmount] = useState(booking?.total_price || 0);
    const [paymentMethod, setPaymentMethod] = useState("Credit Card");
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
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchOriginalTransaction();
            fetchReservationDetails();
        }
    }, [isOpen, booking?.id]);

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
                    fetchTierPricing(response.data.tourId || response.data.tour_id);
                    fetchAddons(response.data.tourId || response.data.tour_id);
                }

                fetchCustomItems();
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

            setReservationAddons(reservationAddonsResponse.data);
            setAllAddons(allAddonsResponse.data);
        } catch (error) {
            console.error("Failed to fetch addons:", error);
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

            setCustomItems(formattedItems);
        } catch (error) {
            console.error("Failed to fetch custom items:", error);
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
        const guestTotal = calculateGuestPrice();
        const addonTotal = calculateAddonTotal();
        const customItemsTotal = calculateCustomItemsTotal();

        return guestTotal + addonTotal + customItemsTotal;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleSaveChanges = async () => {
        try {
            if (refundAmount <= 0) {
                toast({
                    title: "Error",
                    description: "Refund amount must be greater than zero.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            setIsSubmitting(true);

            if (paymentMethod === 'Credit Card') {
                if (!originalTransaction) {
                    toast({
                        title: "Error",
                        description: "No original payment transaction found.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
                const paymentIntentId = originalTransaction.paymentIntentId ||
                    originalTransaction.stripe_payment_id;

                if (!paymentIntentId) {
                    toast({
                        title: "Error",
                        description: "No payment intent ID found for this transaction.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }

                try {
                    const refundPayload = {
                        paymentIntentId: paymentIntentId,
                        paymentMethodId: originalTransaction.paymentMethodId,
                        amount: refundAmount
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
                    const tenantId = booking.tenantId || originalTransaction.tenant_id;

                    if (!tenantId) {
                        throw new Error('Tenant ID is missing. Cannot create refund transaction.');
                    }

                    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                            tenant_id: tenantId,
                            reservation_id: booking.id,
                            amount: refundAmount,
                            payment_status: 'completed',
                            payment_method: 'Credit Card',
                            transaction_type: 'CANCELLATION_REFUND',
                            transaction_direction: 'refund',
                            description: `Refund of $${refundAmount.toFixed(2)} processed for cancelled booking`,
                            reference_number: `RF-${Date.now().toString().slice(-6)}`,
                            stripe_payment_id: paymentIntentId,
                            paymentIntentId: paymentIntentId,
                            metadata: {
                                originalPrice: calculateTotalPrice(),
                                refundAmount: refundAmount,
                                comment: comment,
                                refundDate: new Date().toISOString(),
                                cardInfo: cardInfo,
                                originalTransactionId: originalTransaction.id,
                                notifyCustomer: notifyCustomer,
                                paymentMethodId: originalTransaction.paymentMethodId
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
                        toast({
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
                } catch (error) {
                    console.error("Stripe refund error:", error);
                    toast({
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
                const tenantId = booking.tenantId || originalTransaction?.tenant_id;

                if (!tenantId) {
                    toast({
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
                    tenant_id: tenantId,
                    reservation_id: booking.id,
                    amount: refundAmount,
                    payment_status: 'completed',
                    payment_method: 'Cash',
                    transaction_type: 'CANCELLATION_REFUND',
                    transaction_direction: 'refund',
                    description: `Cash refund of $${refundAmount.toFixed(2)} for cancelled booking`,
                    reference_number: `RF-${Date.now().toString().slice(-6)}`,
                    metadata: {
                        originalPrice: calculateTotalPrice(),
                        refundAmount: refundAmount,
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
                        toast({
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
                    const tenantId = booking.tenantId || originalTransaction?.tenant_id;

                    if (!tenantId) {
                        toast({
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
                            amount: refundAmount,
                            originReservationId: booking.id,
                            tenantId: tenantId
                        },
                        {
                            withCredentials: true
                        }
                    );

                    if (voucherResponse.data && voucherResponse.data.voucher) {
                        const voucherCode = voucherResponse.data.voucher.code;
                        setGeneratedVoucher({
                            code: voucherCode,
                            amount: refundAmount
                        });

                        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                            tenant_id: tenantId,
                            reservation_id: booking.id,
                            amount: refundAmount,
                            payment_status: 'completed',
                            payment_method: 'Store Credit',
                            transaction_type: 'CANCELLATION_REFUND',
                            transaction_direction: 'refund',
                            description: `Store credit voucher of $${refundAmount.toFixed(2)} issued for cancelled booking`,
                            reference_number: `RF-${Date.now().toString().slice(-6)}`,
                            metadata: {
                                originalPrice: calculateTotalPrice(),
                                refundAmount: refundAmount,
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
                            if (onStatusChange) {
                                onStatusChange("CANCELED");
                            }

                            toast({
                                title: "Store Credit Issued",
                                description: `Voucher ${voucherCode} created successfully.`,
                                status: "success",
                                duration: 4000,
                                isClosable: true,
                            });
                        }
                    }
                } catch (error) {
                    throw new Error(error.response?.data?.message || "Failed to generate voucher");
                }
            } else if (paymentMethod === "other") {
                try {
                    const tenantId = booking.tenantId || originalTransaction?.tenant_id;

                    if (!tenantId) {
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
                        tenant_id: tenantId,
                        reservation_id: booking.id,
                        amount: refundAmount,
                        payment_status: 'completed',
                        payment_method: 'Other',
                        transaction_type: 'CANCELLATION_REFUND',
                        transaction_direction: 'refund',
                        description: `Refund of $${refundAmount.toFixed(2)} processed for cancelled booking (Other method)`,
                        reference_number: `RF-${Date.now().toString().slice(-6)}`,
                        metadata: {
                            originalPrice: calculateTotalPrice(),
                            refundAmount: refundAmount,
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
                        toast({
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
                    toast({
                        title: "Error",
                        description: error.message || "Failed to process cancellation. Please try again.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } else {
                toast({
                    title: "No Action",
                    description: "Please select a payment method.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Failed to process cancellation:", error);
            toast({
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
        <Modal isOpen={isOpen} onClose={onClose} size="5xl">
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader textAlign="center">
                    Reduce Booking Value and Return Payment
                </ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Box>
                        <HStack align="start" spacing={10}>
                            <VStack align="start" spacing={5} flex="2.5">
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
                                    <Input
                                        type="number"
                                        value={refundAmount === 0 ? '' : refundAmount}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            if (inputValue === '') {
                                                setRefundAmount(0);
                                                return;
                                            }
                                            const numValue = parseFloat(inputValue);
                                            if (isNaN(numValue) || numValue < 0) {
                                                setRefundAmount(0);
                                            } else if (numValue > calculateTotalPrice()) {
                                                setRefundAmount(calculateTotalPrice());
                                            } else {
                                                setRefundAmount(numValue);
                                            }
                                        }}
                                        max={calculateTotalPrice()}
                                        min={0}
                                        placeholder="$ 0.00"
                                    />
                                    <Text fontSize="sm" mt={1}>
                                        up to ${calculateTotalPrice().toFixed(2)}
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text mb={2}>Payment Method</Text>
                                    <HStack spacing={3}>
                                        {originalTransaction ? (
                                            <Button
                                                variant={paymentMethod === "Credit Card" ? "solid" : "outline"}
                                                onClick={() => setPaymentMethod("Credit Card")}
                                                leftIcon={<FaRegCreditCard/>}
                                                borderColor={paymentMethod === "Credit Card" ? 'blue.500' : 'gray.200'}
                                                bg={paymentMethod === "Credit Card" ? 'blue.50' : 'white'}
                                                color={paymentMethod === "Credit Card" ? 'blue.700' : 'gray.700'}
                                                _hover={{bg: paymentMethod === "Credit Card" ? 'blue.100' : 'gray.100'}}
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
                                        >
                                            Other
                                        </Button>
                                    </HStack>

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
                                        {loadingCardInfo ? (
                                            <Flex justify="center" py={2} borderWidth="1px" borderRadius="md" p={3}>
                                                <Spinner size="sm" mr={2}/>
                                                <Text>Loading card information...</Text>
                                            </Flex>
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
                                                    <Text fontWeight="medium">
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
                                w="600px"
                            >
                                <Box w="full">
                                    <Text fontWeight="bold">Purchase Summary</Text>
                                    <VStack align="stretch" spacing={3} mt={3}>
                                        {isLoadingTierPricing || isLoadingAddons ? (
                                            <Text fontSize="sm" color="gray.500">Loading...</Text>
                                        ) : (
                                            <>
                                                <HStack justifyContent="space-between">
                                                    <Text>
                                                        {`Guests ($${(tierPricing && tierPricing.pricingType === 'flat'
                                                            ? tierPricing.basePrice
                                                            : guestPrice).toFixed(2)} × ${guestQuantity})`}
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
                                                        <HStack justify="space-between" mt={1}>
                                                            <Text fontWeight="semibold">Add-ons Subtotal</Text>
                                                            <Text
                                                                fontWeight="semibold">${calculateAddonTotal().toFixed(2)}</Text>
                                                        </HStack>
                                                    </>
                                                )}

                                                {customItems && customItems.length > 0 && (
                                                    <>
                                                        {customItems.map((item) => (
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

                                                <HStack justifyContent="space-between" mt={2}>
                                                    <Text fontWeight="bold">Total:</Text>
                                                    <Text fontWeight="bold">${calculateTotalPrice().toFixed(2)}</Text>
                                                </HStack>

                                                <HStack justifyContent="space-between" color="red.500">
                                                    <Text>Cancellation:</Text>
                                                    <Text>-${refundAmount.toFixed(2)}</Text>
                                                </HStack>

                                                <Divider/>
                                                <HStack justifyContent="space-between">
                                                    <Text fontWeight="bold">Final Total:</Text>
                                                    <Text
                                                        fontWeight="bold">${(calculateTotalPrice() - refundAmount).toFixed(2)}</Text>
                                                </HStack>
                                            </>
                                        )}
                                    </VStack>
                                </Box>
                                <Box w="full">
                                    <Text fontWeight="bold">Payment Summary</Text>
                                    <VStack align="stretch" spacing={3} mt={3}>
                                        {cardInfo && (
                                            <HStack justifyContent="space-between">
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
                                                    <Text>
                                                        Payment {booking.dateFormatted || formatDate(new Date().toISOString())}:
                                                        {` *${cardInfo.last4 || 'xxxx'}`}
                                                    </Text>
                                                </HStack>
                                                <Text fontWeight="bold">
                                                    ${calculateTotalPrice().toFixed(2)}
                                                </Text>
                                            </HStack>
                                        )}

                                        <HStack justifyContent="space-between">
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
                                                <Text color="blue.500">
                                                    Return Payment {formatDate(new Date().toISOString())}
                                                    {paymentMethod === 'Credit Card' && cardInfo && ` *${cardInfo.last4 || 'xxxx'}`}
                                                </Text>
                                            </HStack>
                                            <Text fontWeight="bold" color="blue.500">
                                                -${refundAmount.toFixed(2)}
                                            </Text>
                                        </HStack>

                                        <Divider mt={4}/>
                                        <HStack justifyContent="space-between">
                                            <Text fontWeight="bold">Paid:</Text>
                                            <Text
                                                fontWeight="bold">${(calculateTotalPrice() - refundAmount).toFixed(2)}</Text>
                                        </HStack>
                                    </VStack>
                                </Box>
                            </VStack>
                        </HStack>
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
                        <HStack>
                            <Checkbox
                                isChecked={notifyCustomer}
                                onChange={(e) => setNotifyCustomer(e.target.checked)}
                            >
                                Notify Customer
                            </Checkbox>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleSaveChanges}
                                isLoading={isSubmitting}
                                isDisabled={isLoadingTierPricing || isLoadingAddons || isLoadingCustomItems}
                            >
                                Process Cancellation
                            </Button>
                        </HStack>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BookingCancellationModal;
