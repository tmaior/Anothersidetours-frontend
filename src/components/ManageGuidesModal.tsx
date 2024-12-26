import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    VStack,
    HStack,
    Checkbox,
    Input,
    Text,
    Divider,
} from "@chakra-ui/react";
import { useState } from "react";

const guidesData = [
    { name: "Claudiney", available: false },
    { name: "Ben Parker ", available: true },
    { name: "jeff bezos", available: false },
    { name: "Ozymandias", available: false },
    { name: "teste", available: true },
    { name: "Peter Parker", available: true },
];

const ManageGuidesModal = ({ isOpen, onClose, onSelectGuide }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuides, setSelectedGuides] = useState([]);

    const toggleGuide = (guideName) => {
        if (selectedGuides.includes(guideName)) {
            setSelectedGuides(selectedGuides.filter((name) => name !== guideName));
        } else {
            setSelectedGuides([...selectedGuides, guideName]);
        }
    };

    const handleSave = () => {
        if (selectedGuides.length > 0) {
            onSelectGuide(selectedGuides);
        }
        onClose();
    };

    const filteredGuides = guidesData.filter((guide) =>
        guide.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Assign Guides</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="stretch" spacing={4}>
                        <Input
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="md"
                        />
                        <Divider />
                        {filteredGuides.map((guide) => (
                            <HStack key={guide.name} justify="space-between" width="100%">
                                <Checkbox
                                    isChecked={selectedGuides.includes(guide.name)}
                                    onChange={() => toggleGuide(guide.name)}
                                    isDisabled={!guide.available}
                                >
                                    <Text
                                        color={guide.available ? "black" : "gray.400"}
                                    >{`${guide.name} ${
                                        !guide.available ? "(unavailable)" : ""
                                    }`}</Text>
                                </Checkbox>
                                {selectedGuides.includes(guide.name) && (
                                    <Text color="green.500">✔</Text>
                                )}
                            </HStack>
                        ))}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} variant="outline" mr={3}>
                        Cancel
                    </Button>
                    <Button colorScheme="green" onClick={handleSave}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ManageGuidesModal;
