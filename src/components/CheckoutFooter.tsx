import {
    Button,
    Checkbox,
    Flex,
    HStack,
    Image,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import {GiShoppingCart} from "react-icons/gi";
import {useState} from "react";

export default function CheckoutFooter({totalAmount, onCheckout}) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const handleAcceptTerms = () => {
        setIsChecked(true);
        onClose();
    };

    return (
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
                        <Text>
                            Here are the terms and conditions...
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
    );
}
