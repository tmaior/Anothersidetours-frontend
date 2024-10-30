import {
    Divider,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react";
import CheckoutFooter from "./CheckoutFooter";

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
            <ModalContent justifyContent={"center"} alignItems={"center"} height={"60vh"}>
                <ModalHeader>{"CHECKOUT"}</ModalHeader>
                <Divider/>
                <ModalCloseButton onClick={onClose}/>
                <ModalBody>
                    <Flex>
                        {/*<CheckoutBody title={title} totalDue={totalDue} />*/}
                    </Flex>
                    <Divider/>
                </ModalBody>
                <CheckoutFooter totalAmount={totalDue} onCheckout={onBack}/>
            </ModalContent>
        </Modal>
    );
}
