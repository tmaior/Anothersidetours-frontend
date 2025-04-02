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
} from "@chakra-ui/react";
import axios from "axios";
import PurchaseAndPaymentSummary from "./PurchaseAndPaymentSummary";

const ChangeGuestQuantityModal = ({isOpen, onClose, booking, guestCount, setGuestCount }) => {
    const [tierPricing, setTierPricing] = useState(null);
    const toast = useToast();

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

    const handleModify = async () => {
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

            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${booking.id}`, {
                guestQuantity: guestCount,
                total_price: updatedTotalPrice,
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
            console.error("Failed to update reservation:", error);
            toast({
                title: "Error",
                description: "Failed to update reservation. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
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
                                    <Button size="sm" onClick={handleDecrease}>
                                        -
                                    </Button>
                                    <Input
                                        size="sm"
                                        width="50px"
                                        textAlign="center"
                                        value={guestCount}
                                        isReadOnly
                                    />
                                    <Button size="sm" onClick={handleIncrease}>
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
                    <Button colorScheme="blue" onClick={handleModify}>
                        Modify
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ChangeGuestQuantityModal;