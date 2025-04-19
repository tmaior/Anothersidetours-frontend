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
import {useGuideAssignment} from "../hooks/useGuideAssignment";

interface Guide {
    id: string;
    name: string;
    email: string;
    available: boolean;
}

interface GuideInfo {
    id: string;
    name: string;
    email: string;
}

const ManageGuidesModal = ({isOpen, onClose, onSelectGuide, reservationId}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toast = useToast();
    const { setReservationGuides } = useGuidesStore();
    const { assignGuides } = useGuideAssignment();

    useEffect(() => {
        if (!isOpen) return;
        
        if (!reservationId) {
            toast({
                title: "Error",
                description: "No reservation ID provided",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            return;
        }

        setLoading(true);

        const fetchGuides = axios.get(`${process.env.NEXT_PUBLIC_API_URL}/guides`, {
            withCredentials: true
        });

        const fetchAssignedGuides = axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservationId}/guides`,
            { withCredentials: true }
        );

        Promise.all([fetchGuides, fetchAssignedGuides])
            .then(([guidesResponse, assignedResponse]) => {
                const mappedGuides = guidesResponse.data.map(guide => ({
                    ...guide,
                    available: guide.isActive !== false
                }));
                setGuides(mappedGuides);

                const assignedGuideIds = assignedResponse.data.map(item => item.guideId);
                setSelectedGuides(assignedGuideIds);
            })
            .catch((error) => {
                console.error("Failed to fetch guides:", error);
                toast({
                    title: "Error",
                    description: "Failed to load guides: " + (error.response?.data?.message || error.message),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            })
            .finally(() => setLoading(false));
    }, [toast, isOpen, reservationId, onClose]);

    const toggleGuide = (guideId: string) => {
        if (selectedGuides.includes(guideId)) {
            setSelectedGuides(selectedGuides.filter(id => id !== guideId));
        } else {
            setSelectedGuides([...selectedGuides, guideId]);
        }
    };

    const handleSave = async () => {
        if (!reservationId) {
            toast({
                title: "Error",
                description: "No reservation ID provided",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setSaving(true);

        try {
            const selectedGuidesWithInfo: GuideInfo[] = guides
                .filter(guide => selectedGuides.includes(guide.id))
                .map(guide => ({
                    id: guide.id, 
                    name: guide.name, 
                    email: guide.email
                }));
            await assignGuides(reservationId, selectedGuides);

            setReservationGuides(reservationId, selectedGuidesWithInfo);
            onSelectGuide(selectedGuidesWithInfo);
            
            toast({
                title: "Success",
                description: `Successfully assigned ${selectedGuides.length} guides to the reservation.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
            onClose();
        } catch (error) {
            console.error("Error saving guides:", error);
            toast({
                title: "Error",
                description: "Failed to assign guides: " + (error.response?.data?.message || error.message),
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setSaving(false);
        }
    };

    const filteredGuides = guides.filter(guide =>
        guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <ModalHeader>Assign Guides</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack align="stretch" spacing={4}>
                        <Input
                            placeholder="Search guides..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="md"
                        />
                        <Divider/>
                        {loading ? (
                            <Text>Loading guides...</Text>
                        ) : filteredGuides.length > 0 ? (
                            filteredGuides.map((guide) => (
                                <HStack key={guide.id} justify="space-between" width="100%">
                                    <Checkbox
                                        isChecked={selectedGuides.includes(guide.id)}
                                        onChange={() => toggleGuide(guide.id)}
                                        isDisabled={!guide.available}
                                        fontSize="sm"
                                    >
                                        <Text
                                            fontSize="sm"
                                            color={guide.available ? "black" : "gray.400"}
                                        >
                                            {guide.name}
                                        </Text>
                                    </Checkbox>
                                    {selectedGuides.includes(guide.id) && (
                                        <Text color="green.500">✔</Text>
                                    )}
                                </HStack>
                            ))
                        ) : (
                            <Text>No guides available</Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} variant="outline" mr={3}>
                        Cancel
                    </Button>
                    <Button 
                        colorScheme="green" 
                        onClick={handleSave}
                        isLoading={saving}
                        loadingText="Saving"
                    >
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ManageGuidesModal;
