import {
    Box,
    Button,
    Text,
    VStack,
    Image,
    Input,
    FormLabel,
    Icon,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaImage } from "react-icons/fa";

export default function PhotoUpload() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box>
            <FormLabel fontWeight="bold">Photo</FormLabel>
            <Box
                p={6}
                bg="gray.50"
                borderWidth="1px"
                borderRadius="md"
                display="flex"
                alignItems="center"
            >
                <Box
                    boxSize="100px"
                    borderWidth="1px"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                    bg="white"
                    mr={6}
                >
                    {selectedImage ? (
                        <Image src={selectedImage} alt="Uploaded Photo" objectFit="cover" />
                    ) : (
                        <Icon as={FaImage} boxSize={8} color="gray.300" />
                    )}
                </Box>

                <VStack align="start">
                    <Input
                        type="file"
                        accept="image/png, image/jpeg"
                        hidden
                        id="file-upload"
                        onChange={handleImageUpload}
                    />
                    <Button as="label" htmlFor="file-upload" colorScheme="blue">
                        Upload New Photo
                    </Button>
                    <Text fontSize="sm" color="gray.500">
                        Check that the image is in <b>PNG</b> or <b>JPG</b> format and does
                        not exceed <b>5MB</b>
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
}
