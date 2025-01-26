import React, {useState} from "react";
import {Box, Button, HStack, IconButton, Text, VStack,} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronRightIcon} from "@chakra-ui/icons";

const NotesComponent = () => {
    const [allSectionsVisible, setAllSectionsVisible] = useState(true);
    const [sections, setSections] = useState({
        eventNotes: true,
        purchaseNotes: true,
        customerNotes: true,
    });

    const eventNotes = [];
    const purchaseNotes = [];
    const customerNotes = [];

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
                            <Button size="sm" variant="outline">
                                + Add Note
                            </Button>
                        </HStack>
                        {sections.purchaseNotes && (
                            <VStack align="start">
                                {purchaseNotes.length > 0 ? (
                                    purchaseNotes.map((note, index) => (
                                        <VStack key={index} align="start">
                                            <Text fontWeight="bold">{note.title}</Text>
                                            <Text color="gray.600">{note.description}</Text>
                                        </VStack>
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
        </Box>
    );
};

export default NotesComponent;