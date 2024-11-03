import {
    Flex,
    Input,
    Modal,
    ModalBody, ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import FooterBar from "./Footer";
import FinalModal from "./FinalModal";

interface InformationAdditionalModalProps {
    isOpen: boolean,
    onClose: () => void,
    onContinue?: () => void
}

export default function InformationAdditionalModal({isOpen, onClose, onContinue}: InformationAdditionalModalProps) {
    const {isOpen: isFinalOpen, onOpen: onFinalOpen, onClose: onFinalClose} = useDisclosure();

    const handleFinishClick = () => {

        onClose();
        onFinalOpen();
    };

    return (
        <Flex>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
                <ModalOverlay/>
                <ModalContent height={"60vh"}>
                    <ModalHeader>Informações Adicionais</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>Por favor, forneça informações adicionais para completar o pagamento.</Text>
                        <Input placeholder="Additional Info" mt={4}/>
                        <Input placeholder="Additional Info" mt={4}/>
                        <Input placeholder="Additional Info" mt={4}/>
                    </ModalBody>
                    <FooterBar onContinue={handleFinishClick} continueText={"FINISH"}/>
                </ModalContent>
            </Modal>

            <FinalModal isOpen={isFinalOpen} onClose={onFinalClose}/>
        </Flex>
    );
}
