import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    Divider,
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
    VStack,
} from "@chakra-ui/react";

const ChangeGuestQuantityModal = ({isOpen, onClose, booking}) => {
    const [guestCount, setGuestCount] = useState(booking.guestQuantity);

    useEffect(() => {
        if (isOpen) {
            setGuestCount(booking.guestQuantity);
        }
    }, [isOpen, booking]);

    const handleIncrease = () => setGuestCount(guestCount + 1);
    const handleDecrease = () => {
        if (guestCount > 1) setGuestCount(guestCount - 1);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Change Guest Quantity</ModalHeader>
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

                        <Box flex="1">
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Purchase Summary
                            </Text>
                            <VStack align="stretch" spacing={2} mb={4}>
                                {/*<Flex justify="space-between">*/}
                                {/*    <Text>Additional Fee For Airport Pick-Up</Text>*/}
                                {/*    <Text>$199.00</Text>*/}
                                {/*</Flex>*/}
                                <Flex justify="space-between">
                                    <Text>Guests (${booking.tour.price} x {guestCount})</Text>
                                    <Text>${booking.tour.price * guestCount}.00</Text>
                                </Flex>
                                <HStack justifyContent="space-between">

                                    {/*<Text>${reservation.total_price}</Text>*/}
                                </HStack>
                                <Divider/>
                                <Flex justify="space-between" fontWeight="bold">
                                    <Text>Total</Text>
                                    <Text>${booking.tour.price * guestCount}.00</Text>
                                </Flex>
                            </VStack>
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Payment Summary
                            </Text>
                            <VStack align="stretch">
                                <Flex justify="space-between">
                                    <Text>Payment</Text>
                                    <Text>*1011 &nbsp; 01/16/2025</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text>Paid</Text>
                                    <Text>${booking.total_price.toFixed(2)}</Text>
                                </Flex>
                            </VStack>
                        </Box>
                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Checkbox mr={4}>Notify Customer</Checkbox>
                    <Button variant="outline" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue">Modify</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ChangeGuestQuantityModal;
