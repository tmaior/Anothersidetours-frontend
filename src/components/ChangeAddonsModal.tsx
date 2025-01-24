import {
    Button,
    Checkbox,
    Flex,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Switch,
    Text,
    useToast,
    VStack,
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import PurchaseAndPaymentSummary from "./PurchaseAndPaymentSummary";
import axios from "axios";

export default function ChangeAddOns({isOpen, onClose, booking}) {
    const [selectedAddons, setSelectedAddons] = useState({});
    const [allAddons, setAllAddons] = useState([]);
    const [isLoadingAddons, setIsLoadingAddons] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const fetchAddons = async () => {
            if (!booking?.id || !booking.tourId) return;

            try {
                const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`)
                ]);

                setAllAddons(allAddonsResponse.data);

                const addonMap = {};
                allAddonsResponse.data.forEach(addon => {
                    addonMap[addon.id] = addon;
                });

                const initialSelected = {};

                reservationAddonsResponse.data.forEach(resAddon => {
                    const addon = addonMap[resAddon.addonId];
                    if (addon) {
                        if (addon.type === 'SELECT') {
                            initialSelected[addon.id] = parseInt(resAddon.value, 10) || 0;
                        } else if (addon.type === 'CHECKBOX') {
                            initialSelected[addon.id] = resAddon.value === "1";
                        }
                    }
                });

                setSelectedAddons(initialSelected);
            } catch (error) {
                console.error('Error when searching for add-ons:', error);
                toast({
                    title: "Erro",
                    description: "Failed to load add-ons.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoadingAddons(false);
            }
        };

        if (isOpen) {
            fetchAddons();
        }
    }, [booking?.id, booking.tourId, isOpen, toast]);

    const handleIncrement = (addonId) => {
        setSelectedAddons(prev => ({
            ...prev,
            [addonId]: (prev[addonId] || 0) + 1
        }));
    };

    const handleDecrement = (addonId) => {
        setSelectedAddons(prev => ({
            ...prev,
            [addonId]: prev[addonId] > 0 ? prev[addonId] - 1 : 0
        }));
    };

    const handleCheckboxChange = (addonId) => {
        setSelectedAddons(prev => ({
            ...prev,
            [addonId]: !prev[addonId]
        }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const transformedAddons = Object.entries(selectedAddons).map(([id, value]) => {
            const addon = allAddons.find(a => a.id === id);
            if (!addon) return null;

            if (addon.type === 'SELECT') {
                return {addonId: id, value: value.toString()};
            } else if (addon.type === 'CHECKBOX') {
                return {addonId: id, value: value ? "1" : "0"};
            }
            return null;
        }).filter(Boolean);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/update`, {
                bookingId: booking.id,
                addons: transformedAddons
            });
            toast({
                title: "Success",
                description: "Add-ons updated successfully.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            onClose();
        } catch (error) {
            console.error('Error saving add-ons:', error);
            toast({
                title: "Erro",
                description: "Failed to save add-ons.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingAddons) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} size="3xl">
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader textAlign="center">Change Add-Ons</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex justify="center" align="center" height="200px">
                            <Spinner size="lg"/>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader textAlign="center">Change Add-Ons</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <HStack align="start" spacing={20}>
                        <VStack spacing={4} align="stretch">
                            {allAddons.map(addon => (
                                <Flex key={addon.id} justify="space-between" align="center" gap={20}>
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold">{addon.label}</Text>
                                        <Text color="gray.500">${addon.price.toFixed(2)}</Text>
                                    </VStack>
                                    {addon.type === 'SELECT' ? (
                                        <Flex align="center">
                                            <Button size="sm" onClick={() => handleDecrement(addon.id)}
                                                    disabled={selectedAddons[addon.id] <= 0}>
                                                -
                                            </Button>
                                            <Input
                                                value={selectedAddons[addon.id] || 0}
                                                readOnly
                                                w="50px"
                                                textAlign="center"
                                                mx={2}
                                            />
                                            <Button size="sm" onClick={() => handleIncrement(addon.id)}>
                                                +
                                            </Button>
                                        </Flex>
                                    ) : addon.type === 'CHECKBOX' ? (
                                        <Switch
                                            isChecked={selectedAddons[addon.id] || false}
                                            onChange={() => handleCheckboxChange(addon.id)}
                                        />
                                    ) : null}
                                </Flex>
                            ))}
                        </VStack>
                        <HStack align="center">
                            <PurchaseAndPaymentSummary
                                booking={booking}
                                guestQuantity={booking.guestQuantity}
                                selectedAddons={selectedAddons}
                            />
                        </HStack>
                    </HStack>
                </ModalBody>

                <ModalFooter>
                    <Flex justify="flex-end" align="center" w="100%">
                        <Checkbox id="notifyCustomer" mr={4}>
                            Notify Customer
                        </Checkbox>
                        <Button colorScheme="gray" mr={2} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleSaveChanges} isLoading={isSaving}>
                            Save Changes
                        </Button>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}