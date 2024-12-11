import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Image,
    Input,
    Switch,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import React, {useEffect, useState} from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import ProgressBar from "../../../components/ProgressBar";
import {useRouter} from "next/router";
import {useGuest} from "../../../components/GuestContext";

interface TourFormProps {
    isEditing?: boolean;
    tourId?: string | string[];
    initialData?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DescriptionContentPage({isEditing, tourId, initialData}: TourFormProps) {
    const [newIncludedItem, setNewIncludedItem] = useState("");
    const [newBringItem, setNewBringItem] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [overrideFooter, setOverrideFooter] = useState(false);
    const [sopNotes, setSopNotes] = useState("");
    const [meetingLocation, setMeetingLocation] = useState("");
    const [mapEnabled, setMapEnabled] = useState(false);
    const {
        title,
        setTitle,
        description,
        setDescription,
        includedItems,
        setIncludedItems,
        bringItems,
        setBringItems,
        setOperationProcedures,
        operationProcedures,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        imageFile,
        setImageFile,
        imagePreview,
        setImagePreview,
    } = useGuest();

    const router = useRouter();

    useEffect(() => {
        const savedData = localStorage.getItem("descriptionContentData");
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setIncludedItems(parsed.includedItems || []);
            setBringItems(parsed.bringItems || []);
            setNewIncludedItem(parsed.newIncludedItem || "");
            setNewBringItem(parsed.newBringItem || "");
            setImagePreview(parsed.imagePreview || null);
            setTitle(parsed.title || "");
            setDescription(parsed.description || "");
            setSopNotes(parsed.sopNotes || "");
            setMeetingLocation(parsed.meetingLocation || "");
            setMapEnabled(parsed.mapEnabled || false);
        }
    }, []);

    useEffect(() => {
        const data = {
            includedItems,
            bringItems,
            newIncludedItem,
            newBringItem,
            imagePreview,
            title,
            description,
            sopNotes,
            meetingLocation,
            mapEnabled,
            operationProcedures
        };
        localStorage.setItem("descriptionContentData", JSON.stringify(data));
    }, [
        includedItems,
        bringItems,
        newIncludedItem,
        newBringItem,
        imagePreview,
        title,
        description,
        sopNotes,
        meetingLocation,
        mapEnabled,
    ]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

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

    const handleRemoveIncludedItem = (index: number) => {
        setIncludedItems(includedItems.filter((_, i) => i !== index));
    };

    const handleRemoveBringItem = (index: number) => {
        setBringItems(bringItems.filter((_, i) => i !== index));
    };

    return (
        <DashboardLayout>
            <Box p={8} maxWidth="900px" mx="auto">
                <ProgressBar steps={["Description", "Schedules"]} currentStep={0}/>
                <Heading mb={6}>Description Content</Heading>

                <Box mb={8}>
                    <Text fontSize="lg" fontWeight="bold">
                        Experience Description
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                        Important details that will be presented to your customer throughout the
                        booking process
                    </Text>

                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text fontSize="sm" mb={1}>
                                Title is required <Text as="span" color="red">*</Text>
                            </Text>
                            <Input
                                placeholder="Enter Title"
                                isRequired
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Box>
                        <Box>
                            <Text fontSize="sm" mb={1}>
                                Description is required <Text as="span" color="red">*</Text>
                            </Text>
                            <Textarea
                                placeholder="Write a detailed description..."
                                resize="none"
                                isRequired
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <Text fontSize="xs" color="gray.500">
                                0 characters | 0 words
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="sm" mb={1}>
                                Standard operating procedure (SOP) note. <Text as="span" color="red">*</Text>
                            </Text>
                            <Textarea
                                placeholder="Write the Standard operating procedure"
                                resize="none"
                                isRequired
                                value={operationProcedures}
                                onChange={(e) => setOperationProcedures(e.target.value)}
                            />
                            <Text fontSize="xs" color="gray.500">
                                0 characters | 0 words
                            </Text>
                        </Box>
                        <FormControl mb={4}>
                            <FormLabel>Photos</FormLabel>
                            <Text fontSize="sm" color="gray.600" mb={2}>
                                You can add a images to each product with a maximum size of 5 MB. Suggested pixel
                                dimensions 1024×768
                            </Text>
                            <HStack spacing={4} align="center">
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        boxSize="150px"
                                        objectFit="cover"
                                        borderRadius="md"
                                    />
                                ) : (
                                    <Box
                                        border="2px dashed"
                                        borderColor="gray.300"
                                        p={4}
                                        borderRadius="md"
                                        width="150px"
                                        textAlign="center"
                                    >
                                        <Text>The Image</Text>
                                    </Box>
                                )}
                                <Input
                                    type="file"
                                    accept="image/jpeg, image/png"
                                    onChange={handleImageChange}
                                    display="none"
                                    id="image-upload"
                                />
                                <VStack>
                                    <Button
                                        variant="outline"
                                        colorScheme="blue"
                                        onClick={() => document.getElementById("image-upload")?.click()}
                                    >
                                        Upload Image
                                    </Button>
                                    {imagePreview && (
                                        <Button
                                            variant="outline"
                                            colorScheme="red"
                                            onClick={handleRemoveImage}
                                        >
                                            Remove Image
                                        </Button>
                                    )}
                                </VStack>
                            </HStack>
                            <Divider my={6}/>

                            <Flex align="center">
                                <Text fontSize="sm" mb={1} flex="1">
                                    Meeting Location is required
                                </Text>
                                <Switch colorScheme="teal"/>
                                <Button ml={2}>Enable Map</Button>
                            </Flex>
                            <Input marginTop={"10px"} placeholder="Enter meeting location"/>

                            <Divider my={6}/>
                        </FormControl>
                        {/*<Divider my={6} />*/}
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
                        {/*<Box>*/}
                        {/*    <Text fontSize="sm" mb={1}>*/}
                        {/*        Cancellation Policy <InfoOutlineIcon ml={1} color="gray.500" />*/}
                        {/*    </Text>*/}
                        {/*    <Textarea placeholder="Add cancellation policy..." resize="none" />*/}
                        {/*    <Flex align="center" mt={2}>*/}
                        {/*        <Switch colorScheme="teal" mr={2} />*/}
                        {/*        <Text fontSize="sm">*/}
                        {/*            My cancellation policy offers refunds, store credits, and/or date*/}
                        {/*            changes*/}
                        {/*        </Text>*/}
                        {/*    </Flex>*/}
                        {/*</Box>*/}
                        {/*<Box>*/}
                        {/*    <Text fontSize="sm" mb={1}>*/}
                        {/*        Other Considerations <InfoOutlineIcon ml={1} color="gray.500" />*/}
                        {/*    </Text>*/}
                        {/*    <Textarea placeholder="Add other considerations..." resize="none" />*/}
                        {/*    <Text fontSize="xs" color="gray.500">*/}
                        {/*        0 characters | 0 words*/}
                        {/*    </Text>*/}
                        {/*</Box>*/}
                    </VStack>
                </Box>
                <HStack justify="space-between" mt={8}>
                    <Button
                        variant="outline"
                        colorScheme="gray"
                        onClick={() => {
                            setIncludedItems([]);
                            setBringItems([]);
                            setNewIncludedItem("");
                            setNewBringItem("");
                            setTitle("");
                            setDescription("");
                            setOperationProcedures("");
                            setMeetingLocation("");
                            setMapEnabled(false);
                            localStorage.removeItem("descriptionContentData");
                            router.push("/");
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={() => router.push("/dashboard/schedules-availability")}
                    >
                        Next
                    </Button>
                </HStack>
            </Box>
        </DashboardLayout>
    );
}
