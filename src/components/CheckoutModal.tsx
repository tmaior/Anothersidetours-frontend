import {
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text
} from "@chakra-ui/react";
import CheckoutFooter from "./CheckoutFooter";

export default function CheckoutModal({ isOpen, onClose, totalDue, title, onBack }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{title || "Checkout"}</ModalHeader>
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Flex flexDirection="column" alignItems="center">
                        <Text fontSize="lg" fontWeight="bold">
                            {title}
                        </Text>
                        <Text mt={2}>Total Due Now: ${totalDue}</Text>
                        <CheckoutFooter onCheckout={onBack} totalAmount={totalDue} />
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
