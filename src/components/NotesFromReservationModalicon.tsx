import React from "react";
import {
    Box,
    Button,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
} from "@chakra-ui/react";

interface Note {
    title?: string;
    description?: string;
}

interface Reservation {
    notes?: Note[];
    imageUrl?: string;
    title?: string;
    date?: string;
    time?: string;
}

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    notes: Note[];
    reservation: Reservation | null;
}

const NotesModal: React.FC<NotesModalProps> = ({isOpen, onClose, notes, reservation}) => {
    const {imageUrl, title, date, time} = reservation || {};

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
            <ModalOverlay/>
            <ModalContent h={"600px"}>
                <ModalHeader>Notes</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    {reservation && (
                        <HStack bg="gray.100" p={4} borderRadius="md" mb={4}>
                            <Image
                                src={imageUrl || "/images/default-tour.png"}
                                boxSize="40px"
                                borderRadius="md"
                                alt="Tour Icon"
                                objectFit="fill"
                            />
                            <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{title || "No Title"}</Text>
                                <Text color="gray.600">{`${date || "No Date"} at ${time || "No Time"}`}</Text>
                            </VStack>
                        </HStack>
                    )}
                    <VStack align="stretch" spacing={4}>
                        {notes.length > 0 ? (
                            notes.map((note, index) => (
                                <Box key={index} p={4} bg="white" borderRadius="md" boxShadow="sm">
                                    <Text fontWeight="bold">{note.title || "Untitled"}</Text>
                                    <Text>{note.description || "No description available"}</Text>
                                </Box>
                            ))
                        ) : (
                            <Text>No notes available</Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default NotesModal;
