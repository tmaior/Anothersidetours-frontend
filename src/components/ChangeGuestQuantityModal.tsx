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
} from "@chakra-ui/react";
import axios from "axios";
import PurchaseAndPaymentSummary from "./PurchaseAndPaymentSummary";
import { BsCheck2 } from "react-icons/bs";
import { FaRegCreditCard } from "react-icons/fa";
import { BsCash } from "react-icons/bs";

const CollectBalanceModal = ({ isOpen, onClose, bookingChanges, booking }) => {
    const toast = useToast();

    const handleCollectNow = async () => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status,
                paymentMethod: 'STANDARD'
            });

            if (response.data) {
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
        }
    };

    const handleCollectViaInvoice = async () => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status,
                paymentMethod: 'INVOICE'
            });

            if (response.data) {
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
        }
    };

    const handleCollectLater = async () => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status,
                paymentMethod: 'LATER'
            });

            if (response.data) {
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
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center">How Do You Want To Collect Balance?</ModalHeader>
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
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status
            });

            if (response.data) {
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
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: bookingChanges.newGuestQuantity,
                total_price: bookingChanges.newPrice,
                status: booking.status
            });

            if (response.data) {
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