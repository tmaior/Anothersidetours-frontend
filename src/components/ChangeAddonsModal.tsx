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
    const [reservationAddons, setReservationAddons] = useState([]);

    useEffect(() => {
        const fetchAddons = async () => {
            if (!booking?.id || !booking.tourId) return;

            try {
                const [reservationAddonsResponse, allAddonsResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/reservation-by/${booking.id}`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${booking.tourId}`)
                ]);

                setAllAddons(allAddonsResponse.data);
                setReservationAddons(reservationAddonsResponse.data);
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

        try {
            const reservationAddonsMap = reservationAddons.reduce((map, reservationAddon) => {
                map[reservationAddon.addonId] = reservationAddon.id;
                return map;
            }, {});

            for (const [addonId, value] of Object.entries(selectedAddons)) {
                const addon = allAddons.find((a) => a.id === addonId);
                if (!addon) continue;

                const reservationAddonId = reservationAddonsMap[addonId];

                if (addon.type === 'SELECT') {
                    const numericValue = Number(value);
                    if (numericValue > 0) {
                        if (reservationAddonId) {
                            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                                value: value.toString(),
                            });
                        } else {
                            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons`, {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                                addonId,
                                value: value.toString(),
                            });
                        }
                    } else if (reservationAddonId) {
                        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
                            data: {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                            },
                        });
                    }
                } else if (addon.type === 'CHECKBOX') {
                    if (value) {
                        if (reservationAddonId) {
                            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                                value: "1",
                            });
                        } else {
                            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons`, {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                                addonId,
                                value: "1",
                            });
                        }
                    } else if (reservationAddonId) {
                        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/reservation-addons/${reservationAddonId}`, {
                            data: {
                                tenantId: booking.tenantId,
                                reservationId: booking.id,
                            },
                        });
                    }
                }
            }

            toast({
                title: "Success",
                description: "Add-ons updated successfully.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            onClose();
        } catch (error) {
            console.error("Error saving add-ons:", error);
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
                                allAddons={allAddons}
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