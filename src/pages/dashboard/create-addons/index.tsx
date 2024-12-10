import {
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Switch,
    Textarea,
    Select,
    VStack,
    Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function AddonContentPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [products, setProducts] = useState("");
    const [image, setImage] = useState(null);
    const [selectionType, setSelectionType] = useState("Quantity");
    const [price, setPrice] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [isRequired, setIsRequired] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setImage(file);
        }
    };

    return (
        <DashboardLayout>
            <Box p={8} maxWidth="900px" mx="auto">
                <VStack spacing={6} align="stretch">
                    <Text fontSize="2xl" fontWeight="bold" mb={6}>
                        New Add-On
                    </Text>

                    <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Add-On Name"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter Add-On Description"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Products</FormLabel>
                        <Input
                            value={products}
                            onChange={(e) => setProducts(e.target.value)}
                            placeholder="Select Products"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Image</FormLabel>
                        <Button variant="outline" leftIcon={<AddIcon />} onClick={() => document.getElementById("fileInput")?.click()}>
                            Upload New Photo
                        </Button>
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/png, image/jpeg"
                            style={{ display: "none" }}
                            onChange={handleImageUpload}
                        />
                        {image && <Text mt={2}>{image.name}</Text>}
                        <Text fontSize="sm" color="gray.500">
                            Check that the image is in PNG or JPG format and does not exceed 5MB
                        </Text>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Selection Type</FormLabel>
                        <Select
                            value={selectionType}
                            onChange={(e) => setSelectionType(e.target.value)}
                        >
                            <option value="Quantity">Quantity</option>
                            <option value="Checkbox">Checkbox</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Price</FormLabel>
                        <HStack>
                            <Input
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="$"
                                width="auto"
                                type="number"
                            />
                        </HStack>
                    </FormControl>

                    <FormControl>
                        <HStack>
                            <Switch
                                isChecked={isPrivate}
                                onChange={() => setIsPrivate(!isPrivate)}
                            />
                            <Text>Private (Add-on is only available for back office purchases)</Text>
                        </HStack>
                    </FormControl>

                    <FormControl>
                        <HStack>
                            <Switch
                                isChecked={isRequired}
                                onChange={() => setIsRequired(!isRequired)}
                            />
                            <Text>Required (Add-on required during online checkout)</Text>
                        </HStack>
                    </FormControl>

                    <HStack justify="space-between" mt={6}>
                        <Button variant="outline" colorScheme="gray">
                            Cancel
                        </Button>
                        <Button colorScheme="blue">Save</Button>
                    </HStack>
                </VStack>
            </Box>
        </DashboardLayout>
    );
}
