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

const PricingTable = () => {
    const [pricingStructure, setPricingStructure] = useState("tiered");
    const [tiers, setTiers] = useState([{guests: "1+ Guests", price: 149}]);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [newTier, setNewTier] = useState({
        guests: "",
        basePrice: 149,
        adjustment: 0,
        adjustmentType: "$",
        operation: "Markup"
    });

    const handlePricingChange = (value) => {
        setPricingStructure(value);
    };

    const handleAddTier = () => {
        setNewTier({guests: "", basePrice: 149, adjustment: 0, adjustmentType: "$", operation: "Markup"});
        onOpen();
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
            {...newTier, guests: `${newTier.guests} + Guests`, price: finalPrice.toFixed(2)}
        ]);
        onClose();
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
                        <Button
                            leftIcon={<AddIcon/>}
                            size="sm"
                            onClick={handleAddTier}
                            colorScheme="gray"
                            variant="outline"
                        >
                            Add Tier
                        </Button>
                    </HStack>

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
                                                onOpen();
                                            }}
                                        />
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>Guests</Td>
                                {tiers.map((tier, index) => (
                                    <Td key={index}>${tier.price}</Td>
                                ))}
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay/>
                <ModalContent maxWidth="700px">
                    <ModalHeader>Tier {tiers.length + 1}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Text fontSize="sm" mb={2}>
                            For group size greater than or equal to
                        </Text>
                        <Input
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
                                <Tr>
                                    <Td>Guests</Td>
                                    <Td>${newTier.basePrice}</Td>
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
                            </Tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onClose}>
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