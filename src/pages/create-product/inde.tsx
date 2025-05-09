import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    Switch,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import {AddIcon, InfoOutlineIcon} from "@chakra-ui/icons";
import React, {useState} from "react";
import DashboardLayout from "../../components/DashboardLayout";

interface TourFormProps {
    isEditing?: boolean,
    tourId?: string | string[],
    initialData?: unknown
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DescriptionContentPage({isEditing, tourId, initialData}: TourFormProps) {
    const [includedItems, setIncludedItems] = useState([]);
    const [bringItems, setBringItems] = useState([]);
    const [newIncludedItem, setNewIncludedItem] = useState("");
    const [newBringItem, setNewBringItem] = useState("");
    const [overrideFooter, setOverrideFooter] = useState(false);

    const handleAddIncludedItem = () => {
        if (newIncludedItem.trim()) {
            setIncludedItems([...includedItems, newIncludedItem.trim()]);
            setNewIncludedItem("");
        }
    };

    const handleAddBringItem = () => {
        if (newBringItem.trim()) {
            setBringItems([...bringItems, newBringItem.trim()]);
            setNewBringItem("");
        }
    };

    const handleRemoveIncludedItem = (index) => {
        setIncludedItems(includedItems.filter((_, i) => i !== index));
    };

    const handleRemoveBringItem = (index) => {
        setBringItems(bringItems.filter((_, i) => i !== index));
    };

    return (
        <DashboardLayout>


            <Box p={8} maxWidth="900px" mx="auto">
                <Heading mb={6}>Description Content</Heading>

                <Box mb={8}>
                    <Text fontSize="lg" fontWeight="bold">
                        Experience Description
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                        Important details that will be presented to your customer
                        throughout the booking process
                    </Text>

                    <VStack spacing={4} align="stretch">

                        <Box>
                            <Text fontSize="sm" mb={1}>
                                Title is required <Text as="span" color="red">*</Text>
                            </Text>
                            <Input placeholder="Enter Title" isRequired/>
                        </Box>
                        <Box>
                            <Text fontSize="sm" mb={1}>
                                Description is required <Text as="span" color="red">*</Text>
                            </Text>
                            <Textarea
                                placeholder="Write a detailed description..."
                                resize="none"
                                isRequired
                            />
                            <Text fontSize="xs" color="gray.500">
                                0 characters | 0 words
                            </Text>
                        </Box>

                        <Flex align="center">
                            <Text fontSize="sm" mb={1} flex="1">
                                Meeting Location is required
                            </Text>
                            <Switch colorScheme="teal"/>
                            <Button ml={2}>Enable Map</Button>
                        </Flex>
                        <Input placeholder="Enter meeting location"/>

                        <Divider my={6}/>
                        <Heading as="h3" size="md" mb={4}>
                            Checklist
                        </Heading>
                        <HStack spacing={4}>
                            <Box flex="1">
                                <Text fontSize="sm" mb={1}>
                                    What&#39;s Included
                                </Text>
                                <Flex>
                                    <Input
                                        placeholder="Add Item"
                                        value={newIncludedItem}
                                        onChange={(e) => setNewIncludedItem(e.target.value)}
                                    />
                                    <IconButton
                                        icon={<AddIcon/>}
                                        ml={2}
                                        onClick={handleAddIncludedItem} aria-label={""}/>
                                </Flex>
                                <VStack align="stretch" mt={2}>
                                    {includedItems.map((item, index) => (
                                        <Flex key={index} align="center" justify="space-between">
                                            <Text>{item}</Text>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => handleRemoveIncludedItem(index)}
                                            >
                                                Remove
                                            </Button>
                                        </Flex>
                                    ))}
                                </VStack>
                            </Box>

                            <Box flex="1">
                                <Text fontSize="sm" mb={1}>
                                    What&#39;s Not Included
                                </Text>
                                <Flex>
                                    <Input
                                        placeholder="Add Item"
                                        value={newIncludedItem}
                                        onChange={(e) => setNewIncludedItem(e.target.value)}
                                    />
                                    <IconButton
                                        icon={<AddIcon/>}
                                        ml={2}
                                        onClick={handleAddIncludedItem} aria-label={""}/>
                                </Flex>
                                <VStack align="stretch" mt={2}>
                                    {includedItems.map((item, index) => (
                                        <Flex key={index} align="center" justify="space-between">
                                            <Text>{item}</Text>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => handleRemoveIncludedItem(index)}
                                            >
                                                Remove
                                            </Button>
                                        </Flex>
                                    ))}
                                </VStack>
                            </Box>

                            <Box flex="1">
                                <Text fontSize="sm" mb={1}>
                                    What to Bring
                                </Text>
                                <Flex>
                                    <Input
                                        placeholder="Add Item"
                                        value={newBringItem}
                                        onChange={(e) => setNewBringItem(e.target.value)}
                                    />
                                    <IconButton
                                        icon={<AddIcon/>}
                                        ml={2}
                                        onClick={handleAddBringItem} aria-label={""}/>
                                </Flex>
                                <VStack align="stretch" mt={2}>
                                    {bringItems.map((item, index) => (
                                        <Flex key={index} align="center" justify="space-between">
                                            <Text>{item}</Text>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => handleRemoveBringItem(index)}
                                            >
                                                Remove
                                            </Button>
                                        </Flex>
                                    ))}
                                </VStack>
                            </Box>
                        </HStack>

                        <Divider my={6}/>

                        <Box>
                            <Text fontSize="sm" mb={1}>
                                Cancellation Policy <InfoOutlineIcon ml={1} color="gray.500"/>
                            </Text>
                            <Textarea placeholder="Add cancellation policy..." resize="none"/>
                            <Flex align="center" mt={2}>
                                <Switch colorScheme="teal" mr={2}/>
                                <Text fontSize="sm">
                                    My cancellation policy offers refunds, store credits, and/or date
                                    changes
                                </Text>
                            </Flex>
                        </Box>
                        <Box>
                            <Text fontSize="sm" mb={1}>
                                Other Considerations <InfoOutlineIcon ml={1} color="gray.500"/>
                            </Text>
                            <Textarea placeholder="Add other considerations..." resize="none"/>
                            <Text fontSize="xs" color="gray.500">
                                0 characters | 0 words
                            </Text>
                        </Box>

                        <Box bg="blue.50" p={4} borderRadius="md" mt={4}>
                            <Flex align="center" mb={2}>
                                <Text fontSize="sm" flex="1">
                                    Email Footer <InfoOutlineIcon ml={1} color="gray.500"/>
                                </Text>
                            </Flex>
                            <Text fontSize="sm" color="gray.600" mb={2}>
                                This experience is using the global custom email footer. You can
                                configure a custom footer specific to this product by overriding the
                                global settings below.
                            </Text>
                            <Flex align="center">
                                <Switch
                                    colorScheme="teal"
                                    isChecked={overrideFooter}
                                    onChange={(e) => setOverrideFooter(e.target.checked)}
                                    mr={2}
                                />
                                <Text fontSize="sm">Override global email footer</Text>
                            </Flex>
                        </Box>
                    </VStack>
                </Box>

                <HStack justify="space-between" mt={8}>
                    <Button variant="outline" colorScheme="gray">
                        Cancel
                    </Button>
                    <Button colorScheme="blue">Next</Button>
                </HStack>
            </Box>
        </DashboardLayout>
    );
}
