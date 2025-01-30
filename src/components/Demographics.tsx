import React, {forwardRef, useEffect, useState} from "react";
import {Box, HStack, IconButton, Table, Tbody, Td, Text, Th, Thead, Tr, useToast} from "@chakra-ui/react";
import {DeleteIcon, DragHandleIcon, EditIcon} from "@chakra-ui/icons";
import DemographicsDropdown from "./DemographicsDropdown";
import {useGuest} from "./GuestContext";

interface DemographicsProps {
    tourId: string | null;
}

const DemographicsTable = forwardRef(({tourId}: DemographicsProps, ref) => {
    const [demographics, setDemographics] = useState([]);
    const [newDemographic, setNewDemographic] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const toast = useToast();
    const {tenantId} = useGuest();

    useEffect(() => {
        fetchDemographics();
    }, []);

    const fetchDemographics = async () => {

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/demographics/${tourId}`);
            const data = await response.json();

            setDemographics(data);
        } catch (error) {
            console.error("Error fetching demographics:", error);
        }
    };

    const handleAddDemographic = async () => {
        if (!newDemographic.trim()) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${tourId}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name: newDemographic}),
            });

            if (!response.ok) {
                throw new Error("Failed to add demographic");
            }

            const newDemo = await response.json();
            setDemographics([...demographics, newDemo]);
            setNewDemographic("");

            toast({
                title: "Demographic Added",
                description: `Successfully added "${newDemo.name}"`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error adding demographic:", error);
            toast({
                title: "Error",
                description: "Could not add demographic.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRemoveDemographic = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete demographic");
            }

            setDemographics(demographics.filter((demo) => demo.id !== id));

            toast({
                title: "Demographic Removed",
                description: "Successfully removed demographic.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error deleting demographic:", error);
            toast({
                title: "Error",
                description: "Could not remove demographic.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleEditDemographic = (id: string, name: string) => {
        setNewDemographic(name);
        setEditingId(id);
    };

    const handleSaveEdit = async () => {
        if (!editingId || !newDemographic.trim()) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${editingId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name: newDemographic}),
            });

            if (!response.ok) {
                throw new Error("Failed to update demographic");
            }

            const updatedDemo = await response.json();
            setDemographics(demographics.map((demo) =>
                demo.id === editingId ? updatedDemo : demo
            ));

            setEditingId(null);
            setNewDemographic("");

            toast({
                title: "Demographic Updated",
                description: `Successfully updated to "${updatedDemo.name}"`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error updating demographic:", error);
            toast({
                title: "Error",
                description: "Could not update demographic.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box>
            <HStack justify={"space-between"} spacing={2} mt={2} mb={2}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Demographics
                </Text>
                <DemographicsDropdown onSelect={handleAddDemographic}/>
            </HStack>
            <Table variant="simple" borderRadius="md" overflow="hidden">

                <Thead>
                    <Tr bg="gray.100">
                        <Th>Demographic</Th>
                        <Th>Caption</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {demographics.map((demo, index) => (
                        <Tr key={index} fontSize="sm">
                            <Td p={2}>
                                <HStack spacing={2}>
                                    <DragHandleIcon boxSize={3}/>
                                    <Text fontSize="sm">{demo.name}</Text>
                                </HStack>
                            </Td>
                            <Td p={1}>
                                <Text fontSize="sm">{demo.caption}</Text>
                            </Td>
                            <Td p={1}>
                                <HStack spacing={2}>
                                    <IconButton
                                        icon={<EditIcon/>}
                                        size="xs"
                                        aria-label="Edit"
                                        onClick={() => handleEditDemographic(demo.id, demo.name)}
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
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
});

DemographicsTable.displayName = "DemographicsTable";

export default DemographicsTable;