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
import {CiCalendar} from "react-icons/ci";
import {MdAccessTime} from "react-icons/md";

interface Note {
    title?: string;
    description?: string;
}

interface Reservation {
    notes?: Note[];
    imageUrl?: string;
    title?: string;
    dateFormatted?: string;
    time?: string;
}

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    notes: Note[];
    reservation: Reservation | null;
}

const NotesModal: React.FC<NotesModalProps> = ({isOpen, onClose, notes, reservation}) => {
    const {imageUrl, title, dateFormatted, time} = reservation || {};
    const formatDate = (date: string | Date | undefined): string => {
        if (!date) return "Invalid Date";
        let parsedDate: Date;
        if (date instanceof Date) {
            parsedDate = date;
        } else {
            parsedDate = new Date(date);
        }
        if (isNaN(parsedDate.getTime())) return "Invalid Date";

        return parsedDate.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    };


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
                                <Text fontWeight="bold">{title}</Text>
                                <HStack color="gray.600" fontSize="sm" spacing={4}>
                                    <HStack spacing={1}>
                                        <CiCalendar/>
                                        <Text as="span">{formatDate(dateFormatted)}</Text>
                                    </HStack>
                                    <HStack spacing={1}>
                                        <MdAccessTime/>
                                        <Text as="span">{time}</Text>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </HStack>
                    )}
                    <Text fontWeight="bold">{"Purchase Notes"}</Text>
                    <VStack align="stretch" spacing={4}>
                        {notes.length > 0 ? (
                            notes.map((note, index) => (
                                <Box key={index} p={4} bg="white" borderRadius="md" boxShadow="sm">
                                    {/*<Text fontWeight="bold">{note.title || "Untitled"}</Text>*/}
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
