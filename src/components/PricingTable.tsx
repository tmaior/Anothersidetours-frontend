import React, {useState} from "react";
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
    Radio,
    RadioGroup,
    Select,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import {AddIcon, EditIcon} from "@chakra-ui/icons";
import {useDemographics} from "../contexts/DemographicsContext";

const PricingTable = () => {
    const [pricingStructure, setPricingStructure] = useState("tiered");
    const [flatPrice, setFlatPrice] = useState(169);
    const [tiers, setTiers] = useState([]);
    const [newTier, setNewTier] = useState({
        id: null,
        guests: "",
        basePrices: {},
        adjustments: {},
        adjustmentTypes: {},
        operations: {},
    });
    const {demographics} = useDemographics();

    const basePriceModal = useDisclosure();
    const tierPriceModal = useDisclosure();

    const handlePricingChange = (value) => {
        setPricingStructure(value);
    };

    const handleAddTier = () => {
        const initialBasePrices = demographics.reduce((acc, demo) => {
            if (tiers.length > 0) {
                acc[demo.id] = tiers[0].basePrices[demo.id] || 0;
            } else {
                acc[demo.id] = 0;
            }
            return acc;
        }, {});

        const initialAdjustments = demographics.reduce((acc, demo) => {
            acc[demo.id] = 0;
            return acc;
        }, {});

        const initialAdjustmentTypes = demographics.reduce((acc, demo) => {
            acc[demo.id] = "$";
            return acc;
        }, {});

        const initialOperations = demographics.reduce((acc, demo) => {
            acc[demo.id] = "Markup";
            return acc;
        }, {});

        setNewTier({
            id: crypto.randomUUID(),
            guests: "",
            basePrices: initialBasePrices,
            adjustments: initialAdjustments,
            adjustmentTypes: initialAdjustmentTypes,
            operations: initialOperations,
        });
        tierPriceModal.onOpen();
    };

    const handleSaveTier = () => {
        const finalPrices = {};
        for (const demo of demographics) {
            const basePrice = newTier.basePrices[demo.id] || 0;
            const adjustment = newTier.adjustments[demo.id] || 0;
            const adjustmentType = newTier.adjustmentTypes[demo.id] || "$";
            const operation = newTier.operations[demo.id] || "Markup";

            finalPrices[demo.id] =
                operation === "Markup"
                    ? adjustmentType === "$"
                        ? basePrice + adjustment
                        : basePrice + (basePrice * adjustment) / 100
                    : adjustmentType === "$"
                        ? basePrice - adjustment
                        : basePrice - (basePrice * adjustment) / 100;
        }

        const newTierToSave = {
            id: newTier.id,
            guests: `${newTier.guests} + Guests`,
            basePrices: newTier.basePrices,
            finalPrices,
            adjustments: newTier.adjustments,
            adjustmentTypes: newTier.adjustmentTypes,
            operations: newTier.operations,
        };

        if (tiers.length === 0) {
            setTiers([newTierToSave]);
        } else {
            setTiers([...tiers, newTierToSave]);
        }
        tierPriceModal.onClose();
    };

    const handleDeleteTier = (id) => {
        setTiers(tiers.filter((tier) => tier.id !== id));
    };

    const handleBasePriceChange = (demoId, value) => {
        setNewTier((prev) => ({
            ...prev,
            basePrices: {
                ...prev.basePrices,
                [demoId]: Number(value),
            },
        }));
    };

    const handleAdjustmentChange = (demoId, value) => {
        setNewTier((prev) => ({
            ...prev,
            adjustments: {
                ...prev.adjustments,
                [demoId]: Number(value),
            },
        }));
    };

    const handleAdjustmentTypeChange = (demoId, value) => {
        setNewTier((prev) => ({
            ...prev,
            adjustmentTypes: {
                ...prev.adjustmentTypes,
                [demoId]: value,
            },
        }));
    };

    const handleOperationChange = (demoId, value) => {
        setNewTier((prev) => ({
            ...prev,
            operations: {
                ...prev.operations,
                [demoId]: value,
            },
        }));
    };

    const handleEditTier = (tier) => {
        setNewTier(tier);
        tierPriceModal.onOpen();
    };

    return (
        <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
                Public Pricing
            </Text>
            <VStack align="start" spacing={4}>
                <Box>
                    <VStack align="flex-start">
                        <RadioGroup onChange={handlePricingChange} value={pricingStructure}>
                            <Stack direction="column" spacing={2}>
                                <Radio value="flat">Flat Pricing</Radio>
                                <Radio value="tiered">Tiered Pricing</Radio>
                            </Stack>
                        </RadioGroup>
                    </VStack>
                </Box>

                <Box width="100%">
                    <HStack justifyContent="space-between" spacing={2} mb={2}>
                        <Text fontSize="md" fontWeight="bold">
                            Terms
                        </Text>
                        {pricingStructure === "tiered" && (
                            <Button
                                leftIcon={<AddIcon/>}
                                size="sm"
                                onClick={handleAddTier}
                                colorScheme="gray"
                                variant="outline"
                            >
                                Add Tier
                            </Button>
                        )}
                    </HStack>

                    {pricingStructure === "flat" ? (
                        <Table variant="simple" size="sm">
                            <Thead bg="gray.100">
                                <Tr>
                                    <Th>Demographic</Th>
                                    <Th>Price</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {demographics.map((demo) => (
                                    <Tr key={demo.id}>
                                        <Td>{demo.name}</Td>
                                        <Td>${flatPrice}</Td>
                                        <Td>
                                            <IconButton
                                                icon={<EditIcon/>}
                                                size="xs"
                                                variant="ghost"
                                                aria-label="Edit Price"
                                                onClick={basePriceModal.onOpen}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    ) : (
                        <Table variant="simple" size="sm">
                            <Thead bg="gray.100">
                                <Tr>
                                    <Th>Demographic</Th>
                                    {tiers.map((tier) => (
                                        <Th key={tier.id}>
                                            {tier.guests}{" "}
                                            <IconButton
                                                icon={<EditIcon/>}
                                                size="xs"
                                                variant="ghost"
                                                aria-label="Edit Tier"
                                                onClick={() => handleEditTier(tier)}
                                            />
                                        </Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {demographics.map((demo) => (
                                    <Tr key={demo.id}>
                                        <Td>{demo.name}</Td>
                                        {tiers.map((tier) => (
                                            <Td key={tier.id}>${tier.finalPrices[demo.id].toFixed(2)}</Td>
                                        ))}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Box>
            </VStack>

            <Modal isOpen={tierPriceModal.isOpen} onClose={tierPriceModal.onClose} isCentered>
                <ModalOverlay/>
                <ModalContent maxWidth="900px" width="90%">
                    <ModalHeader>Edit Tier</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Text fontSize="sm" mb={2}>
                            For group size greater than or equal to
                        </Text>
                        <Input
                            type="number"
                            placeholder="Enter guest count"
                            value={newTier.guests}
                            onChange={(e) => setNewTier({...newTier, guests: e.target.value})}
                        />

                        <Text fontSize="md" fontWeight="bold" mt={4} mb={2}>
                            Terms
                        </Text>
                        <Table variant="simple" size="sm">
                            <Thead bg="gray.100">
                                <Tr>
                                    <Th>Demographic</Th>
                                    <Th>Base Price</Th>
                                    <Th>Adjustment</Th>
                                    <Th></Th>
                                    <Th></Th>
                                    <Th>Final Price</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {demographics.map((demo) => (
                                    <Tr key={demo.id}>
                                        <Td>{demo.name}</Td>
                                        <Td>
                                            <Input
                                                type="number"
                                                width="100px"
                                                placeholder="Enter base price"
                                                value={newTier.basePrices[demo.id] || ""}
                                                onChange={(e) => handleBasePriceChange(demo.id, e.target.value)}
                                                disabled={tiers.length > 0 && newTier.id !== tiers[0].id}
                                            />
                                        </Td>
                                        <Td>
                                            <Input
                                                type="number"
                                                width="80px"
                                                value={newTier.adjustments[demo.id] || ""}
                                                onChange={(e) => handleAdjustmentChange(demo.id, e.target.value)}
                                            />
                                        </Td>
                                        <Td>
                                            <Select
                                                value={newTier.adjustmentTypes[demo.id] || "$"}
                                                onChange={(e) => handleAdjustmentTypeChange(demo.id, e.target.value)}
                                            >
                                                <option value="$">$</option>
                                                <option value="%">%</option>
                                            </Select>
                                        </Td>
                                        <Td>
                                            <Select
                                                value={newTier.operations[demo.id] || "Markup"}
                                                onChange={(e) => handleOperationChange(demo.id, e.target.value)}
                                            >
                                                <option value="Markup">Markup</option>
                                                <option value="Markdown">Markdown</option>
                                            </Select>
                                        </Td>
                                        <Td>
                                            $
                                            {newTier.operations[demo.id] === "Markup"
                                                ? newTier.adjustmentTypes[demo.id] === "$"
                                                    ? (newTier.basePrices[demo.id] || 0) + (newTier.adjustments[demo.id] || 0)
                                                    : (newTier.basePrices[demo.id] || 0) + ((newTier.basePrices[demo.id] || 0) * (newTier.adjustments[demo.id] || 0)) / 100
                                                : newTier.adjustmentTypes[demo.id] === "$"
                                                    ? (newTier.basePrices[demo.id] || 0) - (newTier.adjustments[demo.id] || 0)
                                                    : (newTier.basePrices[demo.id] || 0) - ((newTier.basePrices[demo.id] || 0) * (newTier.adjustments[demo.id] || 0)) / 100}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        {newTier?.id && (
                            <Button
                                colorScheme="gray"
                                variant="outline"
                                mr="auto"
                                onClick={() => handleDeleteTier(newTier.id)}
                            >
                                Delete
                            </Button>
                        )}
                        <Button variant="outline" onClick={tierPriceModal.onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" ml={3} onClick={handleSaveTier}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PricingTable;