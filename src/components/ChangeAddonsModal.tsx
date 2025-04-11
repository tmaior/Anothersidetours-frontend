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
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import axios from "axios";
import { CollectBalanceModal } from "./ChangeGuestQuantityModal";

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
    const { isOpen: isCollectBalanceOpen, onOpen: onCollectBalanceOpen, onClose: onCollectBalanceClose } = useDisclosure();

    useEffect(() => {
        const fetchAddons = async () => {
            if (!booking?.id || !booking.tourId) return;

            try {
                const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`)
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
                    { params: { payment_status: 'pending' } }
                );
                
                if (response.data && response.data.length > 0) {
                    const filteredTransactions = response.data.filter(
                        transaction => transaction.transaction_type !== 'CREATE'
                    );
                    const totalPending = filteredTransactions.reduce(
                        (sum, transaction) => sum + transaction.amount, 
                        0
                    );
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
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${booking.paymentMethodId}`
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
                    `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${booking.tourId}`
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
                { params: { payment_status: 'pending' } }
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
                    }
                );
                
                transactionSuccess = true;
            } else if (createTransaction && priceDifference > 0) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${createTransaction.id}`,
                    {
                        amount: createTransaction.amount + priceDifference
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
                            }
                        );
                        const transactionData = {
                            tenant_id: booking.tenantId,
                            reservation_id: booking.id,
                            amount: finalAmount,
                            payment_status: 'pending',
                            transaction_type: transactionType,
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
                            transactionData
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
                    transactionData
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
                            });
                        } else {
                            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons`, {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                                addonId,
                                value: value.toString(),
                            });
                        }
                    } else if (reservationAddonId) {
                        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
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
                            });
                        } else {
                            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons`, {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                                addonId,
                                value: "1",
                            });
                        }
                    } else if (reservationAddonId) {
                        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
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
            <Modal isOpen={isOpen} onClose={onClose} size="3xl">
                <ModalOverlay/>
                <ModalContent>
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
            <Modal isOpen={isOpen} onClose={onClose} size="3xl">
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader textAlign="center">Change Add-Ons</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <HStack align="start" spacing={20}>
                            <VStack spacing={4} align="stretch">
                                {allAddons.map(addon => (
                                    <Flex key={addon.id} justify="space-between" align="center" gap={20}>
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold">{addon.label}</Text>
                                            <Text color="gray.500">${addon.price.toFixed(2)}</Text>
                                        </VStack>
                                        {addon.type === 'SELECT' ? (
                                            <Flex align="center">
                                                <Button size="sm" onClick={() => handleDecrement(addon.id)}
                                                        disabled={selectedAddons[addon.id] <= 0 || changesConfirmed}>
                                                    -
                                                </Button>
                                                <Input
                                                    value={selectedAddons[addon.id] || 0}
                                                    readOnly
                                                    w="50px"
                                                    textAlign="center"
                                                    mx={2}
                                                />
                                                <Button size="sm" onClick={() => handleIncrement(addon.id)} 
                                                        disabled={changesConfirmed}>
                                                    +
                                                </Button>
                                            </Flex>
                                        ) : addon.type === 'CHECKBOX' ? (
                                            <Switch
                                                isChecked={selectedAddons[addon.id] || false}
                                                onChange={() => handleCheckboxChange(addon.id)}
                                                isDisabled={changesConfirmed}
                                            />
                                        ) : null}
                                    </Flex>
                                ))}
                            </VStack>
                            <VStack
                                bg="gray.50"
                                p={6}
                                borderRadius="md"
                                borderWidth="1px"
                                flex="2"
                                spacing={6}
                                align="stretch"
                                w="100%"
                                h="350px"
                                minW="300px"
                                minH="300px"
                            >
                                {isLoadingAddons || isLoadingCardDetails || isLoadingPendingBalance ? (
                                    <HStack justifyContent="center">
                                        <Spinner size="sm"/>
                                        <Text>Loading...</Text>
                                    </HStack>
                                ) : (
                                    <>
                                        <Box padding="10px" w="100%" h="500px">
                                            <Text fontWeight="bold" mb={2}>
                                                Purchase Summary
                                            </Text>
                                            <VStack align="stretch" spacing={2}>
                                                <HStack justify="space-between">
                                                    <Text>
                                                        {`Guests ($${(guestTotalPrice / booking.guestQuantity).toFixed(2)} × ${booking.guestQuantity})`}
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
                                            <Divider my={2}/>
                                            <HStack justify="space-between">
                                                <Text fontWeight="bold">Total</Text>
                                                <Text fontWeight="bold">${finalTotalPrice.toFixed(2)}</Text>
                                            </HStack>
                                            
                                            {totalBalanceDue !== 0 && (
                                                <HStack justify="space-between" mt={2}>
                                                    <Text fontWeight="bold" color={isRefund ? "green.500" : "red.500"}>
                                                        {isRefund ? "Refund Due" : "Balance Due"}
                                                    </Text>
                                                    <Text fontWeight="bold" color={isRefund ? "green.500" : "red.500"}>
                                                        ${displayBalanceValue.toFixed(2)}
                                                    </Text>
                                                </HStack>
                                            )}
                                        </Box>
                                        <Box>
                                            <Text fontWeight="bold" mb={2}>
                                                Payment Summary
                                            </Text>
                                            <VStack align="stretch" spacing={2}>
                                                {cardDetails && (
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
                                                )}
                                                <HStack justify="space-between">
                                                    <Text>Paid</Text>
                                                    <Text>${paidTotal.toFixed(2)}</Text>
                                                </HStack>
                                            </VStack>
                                        </Box>
                                    </>
                                )}
                            </VStack>
                        </HStack>
                    </ModalBody>

                    <ModalFooter>
                        <Flex justify="flex-end" align="center" w="100%">
                            <Checkbox id="notifyCustomer" mr={4}>
                                Notify Customer
                            </Checkbox>
                            <Button colorScheme="gray" mr={2} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button 
                                colorScheme="blue" 
                                onClick={handleSaveChanges} 
                                isLoading={isSaving}
                                isDisabled={changesConfirmed}
                            >
                                Save Changes
                            </Button>
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