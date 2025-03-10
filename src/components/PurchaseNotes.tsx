import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    HStack,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronRightIcon, DeleteIcon} from "@chakra-ui/icons";
import axios from "axios";

interface Note {
    id: string;
    description: string;
    createdAt: string;
}

interface PurchaseNotesProps {
    reservationId: string;
}

const NotesComponent: React.FC<PurchaseNotesProps> = ({reservationId}) => {
    const [allSectionsVisible, setAllSectionsVisible] = useState(true);
    const [sections, setSections] = useState({
        eventNotes: true,
        purchaseNotes: true,
        customerNotes: true,
    });
    const [purchaseNotes, setPurchaseNotes] = useState<Note[]>([]);
    const [newNoteText, setNewNoteText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const toast = useToast();

    const eventNotes = [];
    const customerNotes = [];

    useEffect(() => {
        if (reservationId) {
            fetchNotes();
        }
    }, [reservationId]);

    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/purchase-notes/${reservationId}`);
            setPurchaseNotes(response.data);
        } catch (error) {
            toast({
                title: "Error fetching notes",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.error("Error fetching notes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNote = async () => {
        if (!newNoteText.trim()) return;

        try {
            setIsLoading(true);
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/purchase-notes`, {
                reservationId,
                description: newNoteText
            });

            setNewNoteText("");
            onClose();
            fetchNotes();
            toast({
                title: "Note created",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error creating note",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.error("Error creating note:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteNote = async (id: string) => {
        try {
            setIsLoading(true);
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/purchase-notes/${id}`);
            fetchNotes();
            toast({
                title: "Note deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error deleting note",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.error("Error deleting note:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSection = (section) => {
        setSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggleAllSections = () => {
        setAllSectionsVisible((prev) => !prev);
    };

    return (
        <Box p={4} w="400px">
            <HStack justify="space-between" align="center" mb={4}>
                <HStack>
                    <IconButton
                        icon={allSectionsVisible ? <ChevronDownIcon/> : <ChevronRightIcon/>}
                        size="sm"
                        variant="ghost"
                        onClick={toggleAllSections}
                        aria-label="Toggle All Notes"
                    />
                    <Text fontSize="lg" fontWeight="bold">
                        Notes
                    </Text>
                    <Box
                        bg="yellow.200"
                        color="yellow.800"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                    >
                        {eventNotes.length + purchaseNotes.length + customerNotes.length}
                    </Box>
                </HStack>
            </HStack>

            {allSectionsVisible && (
                <>
                    <VStack align="start" spacing={4} mb={4}>
                        <HStack justify="space-between" w="100%">
                            <HStack>
                                <IconButton
                                    icon={sections.eventNotes ? <ChevronDownIcon/> : <ChevronRightIcon/>}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleSection("eventNotes")}
                                    aria-label="Toggle Event Notes"
                                />
                                <Text fontWeight="bold">Event Notes</Text>
                                {eventNotes.length > 0 && (
                                    <Box
                                        bg="yellow.200"
                                        color="yellow.800"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        fontSize="sm"
                                    >
                                        {eventNotes.length}
                                    </Box>
                                )}
                            </HStack>
                            <Button size="sm" variant="outline">
                                + Add Note
                            </Button>
                        </HStack>
                        {sections.eventNotes && (
                            <VStack align="start">
                                {eventNotes.length > 0 ? (
                                    eventNotes.map((note, index) => (
                                        <Text key={index}>{note}</Text>
                                    ))
                                ) : (
                                    <Text>No Event Notes</Text>
                                )}
                            </VStack>
                        )}
                    </VStack>

                    <VStack align="start" spacing={4} mb={4}>
                        <HStack justify="space-between" w="100%">
                            <HStack>
                                <IconButton
                                    icon={sections.purchaseNotes ? <ChevronDownIcon/> : <ChevronRightIcon/>}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleSection("purchaseNotes")}
                                    aria-label="Toggle Purchase Notes"
                                />
                                <Text fontWeight="bold">Purchase Notes</Text>
                                {purchaseNotes.length > 0 && (
                                    <Box
                                        bg="yellow.200"
                                        color="yellow.800"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        fontSize="sm"
                                    >
                                        {purchaseNotes.length}
                                    </Box>
                                )}
                            </HStack>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onOpen}
                                isDisabled={!reservationId}
                            >
                                + Add Note
                            </Button>
                        </HStack>
                        {sections.purchaseNotes && (
                            <VStack align="start" w="100%">
                                {isLoading ? (
                                    <Text>Loading notes...</Text>
                                ) : purchaseNotes.length > 0 ? (
                                    purchaseNotes.map((note) => (
                                        <Box
                                            key={note.id}
                                            p={3}
                                            bg="gray.50"
                                            borderRadius="md"
                                            w="100%"
                                            position="relative"
                                        >
                                            <HStack justify="space-between" mb={2}>
                                                <Text fontSize="xs" color="gray.500">
                                                    {new Date(note.createdAt).toLocaleString()}
                                                </Text>
                                                <IconButton
                                                    icon={<DeleteIcon/>}
                                                    size="xs"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    aria-label="Delete note"
                                                />
                                            </HStack>
                                            <Text>{note.description}</Text>
                                        </Box>
                                    ))
                                ) : (
                                    <Text>No Purchase Notes</Text>
                                )}
                            </VStack>
                        )}
                    </VStack>

                    {/*<VStack align="start" spacing={4}>*/}
                    {/*    <HStack justify="space-between" w="100%">*/}
                    {/*        <HStack>*/}
                    {/*            <IconButton*/}
                    {/*                icon={sections.customerNotes ? <ChevronDownIcon/> : <ChevronRightIcon/>}*/}
                    {/*                size="sm"*/}
                    {/*                variant="ghost"*/}
                    {/*                onClick={() => toggleSection("customerNotes")}*/}
                    {/*                aria-label="Toggle Customer Notes"*/}
                    {/*            />*/}
                    {/*            <Text fontWeight="bold">Customer Notes</Text>*/}
                    {/*            {customerNotes.length > 0 && (*/}
                    {/*                <Box*/}
                    {/*                    bg="yellow.200"*/}
                    {/*                    color="yellow.800"*/}
                    {/*                    px={2}*/}
                    {/*                    py={1}*/}
                    {/*                    borderRadius="md"*/}
                    {/*                    fontSize="sm"*/}
                    {/*                >*/}
                    {/*                    {customerNotes.length}*/}
                    {/*                </Box>*/}
                    {/*            )}*/}
                    {/*        </HStack>*/}
                    {/*        <Button size="sm" variant="outline">*/}
                    {/*            + Add Note*/}
                    {/*        </Button>*/}
                    {/*    </HStack>*/}
                    {/*    {sections.customerNotes && (*/}
                    {/*        <VStack align="start">*/}
                    {/*            {customerNotes.length > 0 ? (*/}
                    {/*                customerNotes.map((note, index) => (*/}
                    {/*                    <Text key={index}>{note}</Text>*/}
                    {/*                ))*/}
                    {/*            ) : (*/}
                    {/*                <Text>No Customer Notes</Text>*/}
                    {/*            )}*/}
                    {/*        </VStack>*/}
                    {/*    )}*/}
                    {/*</VStack>*/}
                </>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Add Purchase Note</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Textarea
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Enter your note here..."
                            size="md"
                            resize="vertical"
                            rows={5}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={handleCreateNote}
                            isLoading={isLoading}
                            isDisabled={!newNoteText.trim()}
                        >
                            Save Note
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default NotesComponent;