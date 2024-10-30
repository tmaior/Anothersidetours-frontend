import {
    Button,
    Checkbox,
    Flex, FormControl, FormErrorMessage,
    HStack, Icon,
    Image, Input, InputGroup, InputLeftElement, InputRightElement,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import {GiShoppingCart} from "react-icons/gi";
import React, {useState} from "react";
import {FaRegCreditCard} from "react-icons/fa";
import {MdErrorOutline} from "react-icons/md";
import InputMask from "react-input-mask";

export default function CheckoutFooter({totalAmount, onCheckout}) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [isChecked, setIsChecked] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("manual");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvc, setCvc] = useState("");
    const [isError, setIsError] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const handleAcceptTerms = () => {
        setIsChecked(true);
        onClose();
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value;
        setCardNumber(value);

        const isValidCardNumber = /^\d{4} \d{4} \d{4} \d{4}$/.test(value);
        setIsError(!isValidCardNumber && value.length > 0);
    };

    return (

        <>
            <HStack w={"full"} h={"full"}>
                <Flex w={"full"} h={"full"}>
                    <Flex w={"full"}>
                        {paymentMethod === "manual" && (
                            <FormControl isInvalid={isError} mb={4} alignContent={"center"} marginLeft={"20px"}>
                                <HStack w={"400px"} marginLeft={"15px"} justify={"left"}>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none" color="gray.400">
                                            <Icon as={FaRegCreditCard}/>
                                        </InputLeftElement>
                                        <Input
                                            type="text"
                                            placeholder="1111 1111 1111 1111"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            maxLength={19}
                                            _placeholder={{color: "gray.400"}}
                                            borderColor={isError ? "red.500" : "gray.300"}
                                            focusBorderColor={isError ? "red.500" : "blue.500"}
                                            w="260px"
                                        />
                                        {isError && (
                                            <InputRightElement color="red.500">
                                                <Icon as={MdErrorOutline}/>
                                            </InputRightElement>
                                        )}
                                    </InputGroup>

                                    <InputGroup justifyContent={"center"}>
                                        <InputMask
                                            mask="99/99"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                        >
                                            {(inputProps) => (
                                                <Input
                                                    {...inputProps}
                                                    placeholder="MM/YY"
                                                    w="100px"
                                                    _placeholder={{color: "gray.400"}}
                                                />
                                            )}
                                        </InputMask>
                                    </InputGroup>

                                    <InputGroup>
                                        <Input
                                            type="text"
                                            placeholder="CVC"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value)}
                                            maxLength={3}
                                            w="80px"
                                            _placeholder={{color: "gray.400"}}
                                        />
                                    </InputGroup>
                                </HStack>
                                {isError && <FormErrorMessage>Invalid card number</FormErrorMessage>}
                            </FormControl>
                        )}
                    </Flex>
                </Flex>
                <Flex justify={"flex-end"} align={"end"} bg={"tomato"}>
                    <HStack align={"self-end"} w={"full"} justify={"flex-end"} marginRight={"-50"} marginBottom={"-140"}>
                        <RadioGroup onChange={setPaymentMethod} value={paymentMethod} mb={4}>
                            <HStack w={"500px"} spacing={4}>
                                <Radio value="manual">Manually enter card details</Radio>
                                <Radio value="saved">Saved card from browser</Radio>
                            </HStack>
                        </RadioGroup>
                    </HStack>
                </Flex>

            </HStack>
            <Flex w={"full"}>
                <Flex
                    position="static"
                    w="full"
                    h={["auto", "60px"]}
                    bg="gray.100"
                    align="center"
                    justify="space-between"
                    boxShadow="md"
                    zIndex={1000}
                    px={0}
                    flexDirection={["column", "row"]}
                    mt={4}
                >
                    <Button
                        bg="gray.500"
                        color="white"
                        _hover={{bg: "gray.400"}}
                        h={["auto", "60px"]}
                        w={["100%", "auto"]}
                        px={8}
                        fontSize="lg"
                        fontWeight="normal"
                        borderRadius={0}
                        onClick={onCheckout}
                    >
                        Back
                    </Button>

                    <HStack spacing={4} pl={8} py={[4, 0]}>
                        <Text fontSize="sm" color="gray.500">
                            POWERED BY
                        </Text>
                        <Image
                            src="https://checkout.xola.app/images/xola-logo.png"
                            alt="Xola logo"
                            h="30px"
                        />
                    </HStack>

                    <Flex align="center" justify="flex-end" flex={5} position="relative">
                        <Checkbox
                            position="absolute"
                            bottom="70px"
                            isChecked={isChecked}
                            onChange={handleCheckboxChange}
                            w="300px"
                        >
                            I agree to the{" "}
                            <Link color="teal.500" onClick={(e) => {
                                e.preventDefault();
                                onOpen();
                            }} cursor="pointer">
                                terms and conditions
                            </Link>
                        </Checkbox>

                        <HStack spacing={7}>
                            <Image
                                src="https://checkout.xola.app/images/ssl-secure-encryption.svg"
                                alt="SSL Secure Encryption"
                                h="30px"
                            />
                            <Button
                                bg="#5CB85C"
                                color="white"
                                _hover={{bg: "#4cae4c"}}
                                h="60px"
                                w="400px"
                                fontSize="lg"
                                fontWeight="normal"
                                borderRadius={0}
                                isDisabled={!isChecked}
                            >
                                <GiShoppingCart/>
                                PAY: ${totalAmount}
                            </Button>
                        </HStack>
                    </Flex>

                    <Modal isOpen={isOpen} onClose={onClose} isCentered>
                        <ModalOverlay/>
                        <ModalContent>
                            <ModalHeader>Terms and Conditions</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody>
                                <Text>Here are the terms and conditions...</Text>
                            </ModalBody>
                            <ModalFooter>
                                <Button colorScheme="teal" onClick={handleAcceptTerms}>
                                    Accept
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </Flex>
            </Flex>
        </>
    );
}
