import {
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormErrorMessage,
    HStack,
    Icon,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
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
import FooterBar from "./Footer";

export default function CheckoutFooter({totalAmount, onCheckout,onPayment}) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {
        isOpen: isAdditionalOpen,
        onClose: onAdditionalClose
    } = useDisclosure();
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

    const handlePayClick = async () => {
        // await fetch('https://localhost:9000/payment', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ cardNumber, expiryDate, cvc, amount: totalAmount }),
        // });
        if (isChecked && onPayment) {
            onPayment();
        }
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
                <Flex justify={"flex-end"} align={"end"}>
                    <HStack align={"self-end"} w={"full"} justify={"flex-end"} marginRight={"-50"}
                            marginBottom={"-110"}>
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
                                onClick={handlePayClick}
                            >
                                <GiShoppingCart/>
                                PAY: ${totalAmount}
                            </Button>
                        </HStack>
                    </Flex>

                    <Modal isOpen={isOpen} onClose={onClose} isCentered>
                        <ModalOverlay />
                        <ModalContent maxW="600px" maxH="400px">
                            <ModalHeader>Terms and Conditions</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody overflowY="auto" padding="20px">
                                <Text whiteSpace="pre-line">
                                    I acknowledge and assume the risks which are inherent in
                                    participation with Another Side Tours, Inc. events and activities,
                                    including transportation of the individual(s) which may be dangerous
                                    and include risks which cannot be reasonably avoided. I acknowledge and
                                    assume the risk that attendance and participation in the event can cause
                                    whether known or unknown, including but not limited to personal injury,
                                    death, and property damage.

                                    I acknowledge that I waive on my behalf and on behalf of all members of my
                                    party any and all claims for personal injuries or property damage, including
                                    negligence, against Another Side Tours, Inc., its employees, volunteers,
                                    contractors, individual members thereof, agents, officers, and directors
                                    arising out of or relating to attendance and participation in the event
                                    including transportation of myself and all other members of my party.
                                    I represent and warrant that I and the other members of my party are in
                                    good physical condition and are able to safely participate in Another
                                    Side Tours, Inc. events and activities.

                                    Clicking this box shall constitute an informed and knowing consent and
                                    waiver as required by law for myself and all others participating
                                    as members of my party.
                                </Text>
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
            
            <Modal isOpen={isAdditionalOpen} onClose={onAdditionalClose} isCentered size="6xl">
                <ModalOverlay />
                <ModalContent height={"60vh"}>
                    <ModalHeader>Informações Adicionais</ModalHeader>
                    <ModalBody>
                        <Text>Por favor, forneça informações adicionais para completar o pagamento.</Text>
                        <Input placeholder="Additional Info" mt={4} />
                        <Input placeholder="Additional Info" mt={4} />
                        <Input placeholder="Additional Info" mt={4} />
                    </ModalBody>
                    <FooterBar  onContinue={onAdditionalClose} continueText={"FINISH"}/>
                </ModalContent>
            </Modal>
        </>
    );
}
