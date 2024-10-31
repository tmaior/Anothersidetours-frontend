import React from "react";
import { useGuest } from "./GuestContext";
import {
    Box,
    Button,
    Center,
    Divider,
    Flex,
    HStack,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Text,
    VStack,
    useDisclosure
} from "@chakra-ui/react";
import CheckoutFooter from "./CheckoutFooter";
import { ImUsers } from "react-icons/im";
import { SlCalender } from "react-icons/sl";
import { MdEmail, MdOutlineAccessTime } from "react-icons/md";
import {format} from "date-fns";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    onBack?: () => void;
}

export default function CheckoutModal({ isOpen, onClose, onBack }: CheckoutModalProps) {
    const { isOpen: isCodeModalOpen, onOpen: openCodeModal, onClose: closeCodeModal } = useDisclosure();
    const { guestQuantity, email, selectedDate, selectedTime } = useGuest();

    const handleClose = () => {
        onClose();
    };

    const pricePerGuest = 249.00;
    const totalAmount = guestQuantity * pricePerGuest;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size="6xl">
            <ModalOverlay />
            <ModalContent height={"60vh"}>
                <ModalHeader marginLeft={"500"} alignContent={"center"}>{"CHECKOUT"}</ModalHeader>
                <Divider color={"gray.400"} />
                <ModalCloseButton onClick={handleClose} />
                <ModalBody>
                    <HStack>
                        <HStack w="500px">
                            <HStack>
                                <Flex w="40%" h="40%">
                                    <Box
                                        top={0}
                                        left={0}
                                        right={0}
                                        bottom={0}
                                        bgImage={"url('https://m01.xola.com/cache/images/5b27d2976864ea736e8b45d9_large.jpg')"}
                                        bgPosition="center"
                                        bgSize="cover"
                                        boxSize="150px"
                                    />
                                </Flex>
                                <Flex direction="column" align="flex-start" w="400px" ml="-10">
                                    <Flex w="100%" h="30%" mb={2} p={0}>
                                        <Text fontSize="lg" fontWeight="bold">
                                            The Ultimate Hollywood Tour
                                        </Text>
                                    </Flex>

                                    <VStack align="flex-start" spacing={0} h={"80px"} marginLeft={1}>
                                        <Text>TESTE</Text>
                                        <HStack spacing={6}>
                                            <HStack spacing={2}>
                                                <ImUsers />
                                                <Text>{guestQuantity} Reserved</Text>
                                            </HStack>
                                            <Spacer />
                                            <HStack spacing={2}>
                                                <MdEmail />
                                                <Text>{email}</Text>
                                            </HStack>
                                        </HStack>

                                        <HStack>
                                            <SlCalender />
                                            <Text>{selectedDate ? format(selectedDate, 'dd MMM yyyy') : "No Date Selected"}</Text>
                                        </HStack>

                                        <HStack>
                                            <MdOutlineAccessTime />
                                            <Text>{selectedTime || "No Time Selected"}</Text>
                                        </HStack>
                                    </VStack>

                                    <Flex w="full" mt={4} p={1} justify="flex-end">
                                        <Link color="blue.500" textAlign="right" marginRight={5} fontSize="smaller">
                                            Modify
                                        </Link>
                                    </Flex>
                                </Flex>
                            </HStack>
                        </HStack>
                        <Spacer />
                        <Center height="100px">
                            <Divider orientation="vertical" />
                        </Center>
                        <VStack w="full" p={4} spacing={4} align="stretch">

                            <HStack w="full">
                                <Text>{`Guests (${guestQuantity} × $${pricePerGuest.toFixed(2)})`}</Text>
                                <Spacer />
                                <Text>${totalAmount.toFixed(2)}</Text>
                            </HStack>

                            <Link color="blue.500" onClick={openCodeModal} textAlign="left" fontSize="md">
                                Have a code?
                            </Link>
                            <HStack w="full" marginTop={"-4"}>
                                <Text>Total</Text>
                                <Spacer />
                                <Text>${totalAmount.toFixed(2)}</Text>
                            </HStack>
                        </VStack>
                    </HStack>
                </ModalBody>
                <Divider orientation="horizontal" />
                <CheckoutFooter totalAmount={totalAmount} onCheckout={onBack} />
            </ModalContent>

            <Modal isOpen={isCodeModalOpen} onClose={closeCodeModal} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add a code to this booking</ModalHeader>
                    <ModalCloseButton />
                    <Divider />

                    <ModalBody>
                        <HStack>
                            <Text>Enter code</Text>
                            <Input placeholder="Enter code" />
                        </HStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" onClick={closeCodeModal}>
                            Cancel
                        </Button>
                        <Button colorScheme="green" ml={3}>
                            Apply Code
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Modal>
    );
}