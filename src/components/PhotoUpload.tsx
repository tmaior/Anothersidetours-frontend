import {
    Box,
    Button,
    Text,
    VStack,
    Image,
    Input,
    FormLabel,
    Icon,
    useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaImage } from "react-icons/fa";
import axios from "axios";

interface PhotoUploadProps {
    onImageUploaded?: (imageUrl: string) => void;
    onFileSelected?: (file: File) => void;
    imageUrl?: string;
}

export default function PhotoUpload({ onImageUploaded, onFileSelected, imageUrl }: PhotoUploadProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(imageUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const toast = useToast();

    const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            if (onFileSelected) {
                onFileSelected(file);
            }
        }
    };
    const uploadFile = async (file: File): Promise<string | null> => {
        if (!file) return null;
        
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            
            if (response.data && response.data.url) {
                if (onImageUploaded) {
                    onImageUploaded(response.data.url);
                }
                return response.data.url;
            }
            return null;
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({
                title: "Error sending image",
                description: "Unable to upload image to server.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return null;
        } finally {
            setIsUploading(false);
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
                        onChange={handleImageSelection}
                    />
                    <Button 
                        as="label" 
                        htmlFor="file-upload" 
                        colorScheme="blue"
                        isLoading={isUploading}
                        loadingText="Sending..."
                    >
                        Select Photo
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
