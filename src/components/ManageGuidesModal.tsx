import {
    Button,
    Checkbox,
    Divider,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Text,
    useToast,
    VStack,
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import axios from "axios";
import useGuidesStore from "../utils/store";

interface Guide {
    id: string;
    name: string;
    expertise: string;
}

const ManageGuidesModal = ({isOpen, onClose, onSelectGuide, reservationId}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuides, setSelectedGuides] = useState([]);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const { setReservationGuides } = useGuidesStore();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);

            const fetchGuides = axios.get(`${process.env.NEXT_PUBLIC_API_URL}/guides`);

            const fetchAssignedGuides = axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservationId}/guides`
            );

            Promise.all([fetchGuides, fetchAssignedGuides])
                .then(([guidesResponse, assignedResponse]) => {
                    setGuides(guidesResponse.data);

                    const assignedGuideNames = assignedResponse.data.map((item) => item.guide.name);
                    setSelectedGuides(assignedGuideNames);
                })
                .catch((error) => {
                    console.error("Failed to fetch guides", error);
                    toast({
                        title: "Error",
                        description: "Failed to load guides",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                })
                .finally(() => setLoading(false));
        }
    }, [toast,isOpen, reservationId]);

    const toggleGuide = (guideName) => {
        if (selectedGuides.includes(guideName)) {
            setSelectedGuides(selectedGuides.filter((name) => name !== guideName));
        } else {
            setSelectedGuides([...selectedGuides, guideName]);
        }
    };

    const handleSave = () => {
        const selectedGuidesWithIds = selectedGuides.map((name) => {
            const guide = guides.find((g) => g.name === name);
            return guide ? {id: guide.id, name: guide.name} : null;
        }).filter(Boolean) as Guide[];
        onSelectGuide(selectedGuidesWithIds);
        setReservationGuides(reservationId, selectedGuidesWithIds);
        onClose();
    };

    const filteredGuides = guides.filter((guide) =>
        guide.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <ModalHeader>Assign Guides</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack align="stretch" spacing={4}>
                        <Input
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="md"
                        />
                        <Divider/>
                        {loading ? (
                            <Text>Loading guides...</Text>
                        ) : filteredGuides.length > 0 ? (
                            filteredGuides.map((guide) => (
                                <HStack key={guide.name} justify="space-between" width="100%">
                                    <Checkbox
                                        isChecked={selectedGuides.includes(guide.name)}
                                        onChange={() => toggleGuide(guide.name)}
                                        isDisabled={!guide.available}
                                    >
                                        <Text
                                            color={guide.available ? "black" : "gray.400"}
                                        >
                                            {`${guide.name} ${!guide.available ? "(unavailable)" : ""}`}
                                        </Text>
                                    </Checkbox>
                                    {selectedGuides.includes(guide.name) && (
                                        <Text color="green.500">✔</Text>
                                    )}
                                </HStack>
                            ))
                        ) : (
                            <Text>No guide available</Text>
                        )}
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
