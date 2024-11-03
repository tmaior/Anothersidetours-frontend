import React from "react";
import {Input, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Text} from "@chakra-ui/react";
import FooterBar from "./Footer";

interface FinalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FinalModal({isOpen, onClose}: FinalModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
            <ModalOverlay/>
            <ModalContent height={"60vh"}>
                <ModalHeader>Informações Adicionais</ModalHeader>
                <ModalBody>
                    <Text>Por favor, forneça informações adicionais para completar o pagamento.</Text>
                    <Input placeholder="Additional Info" mt={4}/>
                </ModalBody>
                <FooterBar onContinue={onClose} continueText={"CLOSE"}/>
            </ModalContent>
        </Modal>
    );
}