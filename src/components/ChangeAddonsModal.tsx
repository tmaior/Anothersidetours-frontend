import {
    Button,
    Checkbox,
    Flex,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Switch,
    Text,
    useToast,
    VStack,
    Box,
    Divider,
    useDisclosure,
    useMediaQuery
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {CollectBalanceModal} from "./ChangeGuestQuantityModal";

export default function ChangeAddOns({isOpen, onClose, booking}) {
    const [selectedAddons, setSelectedAddons] = useState({});
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();
    const [reservationAddons, setReservationAddons] = useState([]);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [isLoadingPendingBalance, setIsLoadingPendingBalance] = useState(true);
    const [cardDetails, setCardDetails] = useState(null);
    const [isLoadingCardDetails, setIsLoadingCardDetails] = useState(true);
    const [tierPricing, setTierPricing] = useState(null);
    const [bookingChanges, setBookingChanges] = useState(null);
    const [changesConfirmed, setChangesConfirmed] = useState(false);
    const [isMobile] = useMediaQuery("(max-width: 768px)");
    const {
        isOpen: isCollectBalanceOpen,
        onOpen: onCollectBalanceOpen,
        onClose: onCollectBalanceClose
    } = useDisclosure();

    useEffect(() => {
        const fetchAddons = async () => {
            if (!booking?.id || !booking.tourId) return;

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
                const addonMap = {};
                allAddonsResponse.data.forEach(addon => {
                    addonMap[addon.id] = addon;
                });

                const initialSelected = {};

                reservationAddonsResponse.data.forEach(resAddon => {
                    const addon = addonMap[resAddon.addonId];
                    if (addon) {
                        if (addon.type === 'SELECT') {
                            initialSelected[addon.id] = parseInt(resAddon.value, 10) || 0;
                        } else if (addon.type === 'CHECKBOX') {
                            initialSelected[addon.id] = resAddon.value === "1";
                        }
                    }
                });

                setSelectedAddons(initialSelected);
            } catch (error) {
                console.error('Error when searching for add-ons:', error);
                toast({
                    title: "Erro",
                    description: "Failed to load add-ons.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoadingAddons(false);
            }
        };

        const fetchPendingTransactions = async () => {
            if (!booking?.id) return;

            setIsLoadingPendingBalance(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                    {
                        withCredentials: true,
                        params: {payment_status: 'pending'}
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
            if (!booking.paymentMethodId) {
                setIsLoadingCardDetails(false);
                return;
            }
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

        if (isOpen) {
            setChangesConfirmed(false);
            setBookingChanges(null);
            fetchAddons();
            fetchPendingTransactions();
            fetchCardDetails();
            fetchTierPricing();
        }
    }, [booking?.id, booking.tourId, booking.paymentMethodId, isOpen, toast]);

    const handleIncrement = (addonId) => {
        setSelectedAddons(prev => ({
            ...prev,
            [addonId]: (prev[addonId] || 0) + 1
        }));
    };

    const handleDecrement = (addonId) => {
        setSelectedAddons(prev => ({
            ...prev,
            [addonId]: prev[addonId] > 0 ? prev[addonId] - 1 : 0
        }));
    };

    const handleCheckboxChange = (addonId) => {
        setSelectedAddons(prev => ({
            ...prev,
            [addonId]: !prev[addonId]
        }));
    };

    const handleSaveChanges = async () => {
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

        setIsSaving(true);
        try {
            const reservationAddonsMap = reservationAddons.reduce((map, reservationAddon) => {
                map[reservationAddon.addonId] = reservationAddon.id;
                return map;
            }, {});
            const updatedAddonsTotalPrice = combinedAddons.reduce(
                (sum, addon) => sum + (addon.price * addon.quantity), 0
            );

            const priceDifference = updatedAddonsTotalPrice - originalAddonsTotal;
            const totalBalanceDue = priceDifference + pendingBalance;
            const isRefund = totalBalanceDue < 0;
            const finalAmount = Math.abs(totalBalanceDue);
            const transactionType = isRefund ? 'ADDON_CHANGE_REFUND' : 'ADDON_CHANGE';
            const transactionDirection = isRefund ? 'refund' : 'charge';

            const bookingChangesObj = {
                originalAddonsTotal: originalAddonsTotal,
                newAddonsTotal: updatedAddonsTotalPrice,
                originalPrice: oldTotal,
                newPrice: newTotal,
                priceDifference: priceDifference,
                totalBalanceDue: totalBalanceDue,
                isRefund: isRefund,
                finalAmount: finalAmount
            };

            setBookingChanges(bookingChangesObj);

            const pendingTransactionsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                {
                    withCredentials: true,
                    params: {payment_status: 'pending'}
                }
            );

            const pendingTransactions = pendingTransactionsResponse.data;
            const hasPendingTransaction = pendingTransactions && pendingTransactions.length > 0;
            const createTransaction = pendingTransactions?.find(t => t.transaction_type === 'CREATE');

            let transactionSuccess = false;

            if (createTransaction && priceDifference < 0) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${createTransaction.id}`,
                    {
                        amount: createTransaction.amount + priceDifference
                    },
                    {
                        withCredentials: true,
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
                        transaction_direction: 'refund',
                        is_history: true,
                        parent_transaction_id: createTransaction.id,
                        metadata: {
                            originalAddonsTotal: originalAddonsTotal,
                            newAddonsTotal: updatedAddonsTotalPrice,
                            originalPrice: oldTotal,
                            newPrice: newTotal,
                            modifiedAt: new Date().toISOString(),
                            previousTransactionId: createTransaction.id,
                            isHistorical: true,
                            isRefund: true,
                            totalBalanceDue: totalBalanceDue
                        }
                    },
                    {
                        withCredentials: true,
                    }
                );

                transactionSuccess = true;
            } else if (createTransaction && priceDifference > 0) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${createTransaction.id}`,
                    {
                        amount: createTransaction.amount + priceDifference
                    },
                    {
                        withCredentials: true,
                    }
                );
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                    {
                        tenant_id: booking.tenantId,
                        reservation_id: booking.id,
                        amount: finalAmount,
                        payment_status: 'archived',
                        transaction_type: 'ADDON_CHANGE',
                        transaction_direction: 'charge',
                        is_history: true,
                        parent_transaction_id: createTransaction.id,
                        metadata: {
                            originalAddonsTotal: originalAddonsTotal,
                            newAddonsTotal: updatedAddonsTotalPrice,
                            originalPrice: oldTotal,
                            newPrice: newTotal,
                            modifiedAt: new Date().toISOString(),
                            previousTransactionId: createTransaction.id,
                            isHistorical: true,
                            isRefund: false,
                            totalBalanceDue: totalBalanceDue
                        }
                    },
                    {
                        withCredentials: true,
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
                                withCredentials: true,
                            }
                        );
                        const transactionData = {
                            tenant_id: booking.tenantId,
                            reservation_id: booking.id,
                            amount: finalAmount,
                            payment_status: 'pending',
                            transaction_type: transactionType,
                            transaction_direction: transactionDirection,
                            parent_transaction_id: existingTransaction.id,
                            metadata: {
                                originalAddonsTotal: originalAddonsTotal,
                                newAddonsTotal: updatedAddonsTotalPrice,
                                originalPrice: oldTotal,
                                newPrice: newTotal,
                                modifiedAt: new Date().toISOString(),
                                previousTransactionId: existingTransaction.id,
                                isRefund: isRefund,
                                totalBalanceDue: totalBalanceDue
                            }
                        };

                        await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                            transactionData,
                            {
                                withCredentials: true,
                            }
                        );

                        transactionSuccess = true;
                    }
                }
            }

            if (!transactionSuccess && priceDifference !== 0) {
                const transactionData = {
                    tenant_id: booking.tenantId,
                    reservation_id: booking.id,
                    amount: finalAmount,
                    payment_status: 'pending',
                    transaction_type: transactionType,
                    transaction_direction: transactionDirection,
                    metadata: {
                        originalAddonsTotal: originalAddonsTotal,
                        newAddonsTotal: updatedAddonsTotalPrice,
                        originalPrice: oldTotal,
                        newPrice: newTotal,
                        modifiedAt: new Date().toISOString(),
                        isRefund: isRefund,
                        totalBalanceDue: totalBalanceDue
                    }
                };

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                    transactionData,
                    {
                        withCredentials: true,
                    }
                );
                transactionSuccess = true;
            }

            for (const [addonId, value] of Object.entries(selectedAddons)) {
                const addon = allAddons.find((a) => a.id === addonId);
                if (!addon) continue;

                const reservationAddonId = reservationAddonsMap[addonId];

                if (addon.type === 'SELECT') {
                    const numericValue = Number(value);
                    if (numericValue > 0) {
                        if (reservationAddonId) {
                            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
                                    tenantId: booking.tenantId,
                                    reservationId: booking.id,
                                    value: value.toString(),
                                },
                                {
                                    withCredentials: true,
                                });
                        } else {
                            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons`, {
                                    tenantId: booking.tenantId,
                                    reservationId: booking.id,
                                    addonId,
                                    value: value.toString(),
                                },
                                {
                                    withCredentials: true,
                                });
                        }
                    } else if (reservationAddonId) {
                        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`,
                            {
                                withCredentials: true,
                                data: {
                                    tenantId: booking.tenantId,
                                    reservationId: booking.id,
                                },
                            });
                    }
                } else if (addon.type === 'CHECKBOX') {
                    if (value) {
                        if (reservationAddonId) {
                            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                                value: "1",
                            },
                                {
                                    withCredentials: true,
                                });
                        } else {
                            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons`, {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                                addonId,
                                value: "1",
                            },
                                {
                                    withCredentials: true,
                                });
                        }
                    } else if (reservationAddonId) {
                        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
                            withCredentials: true,
                            data: {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                            },
                        });
                    }
                }
            }

            const actionType = priceDifference > 0 ? "charge" : priceDifference < 0 ? "refund" : "change";
            toast({
                title: "Success",
                description: transactionSuccess
                    ? `Add-ons updated successfully. The ${actionType} will be processed later.`
                    : `Add-ons updated successfully. Note: The ${actionType} transaction will need to be created manually.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setChangesConfirmed(true);
            if (priceDifference !== 0) {
                onCollectBalanceOpen();
                onClose();
            } else {
                onClose();
            }
        } catch (error) {
            console.error("Error saving add-ons:", error);
            toast({
                title: "Error",
                description: "Failed to save add-ons.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };
    const calculateGuestPrice = () => {
        if (!tierPricing) {
            return (booking.valuePerGuest || booking.tour?.price || 0) * booking.guestQuantity;
        }

        if (tierPricing.pricingType === 'flat') {
            return tierPricing.basePrice * booking.guestQuantity;
        }

        const applicableTier = tierPricing.tierEntries
            ?.sort((a, b) => b.quantity - a.quantity)
            .find(tier => booking.guestQuantity >= tier.quantity);

        return applicableTier
            ? applicableTier.price * booking.guestQuantity
            : (tierPricing.basePrice || 0) * booking.guestQuantity;
    };
    const combinedAddons = allAddons.reduce((acc, addon) => {
        const selectedValue = selectedAddons[addon.id];
        if (addon.type === 'SELECT' && typeof selectedValue === 'number' && selectedValue > 0) {
            acc.push({
                ...addon,
                quantity: selectedValue,
            });
        } else if (addon.type === 'CHECKBOX' && selectedValue === true) {
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
    const originalAddons = reservationAddons.map(resAddon => {
        const addon = allAddons.find(a => a.id === resAddon.addonId);
        if (!addon) return null;

        return {
            ...addon,
            quantity: addon.type === 'SELECT'
                ? parseInt(resAddon.value, 10) || 0
                : resAddon.value === "1" ? 1 : 0
        };
    }).filter(Boolean);

    const originalAddonsTotal = originalAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity),
        0
    );

    const guestTotalPrice = calculateGuestPrice();

    const basePrice = booking.total_price || 0;

    const oldTotal = basePrice + originalAddonsTotal;

    const newTotal = basePrice + addonsTotalPrice;
    const finalTotalPrice = newTotal;

    const difference = newTotal - oldTotal;

    const totalBalanceDue = difference + pendingBalance;

    const paidTotal = oldTotal + (pendingBalance < 0 ? Math.abs(pendingBalance) : 0);

    const isRefund = totalBalanceDue < 0;
    const displayBalanceValue = Math.abs(totalBalanceDue);

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

    if (isLoadingAddons) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "3xl"}>
                <ModalOverlay/>
                <ModalContent margin={isMobile ? 0 : "auto"} borderRadius={isMobile ? 0 : "md"}>
                    <ModalHeader textAlign="center">Change Add-Ons</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex justify="center" align="center" height="200px">
                            <Spinner size="lg"/>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "3xl"}>
                <ModalOverlay/>
                <ModalContent margin={isMobile ? 0 : "auto"} borderRadius={isMobile ? 0 : "md"}>
                    <ModalHeader textAlign="center">Change Add-Ons</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex 
                            justify="space-between" 
                            align="start" 
                            direction={isMobile ? "column" : "row"}
                            gap={isMobile ? 4 : 0}
                        >
                            <Box 
                                minW={isMobile ? "100%" : "250px"} 
                                maxW={isMobile ? "100%" : "300px"} 
                                w="100%" 
                                mr={isMobile ? 0 : 6}
                                mb={isMobile ? 4 : 0}
                            >
                                {allAddons.length > 0 ? (
                                    <VStack spacing={4} align="stretch">
                                        {allAddons.map(addon => (
                                            <Flex 
                                                key={addon.id} 
                                                justify="space-between" 
                                                align={isMobile ? "center" : "center"}
                                                direction="row"
                                                gap={isMobile ? 2 : 0}
                                            >
                                                <VStack 
                                                    align="start" 
                                                    spacing={1} 
                                                    flex="1"
                                                    mb={0}
                                                >
                                                    <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>
                                                        {addon.label}
                                                    </Text>
                                                    <Text color="gray.500" fontSize={isMobile ? "xs" : "sm"}>
                                                        ${addon.price.toFixed(2)}
                                                    </Text>
                                                </VStack>
                                                {addon.type === 'SELECT' ? (
                                                    <Flex align="center" width={isMobile ? "auto" : "auto"}>
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleDecrement(addon.id)}
                                                            disabled={selectedAddons[addon.id] <= 0 || changesConfirmed}
                                                            flex={isMobile ? "0 0 auto" : "auto"}
                                                        >
                                                            -
                                                        </Button>
                                                        <Input
                                                            value={selectedAddons[addon.id] || 0}
                                                            readOnly
                                                            w={isMobile ? "45px" : "50px"}
                                                            textAlign="center"
                                                            mx={2}
                                                            size={isMobile ? "sm" : "md"}
                                                        />
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleIncrement(addon.id)}
                                                            disabled={changesConfirmed}
                                                            flex={isMobile ? "0 0 auto" : "auto"}
                                                        >
                                                            +
                                                        </Button>
                                                    </Flex>
                                                ) : addon.type === 'CHECKBOX' ? (
                                                    <Switch
                                                        isChecked={selectedAddons[addon.id] || false}
                                                        onChange={() => handleCheckboxChange(addon.id)}
                                                        isDisabled={changesConfirmed}
                                                        size={isMobile ? "sm" : "md"}
                                                        alignSelf="center"
                                                    />
                                                ) : null}
                                            </Flex>
                                        ))}
                                    </VStack>
                                ) : (
                                    <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                                        <Text align="center" fontSize={isMobile ? "sm" : "md"}>
                                            No add-ons available for this reservation
                                        </Text>
                                    </Box>
                                )}
                            </Box>

                            <VStack
                                bg="gray.50"
                                p={4}
                                borderRadius="md"
                                borderWidth="1px"
                                spacing={4}
                                align="stretch"
                                w={isMobile ? "100%" : "320px"}
                                minH={isMobile ? "auto" : "300px"}
                                maxH={isMobile ? "none" : "400px"}
                                overflowY={isMobile ? "visible" : "auto"}
                            >
                                {isLoadingAddons || isLoadingCardDetails || isLoadingPendingBalance ? (
                                    <HStack justifyContent="center">
                                        <Spinner size="sm"/>
                                        <Text>Loading...</Text>
                                    </HStack>
                                ) : (
                                    <>
                                        <Box w="100%">
                                            <Text 
                                                fontWeight="bold" 
                                                mb={2}
                                                fontSize={isMobile ? "sm" : "md"}
                                            >
                                                Purchase Summary
                                            </Text>
                                            <VStack align="stretch" spacing={2}>
                                                <HStack justify="space-between">
                                                    <Text fontSize={isMobile ? "sm" : "md"}>
                                                        {`Guests ($${(guestTotalPrice / booking.guestQuantity).toFixed(2)} × ${booking.guestQuantity})`}
                                                    </Text>
                                                    <Text fontSize={isMobile ? "sm" : "md"}>
                                                        ${guestTotalPrice.toFixed(2)}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                            {combinedAddons.length > 0 ? (
                                                combinedAddons.map((addon) => (
                                                    <HStack key={addon.id} justifyContent="space-between">
                                                        <Text fontSize={isMobile ? "sm" : "md"}>
                                                            {addon.label} (${addon.price} x {addon.quantity})
                                                        </Text>
                                                        <Text fontSize={isMobile ? "sm" : "md"}>
                                                            ${(addon.price * addon.quantity).toFixed(2)}
                                                        </Text>
                                                    </HStack>
                                                ))
                                            ) : (
                                                <Text fontSize={isMobile ? "sm" : "md"}>
                                                    No add-ons selected.
                                                </Text>
                                            )}
                                            <Divider my={2}/>
                                            <HStack justify="space-between">
                                                <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>
                                                    Total
                                                </Text>
                                                <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>
                                                    ${finalTotalPrice.toFixed(2)}
                                                </Text>
                                            </HStack>

                                            {totalBalanceDue !== 0 && (
                                                <HStack justify="space-between" mt={2}>
                                                    <Text 
                                                        fontWeight="bold"
                                                        fontSize={isMobile ? "sm" : "md"}
                                                        color={totalBalanceDue < 0 ? "green.500" : "red.500"}
                                                    >
                                                        {totalBalanceDue < 0 ? "Refund Due" : "Balance Due"}
                                                    </Text>
                                                    <Text 
                                                        fontWeight="bold"
                                                        fontSize={isMobile ? "sm" : "md"}
                                                        color={totalBalanceDue < 0 ? "green.500" : "red.500"}
                                                    >
                                                        ${Math.abs(totalBalanceDue).toFixed(2)}
                                                    </Text>
                                                </HStack>
                                            )}
                                        </Box>

                                        {cardDetails && (
                                            <Box>
                                                <Text 
                                                    fontWeight="bold" 
                                                    mb={2}
                                                    fontSize={isMobile ? "sm" : "md"}
                                                >
                                                    Payment Summary
                                                </Text>
                                                <VStack align="stretch" spacing={2}>
                                                    <HStack justify="space-between">
                                                        <HStack spacing={2}>
                                                            <Box 
                                                                as="span" 
                                                                role="img" 
                                                                aria-label="Card Icon"
                                                                fontSize={isMobile ? "md" : "lg"}
                                                            >
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
                                                    <HStack justify="space-between">
                                                        <Text fontSize={isMobile ? "sm" : "md"}>Paid</Text>
                                                        <Text fontSize={isMobile ? "sm" : "md"}>
                                                            ${paidTotal.toFixed(2)}
                                                        </Text>
                                                    </HStack>
                                                </VStack>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </VStack>
                        </Flex>
                    </ModalBody>

                    <ModalFooter flexDirection={isMobile ? "column" : "row"} gap={isMobile ? 2 : 0}>
                        <Flex 
                            justify={isMobile ? "stretch" : "flex-end"} 
                            align={isMobile ? "stretch" : "center"} 
                            w="100%"
                            direction={isMobile ? "column" : "row"}
                            gap={isMobile ? 2 : 0}
                        >
                            <Checkbox 
                                id="notifyCustomer" 
                                mr={isMobile ? 0 : 4}
                                mb={isMobile ? 2 : 0}
                                alignSelf={isMobile ? "flex-start" : "center"}
                            >
                                <Text fontSize={isMobile ? "sm" : "md"}>Notify Customer</Text>
                            </Checkbox>
                            <HStack 
                                spacing={2} 
                                width={isMobile ? "100%" : "auto"}
                                justifyContent={isMobile ? "stretch" : "flex-end"}
                            >
                                <Button 
                                    colorScheme="gray" 
                                    mr={isMobile ? 0 : 2} 
                                    onClick={onClose}
                                    flex={isMobile ? 1 : "auto"}
                                    size={isMobile ? "sm" : "md"}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={handleSaveChanges}
                                    isLoading={isSaving}
                                    isDisabled={changesConfirmed}
                                    flex={isMobile ? 1 : "auto"}
                                    size={isMobile ? "sm" : "md"}
                                >
                                    Save Changes
                                </Button>
                            </HStack>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {bookingChanges && (
                <CollectBalanceModal
                    isOpen={isCollectBalanceOpen}
                    onClose={onCollectBalanceClose}
                    bookingChanges={bookingChanges}
                    booking={booking}
                />
            )}
        </>
    );
}