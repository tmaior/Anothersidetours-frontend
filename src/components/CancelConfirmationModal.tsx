import {
    Box,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";

const CancelConfirmationModal = ({booking, isOpen, onClose, onConfirm}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay/>
            <ModalContent h="300px" maxH="700px">
                <ModalHeader>Cancel Reservation</ModalHeader>
                <ModalBody>
                    <Box bg="blue.50" p={4} borderRadius="md">
                        <Text>
                            Are you sure you want to cancel <strong>{booking.title}</strong>{" "}
                            on <strong>{booking.date}</strong> at{" "}
                            <strong>{booking.time}</strong> for{" "}
                            <strong>{booking.clientName}</strong>?
                        </Text>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} variant="outline" mr={3}>
                        Cancel

                    </Button>
                    <Button colorScheme="red" onClick={onConfirm}>
                        Confirm
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CancelConfirmationModal;
