import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
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
    useToast
} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import React, {useCallback, useEffect, useState} from "react";

export default function NotesSection({reservationId}) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [notes, setNotes] = useState([]);
    const toast = useToast();

    const fetchNotes = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${reservationId}`,
                {
                    credentials: 'include',
                });
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    }, [reservationId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes, reservationId]);

    const handleAddNote = async () => {
        if (title.trim() && content.trim()) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reservationId,
                        description: content,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to add note");
                }

                const createdNote = await response.json();
                setNotes((prevNotes) => [...prevNotes, createdNote]);
                setTitle("");
                setContent("");
                onClose();

                toast({
                    title: "Note Added",
                    description: "Note has been added successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error("Error adding note:", error);
                toast({
                    title: "Error",
                    description: "Failed to add note.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const handleRemoveNote = async (noteId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${noteId}`, {
                method: "DELETE",
                credentials: 'include',
            });

            if (!response.ok) throw new Error("Failed to delete note");

            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

            toast({
                title: "Note Removed",
                description: "Note has been removed successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error removing note:", error);
            toast({
                title: "Error",
                description: "Failed to remove note.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box mt={6} pt={4} w={"300px"}>
            <Accordion allowToggle>
                <AccordionItem border="none">
                    <HStack>
                        <h2>
                            <AccordionButton _hover={{backgroundColor: "transparent"}}>
                                <Box as="span" flex="1" textAlign="left">
                                    <Text fontSize="lg" fontWeight="bold">Event Notes</Text>
                                </Box>
                                <AccordionIcon/>
                            </AccordionButton>
                        </h2>
                        <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<AddIcon boxSize={3}/>}
                            onClick={onOpen}
                        >
                            Add Note
                        </Button>
                    </HStack>
                    <AccordionPanel pb={4}>
                        {notes.length > 0 ? (
                            notes.map((note, index) => (
                                <HStack key={index} justify="space-between" mb={4}>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="medium">{note.title || 'Note'}</Text>
                                        <Text fontSize="sm" color="gray.600" mt={1}>
                                            {note.description}
                                        </Text>
                                    </Box>
                                    <Button
                                        size="xs"
                                        colorScheme="red"
                                        onClick={() => handleRemoveNote(note.id)}
                                    >
                                        Remove
                                    </Button>
                                </HStack>
                            ))
                        ) : (
                            <Text fontSize="sm" color="gray.500">No Event Notes</Text>
                        )}
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Add New Note</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <FormControl mb={4}>
                            <FormLabel>Title</FormLabel>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter note title"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Content</FormLabel>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter note content"
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleAddNote}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}