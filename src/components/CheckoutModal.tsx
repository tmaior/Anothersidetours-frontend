import {
    Center,
    Divider,
    Flex,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react";
import CheckoutFooter from "./CheckoutFooter";
import CheckoutBody from "./CheckoutBody";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalDue: number;
    title?: string;
    onBack?: () => void;
}

export default function CheckoutModal({isOpen, onClose, totalDue, onBack}: CheckoutModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
            <ModalOverlay/>
            <ModalContent height={"60vh"}>
                <ModalHeader marginLeft={"500"} alignContent={"center"}>{"CHECKOUT"}</ModalHeader>
                <Divider color={"gray.400"}/>
                <ModalCloseButton onClick={onClose}/>
                <ModalBody>
                    <HStack w="full" spacing={150}>

                        <HStack w={"full"}>
                            <Flex  w="40%" h="full">
                                <CheckoutBody title="teste" totalDue={totalDue}/>
                            </Flex>
                            <Flex w="40%" h="full" justify={"flex-end"}>
                                <CheckoutBody title="teste" totalDue={totalDue}/>
                            </Flex>
                        </HStack>

                        <Center height='100px'>
                            <Divider orientation='vertical'/>
                        </Center>

                        <HStack w="full" spacing={150}>
                            <Flex bg="yellow" w="50%" h="full">
                                <CheckoutBody title="teste" totalDue={totalDue}/>
                            </Flex>

                            {/*<Flex bg="red.200" w="50%" h="full">*/}
                            {/*    <CheckoutBody title="teste" totalDue={totalDue}/>*/}
                            {/*</Flex>*/}
                        </HStack>

                    </HStack>
                </ModalBody>
                <CheckoutFooter totalAmount={totalDue} onCheckout={onBack}/>
            </ModalContent>
        </Modal>
    );
}
