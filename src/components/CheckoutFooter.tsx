import {
    Button,
    Checkbox,
    Flex,
    HStack,
    Image,
    // Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay, Spinner,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import {GiShoppingCart} from "react-icons/gi";
import React, {useState} from "react";
// import FooterBar from "./Footer";

export default function CheckoutFooter({totalAmount, onCheckout, onPayment}) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    // const {
    //     isOpen: isAdditionalOpen,
    //     onClose: onAdditionalClose
    // } = useDisclosure();
    const [isChecked, setIsChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const handleAcceptTerms = () => {
        setIsChecked(true);
        onClose();
    };

    const handlePayClick = async () => {
        if (isChecked && onPayment) {
            setIsLoading(true);
            await onPayment();
            setIsLoading(false);
        }
    };

    return (

        <>
            <Flex w={"full"}>
                <Flex
                    position="static"
                    w="full"
                    h={{ base: "auto", md: "60px" }}
                    bg="gray.100"
                    align="center"
                    justify="space-between"
                    boxShadow="md"
                    zIndex={1000}
                    px={0}
                    flexDirection={{ base: "column", md: "row" }}
                    mt={4}
                >
                    <Button
                        mr={8}
                        bg="gray.500"
                        color="white"
                        _hover={{bg: "gray.400"}}
                        h={{ base: "50px", md: "60px" }}
                        w={{ base: "100%", md: "auto" }}
                        px={8}
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="normal"
                        borderRadius={0}
                        onClick={onCheckout}
                    >
                        Back
                    </Button>
                    <Image
                        src="/assets/logo.png"
                        alt="another side logo"
                        h="50px"
                    />

                    <Flex 
                        align="center" 
                        justify={{ base: "center", md: "flex-end" }} 
                        flex={5} 
                        position="relative"
                        flexDir={{ base: "column", md: "row" }}
                        w={{ base: "full", md: "auto" }}
                        p={{ base: 4, md: 0 }}
                    >
                        <Checkbox
                            position={{ base: "static", md: "absolute" }}
                            bottom={{ md: "70px" }}
                            mb={{ base: 4, md: 0 }}
                            isChecked={isChecked}
                            onChange={handleCheckboxChange}
                            w={{ base: "full", md: "300px" }}
                            textAlign={{ base: "center", md: "left" }}
                        >
                            I agree to the{" "}
                            <Link color="teal.500" onClick={(e) => {
                                e.preventDefault();
                                onOpen();
                            }} cursor="pointer">
                                terms and conditions
                            </Link>
                        </Checkbox>

                        <HStack 
                            spacing={{ base: 2, md: 7 }}
                            w={{ base: "full", md: "auto" }}
                            justify={{ base: "center", md: "flex-end" }}
                        >
                            {/*<Image*/}
                            {/*    src="https://checkout.xola.app/images/ssl-secure-encryption.svg"*/}
                            {/*    alt="SSL Secure Encryption"*/}
                            {/*    h="30px"*/}
                            {/*    display={{ base: "none", md: "block" }}*/}
                            {/*/>*/}
                            <Button
                                bg="#0574BC"
                                color="white"
                                _hover={{bg: "#0554BC"}}
                                h={{ base: "50px", md: "60px" }}
                                w={{ base: "full", md: "400px" }}
                                fontSize={{ base: "md", md: "lg" }}
                                fontWeight="normal"
                                borderRadius={0}
                                isDisabled={!isChecked}
                                onClick={handlePayClick}
                            >
                                {isLoading ? (
                                    <Spinner size="sm" color="white" mr={2} />
                                ) : (
                                    <GiShoppingCart />
                                )}
                                {isLoading ? "Processing payment..." : `PAY: $${totalAmount}`}
                            </Button>
                        </HStack>
                    </Flex>

                    <Modal isOpen={isOpen} onClose={onClose} isCentered>
                        <ModalOverlay/>
                        <ModalContent maxW={{ base: "90%", md: "600px" }} maxH={{ base: "80vh", md: "400px" }}>
                            <ModalHeader>Terms and Conditions</ModalHeader>
                            <ModalCloseButton/>
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

            {/*<Modal isOpen={isAdditionalOpen} onClose={onAdditionalClose} isCentered size="6xl">*/}
            {/*    <ModalOverlay/>*/}
            {/*    <ModalContent height={"60vh"}>*/}
            {/*        <ModalHeader>Informações Adicionais</ModalHeader>*/}
            {/*        <ModalBody>*/}
            {/*            <Text>Por favor, forneça informações adicionais para completar o pagamento.</Text>*/}
            {/*            <Input placeholder="Additional Info" mt={4}/>*/}
            {/*            <Input placeholder="Additional Info" mt={4}/>*/}
            {/*            <Input placeholder="Additional Info" mt={4}/>*/}
            {/*        </ModalBody>*/}
            {/*        <FooterBar onContinue={onAdditionalClose} continueText={"FINISH"}/>*/}
            {/*    </ModalContent>*/}
            {/*</Modal>*/}
        </>
    );
}
