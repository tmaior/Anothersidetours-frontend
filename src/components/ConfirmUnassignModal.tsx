import React from "react";
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Text,
    useToast,
} from "@chakra-ui/react";

const ConfirmUnassignModal = ({ isOpen, onClose, reservation, onConfirm }) => {
    const toast = useToast();

    const handleConfirm = async () => {
        try {
            const guideIds = [];
            await onConfirm(reservation.id, guideIds);
            toast({
                title: "Success",
                description: "All guides have been unassigned from the reservation.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
        } catch (error) {
            console.error("Error unassigning guides:", error);
            toast({
                title: "Error",
                description: "Failed to unassign guides.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Confirm Unassign</ModalHeader>
                <ModalBody>
                    <Text mb={4}>
                        There are no active reservations in <strong>{reservation.title}</strong> on{" "}
                        <strong>{reservation.dateFormatted} at {reservation.time}</strong>.
                    </Text>
                    <Text>
                        Do you want to unassign the guides from the above event?
                    </Text>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={onClose} mr={3}>
                        Cancel
                    </Button>
                    <Button colorScheme="red" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ConfirmUnassignModal;