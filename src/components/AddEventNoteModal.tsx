import React, {useState} from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import {CiCalendar} from "react-icons/ci";
import {MdAccessTime} from "react-icons/md";

const AddEventNoteModal = ({isOpen, onClose, eventDetails, onSave}) => {
    const [note, setNote] = useState("");

    const handleSave = () => {
        onSave(note);
        setNote("");
        onClose();
    };

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
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay/>
            <ModalContent maxH="700px" h="500px">
                <ModalHeader textAlign="center">Add Event Note</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Box bg="gray.100" p={4} borderRadius="md" mb={4}>
                        <HStack spacing={4}>
                            <Box>
                                <img
                                    src={eventDetails.imageUrl}
                                    alt={eventDetails.title}
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "8px",
                                        objectFit: "cover",
                                    }}
                                />
                            </Box>
                            <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{eventDetails.title}</Text>
                                <HStack color="gray.600" fontSize="sm" spacing={4}>
                                    <HStack spacing={1}>
                                        <CiCalendar/>
                                        <Text as="span">{formatDate(eventDetails.dateFormatted)}</Text>
                                    </HStack>
                                    <HStack spacing={1}>
                                        <MdAccessTime/>
                                        <Text as="span">{eventDetails.time}</Text>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </HStack>
                    </Box>

                    <FormControl isRequired>
                        <FormLabel>Note</FormLabel>
                        <Textarea
                            placeholder="Message"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave} isDisabled={!note}>
                        Add
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddEventNoteModal;
