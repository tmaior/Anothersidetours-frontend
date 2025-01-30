import React, {useEffect, useState} from "react";
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
    const [tiers, setTiers] = useState([{guests: "1+ Guests", price: 149}]);
    const [newTier, setNewTier] = useState({
        guests: "",
        basePrice: 0,
        adjustment: 0,
        adjustmentType: "$",
        operation: "Markup"
    });
    const [tempPrice, setTempPrice] = useState(flatPrice);
    const {demographics} = useDemographics();
    const [tierData, setTierData] = useState({});

    const basePriceModal = useDisclosure();
    const tierPriceModal = useDisclosure();

    const handlePricingChange = (value) => {
        setPricingStructure(value);
    };

    useEffect(() => {
        setTiers((prevTiers) => prevTiers.filter(tier => demographics.some(d => d.id === tier.id)));
    }, [demographics]);

    const handleAddTier = () => {
        setNewTier({guests: "", basePrice: 0, adjustment: 0, adjustmentType: "$", operation: "Markup"});
        tierPriceModal.onOpen();
    };

    const handleSaveTier = () => {
        const finalPrice =
            newTier.operation === "Markup"
                ? newTier.adjustmentType === "$"
                    ? newTier.basePrice + newTier.adjustment
                    : newTier.basePrice + (newTier.basePrice * newTier.adjustment) / 100
                : newTier.adjustmentType === "$"
                    ? newTier.basePrice - newTier.adjustment
                    : newTier.basePrice - (newTier.basePrice * newTier.adjustment) / 100;

        setTiers([
            ...tiers,
            ...tiers,
            {...newTier, guests: `${newTier.guests} + Guests`, price: finalPrice.toFixed(2)}
        ]);
        tierPriceModal.onClose();
    };

    const handleDeleteTier = () => {
        setTiers((prevTiers) => prevTiers.filter(tier => tier.id !== newTier.id));
        tierPriceModal.onClose();
    };

    const handleSavePrice = () => {
        setFlatPrice(tempPrice);
        basePriceModal.onClose();
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
                                    {tiers.map((tier, index) => (
                                        <Th key={index}>
                                            {tier.guests}{" "}
                                            <IconButton
                                                icon={<EditIcon/>}
                                                size="xs"
                                                variant="ghost"
                                                aria-label="Edit Tier"
                                                onClick={() => {
                                                    setNewTier(tier);
                                                    tierPriceModal.onOpen();
                                                }}
                                            />
                                        </Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {demographics.map((demo) => (
                                    <Tr key={demo.id}>
                                        <Td>{demo.name}</Td>
                                        {tiers.map((tier, index) => (
                                            <Td key={index}>${tier.price}</Td>
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
                    <ModalHeader>Tier {tiers.length + 1}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Text fontSize="sm" mb={2}>
                            For group size greater than or equal to
                        </Text>
                        <Input
                            type="number"
                            placeholder="Enter guest count"
                            value={newTier.guests}
                            onChange={(e) =>
                                setNewTier({...newTier, guests: e.target.value})
                            }
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
                                                value={newTier?.basePrice || ""}
                                                onChange={(e) =>
                                                    setNewTier({...newTier, basePrice: Number(e.target.value) || ""})
                                                }
                                            />
                                        </Td>
                                        <Td>
                                            <Input
                                                type="number"
                                                width="80px"
                                                value={newTier.adjustment}
                                                onChange={(e) =>
                                                    setNewTier({
                                                        ...newTier,
                                                        adjustment: Number(e.target.value),
                                                    })
                                                }
                                            />
                                        </Td>
                                        <Td>
                                            <Select
                                                value={newTier.adjustmentType}
                                                onChange={(e) =>
                                                    setNewTier({...newTier, adjustmentType: e.target.value})
                                                }
                                            >
                                                <option value="$">$</option>
                                                <option value="%">%</option>
                                            </Select>
                                        </Td>
                                        <Td>
                                            <Select
                                                value={newTier.operation}
                                                onChange={(e) =>
                                                    setNewTier({...newTier, operation: e.target.value})
                                                }
                                            >
                                                <option value="Markup">Markup</option>
                                                <option value="Markdown">Markdown</option>
                                            </Select>
                                        </Td>
                                        <Td>
                                            $
                                            {newTier.operation === "Markup"
                                                ? newTier.adjustmentType === "$"
                                                    ? newTier.basePrice + newTier.adjustment
                                                    : newTier.basePrice +
                                                    (newTier.basePrice * newTier.adjustment) / 100
                                                : newTier.adjustmentType === "$"
                                                    ? newTier.basePrice - newTier.adjustment
                                                    : newTier.basePrice -
                                                    (newTier.basePrice * newTier.adjustment) / 100}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        {newTier?.guests && (
                            <Button
                                colorScheme="gray"
                                variant="outline"
                                mr="auto"
                                onClick={() => {
                                    handleDeleteTier(newTier.guests);
                                }}
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