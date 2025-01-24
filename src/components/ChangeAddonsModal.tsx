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
    Select,
    Text,
    VStack,
} from "@chakra-ui/react";
import React, {useState} from "react";
import PurchaseAndPaymentSummary from "./PurchaseAndPaymentSummary";

export default function ChangeAddOns({isOpen, onClose, booking}) {
    const [pickupCount, setPickupCount] = useState(0);

    const incrementPickup = () => setPickupCount(pickupCount + 1);
    const decrementPickup = () => {
        if (pickupCount > 0) setPickupCount(pickupCount - 1);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Change Add-Ons</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <HStack align="start" spacing={20}>
                        <VStack spacing={4} align="stretch">
                            <Flex justify="space-between" align="center">
                                <Text>ADD A PICK-UP?</Text>
                                <Flex align="center">
                                    <Button size="sm" onClick={decrementPickup} disabled={pickupCount === 0}>
                                        -
                                    </Button>
                                    <Input
                                        value={pickupCount}
                                        readOnly
                                        w="50px"
                                        textAlign="center"
                                        mx={2}
                                    />
                                    <Button size="sm" onClick={incrementPickup}>
                                        +
                                    </Button>
                                </Flex>
                            </Flex>

                            <Flex justify="space-between" align="center">
                                <Text>6% Booking Fee</Text>
                                <Checkbox/>
                            </Flex>

                            <Flex justify="space-between" align="center">
                                <Text>Gratuity</Text>
                                <Select placeholder="Select" w="100px">
                                    <option value="5">5%</option>
                                    <option value="10">10%</option>
                                    <option value="15">15%</option>
                                </Select>
                            </Flex>
                        </VStack>
                        <HStack align="center">
                            <PurchaseAndPaymentSummary booking={booking}/>
                        </HStack>
                    </HStack>

                </ModalBody>

                <ModalFooter>
                    <Flex justify="space-between" align="center" w="100%">
                        <Flex align="center">
                            <Checkbox id="notifyCustomer"/>
                            <Text ml={2}>Notify Customer</Text>
                        </Flex>
                        <Flex>
                            <Button colorScheme="gray" mr={2} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue">Save Changes</Button>
                        </Flex>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}