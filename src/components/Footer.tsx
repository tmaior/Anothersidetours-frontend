import {
    Button,
    Flex,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import {useState} from "react";
import CheckoutFooter from "./CheckoutFooter";

export default function FooterBar() {

    const {onOpen, onClose} = useDisclosure();
    const [isCheckout, setIsCheckout] = useState(false);

    const goToCheckout = () => {
        setIsCheckout(true);
        onOpen();
    };

    const handleClose = () => {
        setIsCheckout(false);
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

            <Flex align="center" justify="flex-end" flex={1}>
                <HStack spacing={4} pr={4}>
                    <Image
                        src="https://checkout.xola.app/images/ssl-secure-encryption.svg"
                        alt="SSL Secure Encryption"
                        h="30px"
                    />
                </HStack>

                <Button
                    bg="#5CB85C"
                    color="white"
                    _hover={{bg: "#4cae4c"}}
                    h={["auto", "60px"]}
                    w={["100%", "auto"]}
                    px={8}
                    fontSize="lg"
                    fontWeight="normal"
                    borderRadius={0}
                    onClick={goToCheckout}
                >
                    CONTINUE
                </Button>

                <Modal isOpen={isCheckout} onClose={handleClose} isCentered size="4xl">
                    <ModalOverlay/>
                    <ModalContent>
                        <ModalHeader>Checkout</ModalHeader>
                        <ModalCloseButton/>
                        <ModalBody>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize="lg" fontWeight="bold"></Text>
                                {/*<Text mt={2}>Total Due Now: $235.90</Text>*/}
                                <CheckoutFooter/>
                            </Flex>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Flex>
        </Flex>
    );
}