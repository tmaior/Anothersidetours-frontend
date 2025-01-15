import React, {useState} from "react";
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
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
import {FaRegHandPaper} from "react-icons/fa";
import {CiCalendar, CiCircleMinus} from "react-icons/ci";
import {GoPerson} from "react-icons/go";
import {MdAccessTime} from "react-icons/md";

const ChangeCapacityModal = ({isOpen, onClose, eventDetails}) => {
    const [selectedOption, setSelectedOption] = useState("");
    const [selected, setSelected] = useState("");

    const handleSelect = (value) => {
        setSelected(value);
    };

    const handleApplyChanges = () => {
        console.log("Selected Option:", selectedOption);
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
            <ModalContent>
                <ModalHeader textAlign="center">Change Capacity</ModalHeader>
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
                                    <HStack spacing={1}>
                                        <GoPerson/>
                                        <Text as="span">{`${eventDetails.guestQuantity} guests`}</Text>
                                    </HStack>
                                </HStack>
                            </VStack>
                        </HStack>
                    </Box>

                    <Box bg="yellow.100" p={3} borderRadius="md" mb={4}>
                        <Text fontSize="sm">
                            Actual availability will be adjusted based on per event maximum
                            capacity
                        </Text>
                    </Box>

                    <Flex direction="column" align="center" mb={4}>
                        <HStack spacing={4} mb={4}>
                            <Text>∞ Available</Text>
                            <Text>2 Reserved</Text>
                        </HStack>
                        <HStack spacing={6}>
                            <Button
                                variant="outline"
                                onClick={() => handleSelect("cap-event")}
                                isActive={selected === "cap-event"}
                                _active={{bg: "blue.50", borderColor: "blue.500"}}
                                _hover={{bg: "gray.100"}}
                                px={6}
                                py={4}
                                w="200px"
                            >
                                <HStack spacing={2}>
                                    <Icon as={FaRegHandPaper} boxSize={4}/>
                                    <Text>Cap event</Text>
                                </HStack>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSelect("blackout")}
                                isActive={selected === "blackout"}
                                _active={{bg: "blue.50", borderColor: "blue.500"}}
                                _hover={{bg: "gray.100"}}
                                px={6}
                                py={4}
                                w="200px"
                            >
                                <HStack spacing={2}>
                                    <Icon as={CiCircleMinus} boxSize={4}/>
                                    <Text>Blackout</Text>
                                </HStack>
                            </Button>
                        </HStack>
                    </Flex>

                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleApplyChanges}
                            isDisabled={!selectedOption}
                        >
                            Apply Changes
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ChangeCapacityModal;