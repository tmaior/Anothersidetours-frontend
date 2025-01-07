import {
    Box,
    Button,
    Checkbox,
    Divider,
    HStack,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import {useState} from "react";

const BookingCancellationModal = ({booking, isOpen, onClose}) => {
    const [amount, setAmount] = useState(booking.total || 298);
    const [method, setMethod] = useState("other");

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="5xl">
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader textAlign="center">
                    Reduce Booking Value and Return Payment
                </ModalHeader>
                <ModalBody>
                    <Box>
                        <HStack align="start" spacing={10}>
                            <VStack align="start" spacing={5} flex="2.5">
                                <Box w="full" p={4} borderWidth="1px" borderRadius="md" bg="gray.100">
                                    <Text fontWeight="bold">{booking.clientName || "BOB"}</Text>
                                    <Divider/>
                                    <HStack marginTop={"5px"}>
                                        <Image
                                            src={"https://via.placeholder.com/150x100"}
                                            // alt={tour.name}
                                            boxSize="70px"
                                            borderRadius="md"
                                        />
                                        <VStack align="start">
                                            <Text fontWeight={"bold"}>
                                                {booking.title || "Beyond The Billboards: Hollywood Sign Hike"}
                                            </Text>
                                            <Text>
                                                {booking.date || "Thu January 2, 2025"} at{" "}
                                                {booking.time || "10:00 AM"}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </Box>

                                <Box w="full">
                                    <Text mb={2}>Amount</Text>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    <Text fontSize="sm" mt={1}>
                                        up to ${booking.total || 298}
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text mb={2}>Payment Method</Text>
                                    <HStack spacing={3}>
                                        <Button
                                            variant={method === "cash" ? "solid" : "outline"}
                                            onClick={() => setMethod("cash")}
                                        >
                                            Card
                                        </Button>
                                        <Button
                                            variant={method === "store" ? "solid" : "outline"}
                                            onClick={() => setMethod("store")}
                                        >
                                            Store Credit
                                        </Button>
                                        <Button
                                            variant={method === "other" ? "solid" : "outline"}
                                            onClick={() => setMethod("other")}
                                        >
                                            Other
                                        </Button>
                                    </HStack>
                                </Box>

                                <Box w="full">
                                    <Text mb={2}>Reason</Text>
                                    <Select>
                                        <option>Reduce Booking Value and Return Payment</option>
                                        <option>Reschedule</option>
                                        <option>Other</option>
                                    </Select>
                                </Box>

                                <Box w="full">
                                    <Text mb={2}>Comment</Text>
                                    <Textarea placeholder="Cancellation"/>
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
                                            <Text>Guests (${149} x 2)</Text>
                                            <Text>$298</Text>
                                        </HStack>
                                        <HStack justifyContent="space-between">
                                            <Text>Cancellation:</Text>
                                            <Text>-$298</Text>
                                        </HStack>
                                    </VStack>
                                    <Divider/>
                                    <Text fontWeight="bold" align={"end"}>Total: $0.00</Text>
                                </Box>
                                <Box w="full">
                                    <Text fontWeight="bold">Payment Summary</Text>
                                    <VStack align="stretch" spacing={3}>
                                        <HStack justifyContent="space-between">
                                            <Text>
                                                Payment {booking.date || "01/02/2025"}:
                                            </Text>
                                            <Text fontWeight="bold">
                                                ${amount}
                                            </Text>
                                        </HStack>

                                        <HStack justifyContent="space-between">
                                            <Text color="blue.500">
                                                Return Payment {booking.date || "01/02/2025"}:
                                            </Text>
                                            <Text fontWeight="bold" color="blue.500">
                                                -${amount}
                                            </Text>
                                        </HStack>
                                    </VStack>

                                    <Divider mt={4}/>
                                    <Text fontWeight="bold" align={"end"}>Paid: $0.00</Text>
                                </Box>

                            </VStack>
                        </HStack>
                    </Box>
                </ModalBody>

                <ModalFooter alignItems={"end"}>
                    <HStack>
                        <Checkbox>Notify Customer</Checkbox>
                        <Button onClick={onClose}>Skip</Button>
                        <Button colorScheme="blue">Save Changes</Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>


    );
};

export default BookingCancellationModal;
