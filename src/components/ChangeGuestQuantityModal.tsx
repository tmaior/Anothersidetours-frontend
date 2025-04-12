import React, {useEffect, useState} from "react";
import {
    Box,
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
    Table,
    TableContainer,
    Text,
    useToast,
    VStack,
    Icon,
    useDisclosure,
    Divider,
    InputGroup,
    InputLeftElement,
    Textarea,
    Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { BsCheck2 } from "react-icons/bs";
import { FaRegCreditCard } from "react-icons/fa";
import { BsCash } from "react-icons/bs";
import { BiCheck } from "react-icons/bi";
import { format } from 'date-fns';

const CollectPaymentModal = ({ isOpen, onClose, bookingChanges, booking }) => {
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
                `${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${booking.tourId}`
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
        
        try {
            setIsLoadingPendingBalance(true);
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
                        totalPending = transaction.amount;
                    } else {
                        totalPending = transaction.amount;
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

    const fetchTransactionAndCardInfo = async () => {
        try {
            setLoadingCardInfo(true);
            
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`
            );
            
            if (response.data && response.data.length > 0) {
                const createTransaction = response.data.find(t => 
                    t.transaction_type === 'CREATE' && 
                    (t.payment_method?.toLowerCase() === 'credit card' || 
                     t.payment_method?.toLowerCase() === 'card')
                );
                if (createTransaction) {
                    setOriginalTransaction(createTransaction);
                    setHasOriginalCardPayment(true);
                    setPaymentMethod('Credit Card');
                    const paymentMethodId = booking.paymentMethodId || 
                                          createTransaction.payment_method_id ||
                                          createTransaction.paymentMethodId;
                    
                    if (paymentMethodId) {
                        try {
                            const cardResponse = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${paymentMethodId}`
                            );
                            
                            if (cardResponse.data) {
                                setCardInfo({
                                    brand: cardResponse.data.brand,
                                    last4: cardResponse.data.last4
                                });
                            }
                        } catch (cardError) {
                            console.error("Error fetching card details:", cardError);
                            if (createTransaction.metadata && createTransaction.metadata.cardInfo) {
                                setCardInfo(createTransaction.metadata.cardInfo);
                            } else {
                                setCardInfo({
                                    brand: 'Card',
                                    last4: 'on file'
                                });
                            }
                        }
                    }
                } else {
                    setHasOriginalCardPayment(false);
                    setPaymentMethod('Cash');
                }
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
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`)
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
            const finalBookingChanges = {
                ...bookingChanges,
                finalAmount: bookingChanges?.finalAmount || Math.abs(bookingChanges?.priceDifference || 0),
                totalBalanceDue: bookingChanges?.totalBalanceDue || pendingBalance || 0
            };
            
            const isRefund = finalBookingChanges?.isRefund || finalBookingChanges?.priceDifference < 0;
            
            if (paymentMethod === 'Credit Card' && originalTransaction) {
                const paymentResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/process-transaction-payment`, {
                    transactionId: originalTransaction.id,
                    amount: finalBookingChanges.finalAmount,
                    paymentMethod: paymentMethod,
                    bookingId: booking.id,
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
                });

                if (paymentResponse.data) {
                    const bookingResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                        guestQuantity: finalBookingChanges.newGuestQuantity,
                        total_price: finalBookingChanges.newPrice,
                        status: booking.status
                    });

                    if (bookingResponse.data) {
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
            } else if (paymentMethod === 'Cash' || paymentMethod === 'Check') {
                const pendingTransactionsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`,
                    { params: { payment_status: 'pending' } }
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
                            transaction_direction: isRefund ? 'refund' : 'charge'
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
                const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                    bookingId: booking.id,
                    amount: finalBookingChanges.finalAmount,
                    paymentMethod: paymentMethod,
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
                });
                
                const bookingResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                    guestQuantity: finalBookingChanges.newGuestQuantity,
                    total_price: finalBookingChanges.newPrice,
                    status: booking.status
                });

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
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center">
                    {finalBalance < 0 ? "Process Refund" : "Collect Payment"}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex>
                        <Box flex="1" mr={4}>
                            <Text mb={2}>Amount</Text>
                            <InputGroup mb={4}>
                                <InputLeftElement pointerEvents="none">$</InputLeftElement>
                                <Input value={(bookingChanges?.priceDifference || 0).toFixed(2)} readOnly />
                            </InputGroup>

                            <Text mb={2}>Payment Method</Text>
                            <HStack spacing={2} mb={4}>
                                {hasOriginalCardPayment && (
                                    <Button
                                        size="sm"
                                        variant={paymentMethod === 'Credit Card' ? 'solid' : 'outline'}
                                        onClick={() => setPaymentMethod('Credit Card')}
                                        leftIcon={<FaRegCreditCard />}
                                    >
                                        Credit Card
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant={paymentMethod === 'Cash' ? 'solid' : 'outline'}
                                    onClick={() => setPaymentMethod('Cash')}
                                    leftIcon={<BsCash />}
                                >
                                    Cash
                                </Button>
                                <Button
                                    size="sm"
                                    variant={paymentMethod === 'Check' ? 'solid' : 'outline'}
                                    onClick={() => setPaymentMethod('Check')}
                                    leftIcon={<BiCheck />}
                                >
                                    Check
                                </Button>
                            </HStack>
                            <Button
                                size="sm"
                                variant={paymentMethod === 'Other' ? 'solid' : 'outline'}
                                onClick={() => setPaymentMethod('Other')}
                                mb={4}
                                colorScheme="blue"
                                bg={paymentMethod === 'Other' ? "blue.500" : "blue.50"}
                                color={paymentMethod === 'Other' ? "white" : "blue.500"}
                            >
                                Other
                            </Button>

                            {paymentMethod === 'Credit Card' && (
                                <Box mt={2} mb={4} p={3} borderWidth="1px" borderRadius="md">
                                    {loadingCardInfo ? (
                                        <Flex justify="center" py={2}>
                                            <Spinner size="sm" mr={2} />
                                            <Text>Loading card information...</Text>
                                        </Flex>
                                    ) : cardInfo ? (
                                        <Flex align="center">
                                            <Icon as={FaRegCreditCard} mr={2} />
                                            <Text>
                                                {cardInfo.brand || 'Card'} •••• •••• •••• {cardInfo.last4 || 'on file'}
                                            </Text>
                                        </Flex>
                                    ) : (
                                        <Text color="gray.500">No saved card information found</Text>
                                    )}
                                </Box>
                            )}

                            <Text mb={2}>Tag</Text>
                            <Input 
                                placeholder="Add a tag" 
                                value={tag} 
                                onChange={(e) => setTag(e.target.value)}
                            />
                        </Box>

                        <Box flex="1">
                            <VStack
                                bg="gray.50"
                                p={4}
                                borderRadius="md"
                                borderWidth="1px"
                                spacing={4}
                                align="stretch"
                                w="100%"
                                minH="300px"
                                maxH="400px"
                                overflowY="auto"
                            >
                                {isDataLoading ? (
                                    <HStack justifyContent="center">
                                        <Spinner size="sm"/>
                                        <Text>Loading...</Text>
                                    </HStack>
                                ) : (
                                    <>
                                        <Box>
                                            <Text fontWeight="bold" mb={2}>Purchase Summary</Text>
                                            <VStack align="stretch" spacing={2}>
                                                <HStack justify="space-between">
                                                    <Text>
                                                        {`Guests ($${pricePerGuest.toFixed(2)} × ${newGuestQuantity})`}
                                                    </Text>
                                                    <Text>${guestPrice.toFixed(2)}</Text>
                                                </HStack>
                                            </VStack>
                                            
                                            {combinedAddons.length > 0 ? (
                                                combinedAddons.map((addon) => (
                                                    <HStack key={addon.id} justifyContent="space-between">
                                                        <Text>{addon.label || 'Add-on'} (${addon.price} x {addon.quantity})</Text>
                                                        <Text>${(addon.price * addon.quantity).toFixed(2)}</Text>
                                                    </HStack>
                                                ))
                                            ) : (
                                                <Text>No add-ons selected.</Text>
                                            )}

                                            <Divider my={2}/>
                                            <HStack justify="space-between">
                                                <Text fontWeight="bold">Total</Text>
                                                <Text fontWeight="bold">${totalPrice.toFixed(2)}</Text>
                                            </HStack>
                                            
                                            {finalBalance !== 0 && (
                                                <HStack justify="space-between" mt={2}>
                                                    <Text fontWeight="bold" color={finalBalance < 0 ? "green.500" : "red.500"}>
                                                        {finalBalance < 0 ? "Refund Due" : "Balance Due"}
                                                    </Text>
                                                    <Text fontWeight="bold" color={finalBalance < 0 ? "green.500" : "red.500"}>
                                                        ${Math.abs(finalBalance).toFixed(2)}
                                                    </Text>
                                                </HStack>
                                            )}
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Text fontWeight="bold" mb={2}>Payment Summary</Text>
                                            {cardInfo && (
                                                <HStack justify="space-between">
                                                    <HStack spacing={2}>
                                                        <Box as="span" role="img" aria-label="Card Icon" fontSize="lg">
                                                            💳
                                                        </Box>
                                                        <Text>
                                                            Original Payment
                                                            <Box
                                                                as="span"
                                                                bg="white"
                                                                px={1}
                                                                py={1}
                                                                borderRadius="md"
                                                                boxShadow="sm"
                                                                ml={1}
                                                            >
                                                                *{cardInfo.last4}
                                                            </Box>
                                                        </Text>
                                                    </HStack>
                                                    <Text>${booking.total_price.toFixed(2)}</Text>
                                                </HStack>
                                            )}
                                            <HStack justify="space-between" mt={2}>
                                                <Text>Paid</Text>
                                                <Text>${booking.total_price.toFixed(2)}</Text>
                                            </HStack>
                                            
                                            <HStack justify="space-between" color={finalBalance < 0 ? "green.500" : "red.500"} fontWeight="bold" mt={2}>
                                                <Text>{finalBalance < 0 ? "Refund:" : "Balance Due:"}</Text>
                                                <Text>${Math.abs(finalBalance).toFixed(2)}</Text>
                                            </HStack>
                                            
                                            <HStack justify="space-between" fontWeight="bold" mt={2}>
                                                <Text>Final Total:</Text>
                                                <Text>${totalPrice.toFixed(2)}</Text>
                                            </HStack>
                                        </Box>
                                    </>
                                )}
                            </VStack>
                        </Box>
                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Flex width="100%" justifyContent="space-between" alignItems="center">
                        <Checkbox isChecked={notifyCustomer} onChange={(e) => setNotifyCustomer(e.target.checked)}>
                            Notify Customer
                        </Checkbox>
                        <HStack>
                            <Button colorScheme="gray" onClick={handleLater}>
                                Later
                            </Button>
                            <Button 
                                colorScheme="blue" 
                                onClick={handleCollect}
                                isLoading={isLoading}
                                loadingText="Processing"
                                isDisabled={paymentMethod === 'Credit Card' && !originalTransaction}
                            >
                                {finalBalance < 0 ? "Refund" : "Collect"}
                            </Button>
                        </HStack>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const CollectInvoiceModal = ({ isOpen, onClose, bookingChanges, booking }) => {
    const toast = useToast();
    const [tag, setTag] = useState('');
    const [message, setMessage] = useState('');
    const [daysBeforeArrival, setDaysBeforeArrival] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const getBookingDate = () => {
        try {
            if (booking.reservation_date) {
                const dateParts = booking.reservation_date.split('T')[0].split('-');
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);
                
                return new Date(year, month, day);
            }
            else if (booking.selectedDate) {
                const dateParts = booking.selectedDate.split('T')[0].split('-');
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);
                
                return new Date(year, month, day);
            }
            else if (booking.dateFormatted) {
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
            } 
            else if (booking.date) {
                return new Date(booking.date);
            } 
            else if (booking.tourDate) {
                return new Date(booking.tourDate);
            } 
            else {
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
        localDate.setDate(localDate.getDate() - daysBeforeArrival);
        
        return localDate;
    };
    
    const dueDate = calculateDueDate();
    const formattedDueDate = format(dueDate, 'MMMM d, yyyy');
    const formattedBookingDate = format(bookingDate, 'MMMM d, yyyy');
    const handleSendInvoice = async () => {
        try {
            setIsLoading(true);
            
            const isRefund = bookingChanges?.isRefund || bookingChanges?.priceDifference < 0;
            
            const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                bookingId: booking.id,
                amount: bookingChanges.finalAmount,
                paymentMethod: 'INVOICE',
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
            });
            const bookingResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status
            });

            if (transactionResponse.data && bookingResponse.data) {
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
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center">Collect Payment via Invoice</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text mb={2}>Amount</Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">$</InputLeftElement>
                                <Input value={bookingChanges?.priceDifference.toFixed(2)} readOnly />
                            </InputGroup>
                        </Box>
                        
                        <Box>
                            <Text mb={2}>Payment due</Text>
                            <Flex align="center">
                                <Input 
                                    type="number" 
                                    value={daysBeforeArrival} 
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        if (!isNaN(value)) {
                                            setDaysBeforeArrival(value);
                                        }
                                    }}
                                    width="60px"
                                    mr={2}
                                />
                                <Text mr={2}>days before arrival (due on {formattedDueDate})</Text>
                            </Flex>
                        </Box>

                        <Box>
                            <Text color="gray.500" fontSize="sm">
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
                            />
                        </Box>
                        
                        <Box>
                            <Text mb={2}>Tag</Text>
                            <Input 
                                placeholder="Add a tag" 
                                value={tag} 
                                onChange={(e) => setTag(e.target.value)}
                            />
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        colorScheme="blue" 
                        onClick={handleSendInvoice}
                        isLoading={isLoading}
                        loadingText="Sending"
                    >
                        Send Invoice
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const CollectBalanceModal = ({ isOpen, onClose, bookingChanges, booking }) => {
    const toast = useToast();
    const { isOpen: isPaymentModalOpen, onOpen: onPaymentModalOpen, onClose: onPaymentModalClose } = useDisclosure();
    const { isOpen: isInvoiceModalOpen, onOpen: onInvoiceModalOpen, onClose: onInvoiceModalClose } = useDisclosure();

    const handleCollectNow = () => {
        onClose();
        onPaymentModalOpen();
    };

    const handleCollectViaInvoice = () => {
        onClose();
        onInvoiceModalOpen();
    };

    const handleCollectLater = async () => {
        try {
            const isRefund = bookingChanges?.isRefund || false;
            const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                bookingId: booking.id,
                amount: bookingChanges.finalAmount,
                paymentMethod: 'LATER',
                type: isRefund ? 'GUEST_QUANTITY_REFUND' : 'GUEST_QUANTITY_CHANGE',
                transaction_direction: isRefund ? 'refund' : 'charge',
                notifyCustomer: false,
                metadata: {
                    originalGuestQuantity: bookingChanges.originalGuestQuantity,
                    newGuestQuantity: bookingChanges.newGuestQuantity,
                    originalPrice: bookingChanges.originalPrice,
                    newPrice: bookingChanges.newPrice,
                    totalBalanceDue: bookingChanges.totalBalanceDue,
                    isRefund: isRefund
                }
            });
            const bookingResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status
            });

            if (transactionResponse.data && bookingResponse.data) {
                toast({
                    title: "Success",
                    description: "Booking updated. Balance will be collected later.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                window.location.reload();
                onClose();
            }
        } catch (error) {
            console.error("Failed to update booking:", error);
            toast({
                title: "Error",
                description: "Failed to update booking. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign="center">
                        {bookingChanges?.isRefund 
                            ? "How Do You Want To Process Refund?" 
                            : "How Do You Want To Collect Balance?"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box
                                as="button"
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                onClick={handleCollectNow}
                                _hover={{ bg: "gray.50" }}
                            >
                                <Flex align="center">
                                    <Icon as={FaRegCreditCard} boxSize={5} mr={4} />
                                    <Box textAlign="left">
                                        <Text fontWeight="bold">
                                            {bookingChanges?.isRefund 
                                                ? "Process Refund Now" 
                                                : "Collect Balance Now"}
                                        </Text>
                                        <Text>
                                            Use standard methods of {bookingChanges?.isRefund 
                                                ? "processing refund" 
                                                : "collecting balance"}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>

                            <Box
                                as="button"
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                onClick={handleCollectViaInvoice}
                                _hover={{ bg: "gray.50" }}
                            >
                                <Flex align="center">
                                    <Icon as={BsCheck2} boxSize={5} mr={4} />
                                    <Box textAlign="left">
                                        <Text fontWeight="bold">
                                            {bookingChanges?.isRefund 
                                                ? "Process Refund via Invoice" 
                                                : "Collect Balance via Invoice"}
                                        </Text>
                                        <Text>Send an invoice to the organizer</Text>
                                    </Box>
                                </Flex>
                            </Box>

                            <Box
                                as="button"
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                onClick={handleCollectLater}
                                _hover={{ bg: "gray.50" }}
                            >
                                <Flex align="center">
                                    <Icon as={BsCash} boxSize={5} mr={4} />
                                    <Box textAlign="left">
                                        <Text fontWeight="bold">
                                            {bookingChanges?.isRefund 
                                                ? "Process Refund Later" 
                                                : "Collect Balance Later"}
                                        </Text>
                                        <Text>
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
                        <Button colorScheme="blue" variant="outline" onClick={onClose}>
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

const ChangeGuestQuantityModal = ({isOpen, onClose, booking, guestCount, setGuestCount }) => {
    const [tierPricing, setTierPricing] = useState(null);
    const [bookingChanges, setBookingChanges] = useState(null);
    const [changesConfirmed, setChangesConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [isLoadingPendingBalance, setIsLoadingPendingBalance] = useState(true);
    const [cardDetails, setCardDetails] = useState(null);
    const [isLoadingCardDetails, setIsLoadingCardDetails] = useState(true);
    const toast = useToast();
    const { isOpen: isCollectBalanceOpen, onOpen: onCollectBalanceOpen, onClose: onCollectBalanceClose } = useDisclosure();

    useEffect(() => {
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

        const fetchCardDetails = async () => {
            if (!booking?.paymentMethodId) {
                setIsLoadingCardDetails(false);
                return;
            }
            setIsLoadingCardDetails(true);
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

        if (isOpen) {
            setGuestCount(booking.guestQuantity);
            setChangesConfirmed(false);
            setBookingChanges(null);
            fetchTierPricing();
            fetchPendingTransactions();
            fetchCardDetails();
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
            const updatedTotalPrice = calculateGuestPrice();

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
                { params: { payment_status: 'pending' } }
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
                finalAmount: finalAmount
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
                            totalBalanceDue: totalBalanceDue
                        }
                    }
                );
                
                transactionSuccess = true;
            } else if (createTransaction && priceDifference > 0) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/${createTransaction.id}`,
                    {
                        amount: createTransaction.amount + finalAmount
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
                        totalBalanceDue: totalBalanceDue
                    }
                };

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`,
                    transactionData
                );
                
                transactionSuccess = true;
            }
            
            try {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                    guestQuantity: guestCount,
                    total_price: updatedTotalPrice,
                    status: booking.status
                });
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

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader textAlign={"center"}>Change Guest Quantity</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex>
                            <Box flex="1" mr={6}>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>
                                    Guest Summary
                                </Text>
                                <Flex align="center" mb={4}>
                                    <Text mr={2}>Guests</Text>
                                    <HStack spacing={2}>
                                        <Button size="sm" onClick={handleDecrease} isDisabled={changesConfirmed}>
                                            -
                                        </Button>
                                        <Input
                                            size="sm"
                                            width="50px"
                                            textAlign="center"
                                            value={guestCount}
                                            isReadOnly
                                        />
                                        <Button size="sm" onClick={handleIncrease} isDisabled={changesConfirmed}>
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

                            <Box flex="1">
                                <VStack
                                    bg="gray.50"
                                    p={6}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    spacing={6}
                                    align="stretch"
                                    w="100%"
                                    h="350px"
                                    minW="300px"
                                    minH="300px"
                                >
                                    {isLoadingPendingBalance || isLoadingCardDetails ? (
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
                                                            {`Guests ($${(guestTotalPrice / guestCount).toFixed(2)} × ${guestCount})`}
                                                        </Text>
                                                        <Text>${guestTotalPrice.toFixed(2)}</Text>
                                                    </HStack>
                                                </VStack>
                                                <Text>No add-ons selected.</Text>
                                                <Divider my={2}/>
                                                <HStack justify="space-between">
                                                    <Text fontWeight="bold">Total</Text>
                                                    <Text fontWeight="bold">${guestTotalPrice.toFixed(2)}</Text>
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
                            </Box>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Checkbox mr={4}>Notify Customer</Checkbox>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        {!changesConfirmed ? (
                            <Button 
                                colorScheme="blue" 
                                onClick={handleChangeConfirm}
                                isLoading={isLoading}
                                loadingText="Updating"
                            >
                                Modify
                            </Button>
                        ) : (
                            <Button 
                                colorScheme="green" 
                                onClick={handleComplete} 
                                leftIcon={<BsCheck2 />}
                            >
                                Done
                            </Button>
                        )}
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
export { CollectBalanceModal };