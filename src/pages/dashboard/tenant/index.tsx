import {
    VStack,
    Input,
    Button,
    useColorModeValue,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
} from "@chakra-ui/react";
import React, { useState } from "react";

export default function CreateTenantModal({ isOpen, onClose, addTenantToList }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bgColor = useColorModeValue("white", "gray.800");
    const inputBgColor = useColorModeValue("gray.100", "gray.700");
    const inputTextColor = useColorModeValue("black", "white");
    const toast = useToast();

    const [formData, setFormData] = useState({
        name: "",
    });

    const handleFormChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Error creating tenant");
            }

            const newTenant = await response.json();
            addTenantToList(newTenant);

            toast({
                title: "Tenant Created",
                description: "The tenant was created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            setFormData({ name: "" });
            onClose();
        } catch (error) {
            console.error("Error creating tenant:", error);
            toast({
                title: "Error",
                description: "Failed to create tenant.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create Tenant</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Input
                            placeholder="Tenant Name"
                            bg={inputBgColor}
                            color={inputTextColor}
                            value={formData.name}
                            onChange={(e) => handleFormChange("name", e.target.value)}
                        />
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="teal" onClick={handleSubmit}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
