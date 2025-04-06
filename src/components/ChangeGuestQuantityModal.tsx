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
} from "@chakra-ui/react";
import axios from "axios";
import PurchaseAndPaymentSummary from "./PurchaseAndPaymentSummary";
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

    const handleCollect = async () => {
        try {
            setIsLoading(true);
            const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                bookingId: booking.id,
                amount: bookingChanges.priceDifference,
                paymentMethod: paymentMethod,
                tag: tag || null,
                notifyCustomer: notifyCustomer,
                type: 'GUEST_QUANTITY_CHANGE',
                metadata: {
                    originalGuestQuantity: bookingChanges.originalGuestQuantity,
                    newGuestQuantity: bookingChanges.newGuestQuantity,
                    originalPrice: bookingChanges.originalPrice,
                    newPrice: bookingChanges.newPrice
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
                    description: "Payment collected and booking updated successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                window.location.reload();
                onClose();
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center">Collect Payment</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex>
                        <Box flex="1" mr={4}>
                            <Text mb={2}>Amount</Text>
                            <InputGroup mb={4}>
                                <InputLeftElement pointerEvents="none">$</InputLeftElement>
                                <Input value={bookingChanges?.priceDifference.toFixed(2)} readOnly />
                            </InputGroup>

                            <Text mb={2}>Payment Method</Text>
                            <HStack spacing={2} mb={4}>
                                <Button
                                    size="sm"
                                    variant={paymentMethod === 'Credit Card' ? 'solid' : 'outline'}
                                    onClick={() => setPaymentMethod('Credit Card')}
                                    leftIcon={<FaRegCreditCard />}
                                >
                                    Credit Card
                                </Button>
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

                            <Text mb={2}>Tag</Text>
                            <Input 
                                placeholder="Add a tag" 
                                value={tag} 
                                onChange={(e) => setTag(e.target.value)}
                            />
                        </Box>

                        <Box flex="1" bg="gray.50" p={4} borderRadius="md">
                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontWeight="bold" mb={2}>Purchase Summary</Text>
                                    <Flex justify="space-between">
                                        <Text>Guests (${(booking.valuePerGuest || booking.tour?.price || 0).toFixed(2)} × {bookingChanges?.newGuestQuantity})</Text>
                                        <Text>${bookingChanges?.newPrice.toFixed(2)}</Text>
                                    </Flex>
                                    <Flex justify="space-between" fontWeight="bold" mt={2}>
                                        <Text>Total</Text>
                                        <Text>${bookingChanges?.newPrice.toFixed(2)}</Text>
                                    </Flex>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontWeight="bold" mb={2}>Payment Summary</Text>
                                    <Flex justify="space-between">
                                        <Text>Payment {format(new Date(), 'MM/dd/yyyy')}</Text>
                                        <Text>${booking.total_price.toFixed(2)}</Text>
                                    </Flex>
                                    <Flex justify="space-between" color="blue.500">
                                        <Text>Payment</Text>
                                        <Text>${bookingChanges?.priceDifference.toFixed(2)}</Text>
                                    </Flex>
                                    <Flex justify="space-between" fontWeight="bold" mt={2}>
                                        <Text>Paid</Text>
                                        <Text>${bookingChanges?.newPrice.toFixed(2)}</Text>
                                    </Flex>
                                </Box>
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
                            >
                                Collect
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
            
            const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                bookingId: booking.id,
                amount: bookingChanges.priceDifference,
                paymentMethod: 'INVOICE',
                type: 'GUEST_QUANTITY_CHANGE',
                notifyCustomer: true,
                tag: tag || null,
                message: message || null,
                dueDate: dueDate.toISOString(),
                metadata: {
                    originalGuestQuantity: bookingChanges.originalGuestQuantity,
                    newGuestQuantity: bookingChanges.newGuestQuantity,
                    originalPrice: bookingChanges.originalPrice,
                    newPrice: bookingChanges.newPrice
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
            const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                bookingId: booking.id,
                amount: bookingChanges.priceDifference,
                paymentMethod: 'LATER',
                type: 'GUEST_QUANTITY_CHANGE',
                notifyCustomer: false,
                metadata: {
                    originalGuestQuantity: bookingChanges.originalGuestQuantity,
                    newGuestQuantity: bookingChanges.newGuestQuantity,
                    originalPrice: bookingChanges.originalPrice,
                    newPrice: bookingChanges.newPrice
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
                    <ModalHeader textAlign="center">How Do You Want To Collect Balance?</ModalHeader>
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
                                        <Text fontWeight="bold">Collect Balance Now</Text>
                                        <Text>Use standard methods of collecting balance</Text>
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
                                        <Text fontWeight="bold">Collect Balance via Invoice</Text>
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
                                        <Text fontWeight="bold">Collect Balance Later</Text>
                                        <Text>Collect balance later</Text>
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

        if (isOpen) {
            setGuestCount(booking.guestQuantity);
            setChangesConfirmed(false);
            setBookingChanges(null);
            fetchTierPricing();
        }
    }, [setGuestCount, isOpen, booking]);

    const calculateGuestPrice = () => {
        if (!tierPricing) {
            return (booking.valuePerGuest || booking.tour?.price) * guestCount;
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

    const handleIncrease = () => setGuestCount(guestCount + 1);
    const handleDecrease = () => {
        if (guestCount > 1) setGuestCount(guestCount - 1);
    };

    const handleChangeConfirm = () => {
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

        try {
            const updatedTotalPrice = calculateGuestPrice();
            const priceDifference = updatedTotalPrice - booking.total_price;

            setBookingChanges({
                originalGuestQuantity: booking.guestQuantity,
                newGuestQuantity: guestCount,
                originalPrice: booking.total_price,
                newPrice: updatedTotalPrice,
                priceDifference: priceDifference
            });

            setChangesConfirmed(true);
            
            toast({
                title: "Success",
                description: "Changes confirmed. Click 'Complete' to proceed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Failed to calculate changes:", error);
            toast({
                title: "Error",
                description: "Failed to calculate changes. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleComplete = () => {
        if (!bookingChanges) {
            toast({
                title: "Error",
                description: "No changes found. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        if (bookingChanges.priceDifference > 0) {
            onCollectBalanceOpen();
            onClose();
        } else if (bookingChanges.priceDifference < 0) {
            handleNegativePriceDifference();
        } else {
            handleNoPriceDifference();
        }
    };
    
    const handleNegativePriceDifference = async () => {
        try {
            const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                bookingId: booking.id,
                amount: Math.abs(bookingChanges.priceDifference),
                paymentMethod: 'REFUND',
                type: 'GUEST_QUANTITY_CHANGE',
                notifyCustomer: true,
                metadata: {
                    originalGuestQuantity: bookingChanges.originalGuestQuantity,
                    newGuestQuantity: bookingChanges.newGuestQuantity,
                    originalPrice: bookingChanges.originalPrice,
                    newPrice: bookingChanges.newPrice
                }
            });
            
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status
            });

            if (response.data && transactionResponse.data) {
                toast({
                    title: "Success",
                    description: "Reservation updated. Refund process initiated.",
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
    
    const handleNoPriceDifference = async () => {
        try {
            const transactionResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/transaction`, {
                bookingId: booking.id,
                amount: 0,
                paymentMethod: 'NO_CHANGE',
                type: 'GUEST_QUANTITY_CHANGE',
                notifyCustomer: false,
                metadata: {
                    originalGuestQuantity: bookingChanges.originalGuestQuantity,
                    newGuestQuantity: bookingChanges.newGuestQuantity,
                    originalPrice: bookingChanges.originalPrice,
                    newPrice: bookingChanges.newPrice
                }
            });
            
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status
            });

            if (response.data && transactionResponse.data) {
                toast({
                    title: "Success",
                    description: "Reservation updated successfully.",
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

                            <HStack align="center">
                                <PurchaseAndPaymentSummary
                                    booking={booking}
                                    guestQuantity={guestCount}
                                />
                            </HStack>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Checkbox mr={4}>Notify Customer</Checkbox>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        {!changesConfirmed ? (
                            <Button colorScheme="blue" onClick={handleChangeConfirm}>
                                Change
                            </Button>
                        ) : (
                            <Button colorScheme="green" onClick={handleComplete} leftIcon={<BsCheck2 />}>
                                Complete
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