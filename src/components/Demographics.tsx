import React, {forwardRef, useEffect, useState} from "react";
import {
    Box,
    Button,
    HStack,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Radio,
    RadioGroup,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
import {DeleteIcon, DragHandleIcon, EditIcon} from "@chakra-ui/icons";
import {useGuest} from "../contexts/GuestContext";
import {useDemographics} from "../contexts/DemographicsContext";

interface DemographicsProps {
    tourId: string | null;
}

const DemographicsTable = forwardRef(({tourId}: DemographicsProps, ref) => {
    const [tourDemographics, setTourDemographics] = useState<any[]>([]);
    const [availableDemographics, setAvailableDemographics] = useState<any[]>([]);
    const [selectedDemographics, setSelectedDemographics] = useState<any[]>([]);
    const {tenantId} = useGuest();
    const toast = useToast();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {isOpen: isModalOpen, onOpen: openModal, onClose: closeModal} = useDisclosure();
    const [newDemographic, setNewDemographic] = useState({name: "", caption: ""});
    const {demographics, addDemographic, removeDemographic} = useDemographics();

    useEffect(() => {
        if (tourId) {
            fetchTourDemographics();
        }
    }, [tourId]);

    const fetchTourDemographics = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demographics/demographicByTourId/${tourId}`);
            const data = await response.json();
            setTourDemographics(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching tour demographics:", error);
        }
    };

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/demographics/tenant/${tenantId}`)
            .then((res) => res.json())
            .then((data) => setAvailableDemographics(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error fetching available demographics:", err));
    }, [tenantId]);

    const handleSelectDemographic = (selectedId) => {
        const selectedDemo = availableDemographics.find((demo) => demo.id === selectedId);
        if (selectedDemo && !selectedDemographics.find((demo) => demo.id === selectedId)) {
            setSelectedDemographics([...selectedDemographics, selectedDemo]);
            addDemographic(selectedDemo);
        }
        onClose();
    };

    const handleRemoveDemographic = (id) => {
        setSelectedDemographics(selectedDemographics.filter((demo) => demo.id !== id));
        removeDemographic(id);
    };

    const handleSaveDemographics = async () => {
        if (selectedDemographics.length === 0) {
            toast({
                title: "No demographics selected",
                description: "Please add at least one demographic before saving.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${tourId}/addDemographics`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({demographics: selectedDemographics.map((demo) => demo.id)}),
            });

            if (!response.ok) {
                throw new Error("Failed to save demographics");
            }

            setTourDemographics([...tourDemographics, ...selectedDemographics]);
            setSelectedDemographics([]);

            toast({
                title: "Demographics Saved",
                description: "Successfully added demographics to the tour.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error saving demographics:", error);
            toast({
                title: "Error",
                description: "Could not save demographics.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCreateDemographic = () => {
        if (!newDemographic.name.trim()) {
            toast({
                title: "Error",
                description: "Name is required.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        toast({
            title: "Success",
            description: "Demographic created successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });

        setNewDemographic({name: "", caption: ""});
        closeModal();
    };

    return (
        <Box>
            <HStack justify={"space-between"} spacing={2} mt={2} mb={2}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Demographics
                </Text>
                <Popover isOpen={isOpen} onClose={onClose} placement="bottom-start">
                    <PopoverTrigger>
                        <Button onClick={onOpen} colorScheme="gray" variant="outline">
                            + Add Demographic
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow/>
                        <PopoverBody>
                            <VStack align="stretch">
                                <RadioGroup onChange={handleSelectDemographic}>
                                    <Stack direction="column" maxH="200px" overflowY="auto">
                                        {availableDemographics.map((demo) => (
                                            <Radio key={demo.id} value={demo.id}>
                                                {demo.name}
                                            </Radio>
                                        ))}
                                    </Stack>
                                </RadioGroup>
                                <Button colorScheme="gray" variant="outline" onClick={openModal}>
                                    + Create Demographic
                                </Button>
                            </VStack>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </HStack>

            <Table variant="simple" borderRadius="md" overflow="hidden">
                <Thead>
                    <Tr bg="gray.100">
                        <Th>Demographic</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {tourDemographics.length === 0 && selectedDemographics.length === 0 ? (
                        <Tr>
                            <Td colSpan={2} textAlign="center" p={4} color="gray.500">
                                No demographics available
                            </Td>
                        </Tr>
                    ) : (
                        <>
                            {tourDemographics.map((demo) => (
                                <Tr key={demo.id} fontSize="sm">
                                    <Td p={2}>
                                        <HStack spacing={2}>
                                            <DragHandleIcon boxSize={3}/>
                                            <Text fontSize="sm">{demo.name}</Text>
                                        </HStack>
                                    </Td>
                                    <Td p={1}>
                                        <IconButton
                                            icon={<DeleteIcon/>}
                                            size="xs"
                                            colorScheme="gray"
                                            variant="outline"
                                            aria-label="Delete"
                                            onClick={() => handleRemoveDemographic(demo.id)}
                                        />
                                    </Td>
                                </Tr>
                            ))}

                            {selectedDemographics.map((demo) => (
                                <Tr key={demo.id} fontSize="sm" bg="gray.50">
                                    <Td p={2}>
                                        <HStack spacing={2}>
                                            <DragHandleIcon boxSize={3}/>
                                            <Text fontSize="sm">{demo.name} (Unsaved)</Text>
                                        </HStack>
                                    </Td>
                                    <HStack p={1}>
                                        <IconButton
                                            icon={<EditIcon/>}
                                            size="xs"
                                            aria-label="Edit"
                                            colorScheme="gray"
                                            variant="outline"
                                            // onClick={() => handleEditDemographic(demo.id, demo.name)}
                                        />
                                        <IconButton
                                            icon={<DeleteIcon/>}
                                            size="xs"
                                            colorScheme="gray"
                                            variant="outline"
                                            aria-label="Delete"
                                            onClick={() => handleRemoveDemographic(demo.id)}
                                        />
                                    </HStack>
                                </Tr>
                            ))}
                        </>
                    )}
                </Tbody>
            </Table>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Create Demographic</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Text mb={2}>Name</Text>
                        <Input
                            placeholder="Name"
                            value={newDemographic.name}
                            onChange={(e) => setNewDemographic({...newDemographic, name: e.target.value})}
                        />

                        <Text mt={4} mb={2}>Caption</Text>
                        <Textarea
                            placeholder="Caption"
                            value={newDemographic.caption}
                            onChange={(e) => setNewDemographic({...newDemographic, caption: e.target.value})}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="outline" mr={3} onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleCreateDemographic}
                            isDisabled={!newDemographic.name.trim()}
                        >
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
});

DemographicsTable.displayName = "DemographicsTable";

export default DemographicsTable;