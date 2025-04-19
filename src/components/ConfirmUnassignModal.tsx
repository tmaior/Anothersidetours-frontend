import React, { useState } from "react";
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
    const [loading, setLoading] = useState(false);
    const {assignGuides} = useGuideAssignment();
    const {setReservationGuides} = useGuidesStore();

    const handleConfirm = async () => {
        if (!reservation || !reservation.id) {
            toast({
                title: "Error",
                description: "No reservation data provided.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            return;
        }

        setLoading(true);
        
        try {
            console.log(`Unassigning all guides from reservation ${reservation.id}`);
            await assignGuides(reservation.id, []);
            setReservationGuides(reservation.id, []);
            
            toast({
                title: "Success",
                description: "All guides have been unassigned from the reservation.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
            if (onConfirm) {
                onConfirm();
            }
            onClose();
        } catch (error) {
            console.error("Error unassigning guides:", error);
            toast({
                title: "Error",
                description: "Failed to unassign guides: " + (error.response?.data?.message || error.message),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Confirm Unassign</ModalHeader>
                <ModalBody>
                    {reservation ? (
                    <>
                        <Text mb={4}>
                            There are no active reservations in <strong>{reservation.title}</strong> on{" "}
                            <strong>{reservation.dateFormatted} at {reservation.time}</strong>.
                        </Text>
                        <Text>
                            Do you want to unassign the guides from the above event?
                        </Text>
                    </>
                    ) : (
                        <Text>Invalid reservation data. Please try again.</Text>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onClick={onClose} mr={3}>
                        Cancel
                    </Button>
                    <Button 
                        colorScheme="red" 
                        onClick={handleConfirm} 
                        isLoading={loading}
                        loadingText="Unassigning"
                        isDisabled={!reservation}
                    >
                        Confirm
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ConfirmUnassignModal;