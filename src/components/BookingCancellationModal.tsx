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
    ModalBody, ModalCloseButton,
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
import React, {useState, useEffect} from "react";
import {FaRegCreditCard} from "react-icons/fa";
import {BsCash} from "react-icons/bs";
import axios from "axios";

const BookingCancellationModal = ({booking, isOpen, onClose, onStatusChange}) => {
    const [refundAmount, setRefundAmount] = useState(booking.total_price || 0);
    const [paymentMethod, setPaymentMethod] = useState("Credit Card");
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [comment, setComment] = useState("");
    const [originalTransaction, setOriginalTransaction] = useState(null);
    const [cardInfo, setCardInfo] = useState(null);
    const [loadingCardInfo, setLoadingCardInfo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen && paymentMethod === 'Credit Card') {
            fetchOriginalTransaction();
        }
    }, [isOpen, paymentMethod, booking?.id]);

    const fetchOriginalTransaction = async () => {
        try {
            setLoadingCardInfo(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${booking.id}`
            );
            
            if (response.data && response.data.length > 0) {
                const createTransaction = response.data.find(t => t.transaction_type === 'CREATE');
                if (createTransaction) {
                    setOriginalTransaction(createTransaction);
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

    const handleSaveChanges = async () => {
        try {
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
                const paymentResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/process-transaction-payment`, {
                    transactionId: originalTransaction.id,
                    amount: refundAmount,
                    paymentMethod: paymentMethod,
                    bookingId: booking.id,
                    tag: "Cancellation",
                    notifyCustomer: notifyCustomer,
                    type: 'CANCELLATION_REFUND',
                    transaction_direction: 'refund',
                    metadata: {
                        originalPrice: booking.total_price,
                        refundAmount: refundAmount,
                        comment: comment,
                        refundDate: new Date().toISOString()
                    }
                });

                if (paymentResponse.data) {
                    const bookingResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                        status: "CANCELED"
                    });

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
                }
            } else if (paymentMethod === 'Cash') {
                const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                    tenant_id: booking.tenantId,
                    reservation_id: booking.id,
                    amount: refundAmount,
                    payment_status: 'completed',
                    payment_method: 'Cash',
                    transaction_type: 'CANCELLATION_REFUND',
                    transaction_direction: 'refund',
                    notifyCustomer: notifyCustomer,
                    metadata: {
                        originalPrice: booking.total_price,
                        refundAmount: refundAmount,
                        comment: comment,
                        refundDate: new Date().toISOString()
                    }
                });
                
                if (transactionResponse.data) {
                    const bookingResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                        status: "CANCELED"
                    });

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
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/generate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: refundAmount,
                        originReservationId: booking.id,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({status: "CANCELED"}),
                    });

                    if (onStatusChange) {
                        onStatusChange("CANCELED");
                    }

                    toast({
                        title: "Store Credit Issued",
                        description: `Voucher ${data.voucher.code} created successfully.`,
                        status: "success",
                        duration: 4000,
                        isClosable: true,
                    });
                    onClose();
                } else {
                    throw new Error(data.message || "Failed to generate voucher");
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
                <ModalCloseButton />
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
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                                    />
                                    <Text fontSize="sm" mt={1}>
                                        up to ${booking.total_price || 0}
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text mb={2}>Payment Method</Text>
                                    <HStack spacing={3}>
                                        <Button
                                            variant={paymentMethod === "Credit Card" ? "solid" : "outline"}
                                            onClick={() => setPaymentMethod("Credit Card")}
                                            leftIcon={<FaRegCreditCard />}
                                            isDisabled={!originalTransaction}
                                        >
                                            Credit Card
                                        </Button>
                                        <Button
                                            size="md"
                                            leftIcon={<BsCash />}
                                            variant={paymentMethod === "Cash" ? "solid" : "outline"}
                                            onClick={() => setPaymentMethod("Cash")}
                                        >
                                            Cash
                                        </Button>
                                        <Button
                                            variant={paymentMethod === "store" ? "solid" : "outline"}
                                            onClick={() => setPaymentMethod("store")}
                                        >
                                            Store Credit
                                        </Button>
                                        <Button
                                            variant={paymentMethod === "other" ? "solid" : "outline"}
                                            onClick={() => setPaymentMethod("other")}
                                        >
                                            Other
                                        </Button>
                                    </HStack>
                                </Box>

                                {paymentMethod === 'Credit Card' && (
                                    <Box w="full" mt={2} mb={4} p={3} borderWidth="1px" borderRadius="md">
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
                                    <VStack align="stretch" spacing={3}>
                                        <HStack justifyContent="space-between">
                                            <Text>Guests (${booking.valuePerGuest || (booking.total_price / booking.guestQuantity) || 149} x {booking.guestQuantity || 2})</Text>
                                            <Text>${booking.total_price}</Text>
                                        </HStack>
                                        <HStack justifyContent="space-between">
                                            <Text>Cancellation:</Text>
                                            <Text>-${refundAmount}</Text>
                                        </HStack>
                                    </VStack>
                                    <Divider/>
                                    <Text fontWeight="bold" align={"end"}>Total: ${booking.total_price - refundAmount}</Text>
                                </Box>
                                <Box w="full">
                                    <Text fontWeight="bold">Payment Summary</Text>
                                    <VStack align="stretch" spacing={3}>
                                        <HStack justifyContent="space-between">
                                            <Text>
                                                Payment {booking.date || "01/02/2025"}:
                                            </Text>
                                            <Text fontWeight="bold">
                                                ${booking.total_price}
                                            </Text>
                                        </HStack>

                                        <HStack justifyContent="space-between">
                                            <Text color="blue.500">
                                                Return Payment {new Date().toLocaleDateString()}:
                                            </Text>
                                            <Text fontWeight="bold" color="blue.500">
                                                -${refundAmount}
                                            </Text>
                                        </HStack>
                                    </VStack>

                                    <Divider mt={4}/>
                                    <Text fontWeight="bold" align={"end"}>Paid: ${booking.total_price - refundAmount}</Text>
                                </Box>

                            </VStack>
                        </HStack>
                    </Box>
                </ModalBody>

                <ModalFooter alignItems={"end"}>
                    <HStack>
                        <Checkbox>Notify Customer</Checkbox>
                        <Button onClick={onClose}>Skip</Button>
                        <Button colorScheme="blue" onClick={handleSaveChanges}>
                            Save Changes</Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BookingCancellationModal;
