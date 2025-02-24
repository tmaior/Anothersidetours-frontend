import React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useToast,
} from "@chakra-ui/react";
import {useGuideAssignment} from "../hooks/useGuideAssignment";
import useGuidesStore from "../utils/store";

const ConfirmUnassignModal = ({isOpen, onClose, reservation, onConfirm}) => {
    const toast = useToast();

    const {assignGuides} = useGuideAssignment();
    const {setReservationGuides} = useGuidesStore();

    const handleConfirm = async () => {
        try {
            await assignGuides(reservation.id, []);
            setReservationGuides(reservation.id, []);
            toast({
                title: "Success",
                description: "All guides have been unassigned from the reservation.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onConfirm();
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
            <ModalOverlay/>
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