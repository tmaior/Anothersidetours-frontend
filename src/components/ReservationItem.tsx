import {
    Box,
    Button, Checkbox,
    Flex,
    HStack,
    IconButton,
    Image,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import {BsSticky, BsThreeDots} from "react-icons/bs";
import {FaPencilAlt} from "react-icons/fa";
import React, {useState} from "react";
import {AiOutlineCompass} from "react-icons/ai";

const ReservationItem = ({
                             date,
                             day,
                             availableSummary,
                             reservedSummary,
                             reservations,
                             onNoteClick
                         }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedGuide, setSelectedGuide] = useState<string>("");
    const guides = [
        "AJ West",
        "Ben Hussock",
        "Jeff Mirkin",
        "Jose Oyola",
        "Kenneth Lippman",
        "Luce Metrius",
    ];

    const handleGuideSelection = (guide: string) => {
        setSelectedGuide(guide);
        onClose();
    };

    return (
        <VStack align="stretch" spacing={4} bg="gray.50" p={4} borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                {date} {day} &nbsp;&nbsp; {availableSummary} - {reservedSummary}
            </Text>
            {reservations.map((item, index) => (
                <Flex
                    key={index}
                    bg="white"
                    p={3}
                    borderRadius="md"
                    align="center"
                    justify="space-between"
                    boxShadow="sm"
                >
                    <HStack spacing={3}>
                        <Box minWidth="70px">
                            <Text fontWeight="medium" fontSize="sm" color="gray.600">
                                {item.time}
                            </Text>
                        </Box>
                        <Image
                            src={item.imageUrl}
                            boxSize="40px"
                            borderRadius="md"
                            alt="Tour Icon"
                        />
                    </HStack>
                    <Box flex="1" ml={4}>
                        <Text fontWeight="semibold" fontSize="sm">
                            {item.title}
                        </Text>
                        <HStack spacing={3} fontSize="xs" color="gray.500">
                            <Text>{item.available}</Text>
                            <Text>{item.reservedDetails}</Text>
                        </HStack>
                    </Box>
                    <HStack spacing={4} align="center" >
                        <Box boxSize="8px" borderRadius="full" bg={item.statusColor}/>
                        <Flex w={"900px"} display="flex" justifyContent="space-between" alignItems="center" p={2}>
                            <HStack spacing={1}>
                                <FaPencilAlt color="gray"/>
                                <Text fontSize="xs">{item.capacity}</Text>
                            </HStack>
                            <Flex justify="center" align="center" flex="1">
                                <AiOutlineCompass />
                                <Text
                                    marginLeft={"5px"}
                                    fontSize="xs"
                                    color="green.600"
                                    textAlign="center"
                                    onClick={onOpen}
                                    cursor="pointer"
                                    _hover={{ color: "blue.500" }}
                                >
                                    {selectedGuide || item.guide || "No guide available"}
                                </Text>
                            </Flex>
                            <Flex align="center" justify="center">
                                {item.hasNotes ? (
                                    <IconButton
                                        icon={<BsSticky />}
                                        variant="ghost"
                                        aria-label="Notes"
                                        size="sm"
                                        color="orange.500"
                                        onClick={() => onNoteClick(item)}
                                    />
                                ) : (
                                    <Box width="20px" />
                                )}
                            </Flex>
                        </Flex>
                        <IconButton
                            icon={<BsThreeDots/>}
                            variant="ghost"
                            aria-label="Options"
                            size="sm"
                        />
                        <Button variant="outline" colorScheme="green" size="xs">
                            +
                        </Button>
                    </HStack>
                </Flex>
            ))}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Assign Guide</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {guides.map((guide) => (
                            <HStack key={guide} spacing={4} align="center">
                                <Checkbox
                                    isChecked={selectedGuide === guide}
                                    onChange={() => handleGuideSelection(guide)}
                                />
                                <Text>{guide}</Text>
                            </HStack>
                        ))}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Save Changes
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
};

export default ReservationItem;
