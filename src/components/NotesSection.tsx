import {
    Box,
    Button,
    HStack,
    Text,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import React from "react";

export default function NotesSection({ notes }) {
    return (
        <Box mt={6} pt={4} w={"300px"}>
            <Accordion allowToggle>
                <AccordionItem border="none">
                    <HStack>
                        <h2>
                            <AccordionButton
                                _hover={{
                                    backgroundColor: "transparent"
                                }}
                            >
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
                        >
                            Add Note
                        </Button>

                    </HStack>
                    <AccordionPanel pb={4}>
                        {notes.length > 0 ? (
                            notes.map((note, index) => (
                                <Box key={index} mb={4}>
                                    <Text fontSize="sm" fontWeight="medium">{note.title}</Text>
                                    <Text fontSize="sm" color="gray.600" mt={1}>
                                        {note.content}
                                    </Text>
                                </Box>
                            ))
                        ) : (
                            <Text fontSize="sm" color="gray.500">No Event Notes</Text>
                        )}
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Box>
    );
}