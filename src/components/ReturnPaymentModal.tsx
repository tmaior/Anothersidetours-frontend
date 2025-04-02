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
    };
}

const ReturnPaymentModal: React.FC<ReturnPaymentModalProps> = ({
    isOpen,
    onClose,
    booking,
}) => {
    const toast = useToast();
    const [amount, setAmount] = useState(booking?.total_price || 0);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [comment, setComment] = useState('');
    const [cardList, setCardList] = useState<CardDetails[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCardsFromSetupIntent = async () => {
            console.log('Booking data:', booking);
            
            if (!booking?.paymentMethodId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-method/${booking.paymentMethodId}`
                );
                console.log('Payment Method Response:', response.data);

                if (response.data) {
                    const cardData: CardDetails = {
                        id: booking.paymentMethodId,
                        brand: response.data.brand,
                        last4: response.data.last4,
                        paymentDate: response.data.paymentDate
                    };
                    
                    console.log('Card data formatted:', cardData);
                    setCardList([cardData]);
                    setSelectedCardId(cardData.id);
                }
            } catch (error) {
                console.error('Error fetching card details:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to fetch card details',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchCardsFromSetupIntent();
        }
    }, [booking?.paymentMethodId, isOpen, toast]);

    const handleSaveChanges = async () => {
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

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/refund`, {
                bookingId: booking.id,
                paymentMethodId: selectedCardId,
                amount,
                reason: 'return_payment_only',
                notifyCustomer,
                comment,
            });

            toast({
                title: 'Success',
                description: 'Refund processed successfully!',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onClose();
        } catch (error) {
            console.error('Error processing refund:', error);
            toast({
                title: 'Error',
                description: 'Failed to process refund',
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
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        type="number"
                                        placeholder="Enter amount"
                                    />
                                    <Text fontSize="sm" color="gray.600" mt={1}>
                                        up to ${booking?.total_price}
                                    </Text>
                                </Box>

                                <Box>
                                    <Text mb={2}>Payment Method</Text>
                                    <HStack spacing={2}>
                                        <Button
                                            leftIcon={<FaRegCreditCard />}
                                            variant={paymentMethod === 'credit_card' ? 'solid' : 'outline'}
                                            onClick={() => setPaymentMethod('credit_card')}
                                        >
                                            Credit Card
                                        </Button>
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

                                {paymentMethod === 'credit_card' && (
                                    <Box>
                                        <Text mb={2}>Credit Card</Text>
                                        <Select
                                            value={selectedCardId ?? ''}
                                            onChange={(e) => setSelectedCardId(e.target.value)}
                                            placeholder={isLoading ? 'Loading cards...' : 'Select a card'}
                                            isDisabled={isLoading}
                                        >
                                            {cardList.map((card) => {
                                                const brandName = card.brand.charAt(0).toUpperCase() + card.brand.slice(1);
                                                return (
                                                    <option key={card.id} value={card.id}>
                                                        {brandName} **** **** **** {card.last4}
                                                    </option>
                                                );
                                            })}
                                        </Select>
                                        <Text fontSize="sm" color="gray.600" mt={1}>
                                            Refund will be processed to the selected card
                                        </Text>
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
                                    <HStack justify="space-between">
                                        <Text>Guests (${booking?.total_price / 3} × 3)</Text>
                                        <Text>${booking?.total_price}</Text>
                                    </HStack>
                                    <HStack justify="space-between" mt={2}>
                                        <Text fontWeight="bold">Total</Text>
                                        <Text fontWeight="bold">${booking?.total_price}</Text>
                                    </HStack>
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
                                                <HStack justify="space-between" color="blue.500">
                                                    <Text>
                                                        Return Payment *{cardList[0].last4} {formatDate(new Date().toISOString())}
                                                    </Text>
                                                    <Text>-${amount}</Text>
                                                </HStack>
                                            </>
                                        )}
                                    </VStack>
                                    <HStack justify="space-between" mt={4}>
                                        <Text fontWeight="bold">Paid</Text>
                                        <Text fontWeight="bold">${booking?.total_price - amount}</Text>
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