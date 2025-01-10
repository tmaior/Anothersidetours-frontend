import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import PhotoUpload from "../../../components/PhotoUpload";
import DashboardLayout from "../../../components/DashboardLayout";
import {useEffect, useState} from "react";
import withAuth from "../../../utils/withAuth";
import {useRouter} from "next/router";
import axios from "axios";
import {useGuest} from "../../../components/GuestContext";

function GuideForm() {
    const router = useRouter();
    const {id} = router.query;
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
    });
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const {tenantId} = useGuest();

    useEffect(() => {
        if (id && id !== "new") {
            setIsEditing(true);
            const fetchGuide = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/guides/${id}`);
                    setFormData(response.data);
                } catch {
                    toast({
                        title: "Error",
                        description: "Failed to fetch guide data.",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            };
            fetchGuide();
        } else {
            setIsEditing(false);
        }
    }, [id, toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            toast({
                title: "Validation Error",
                description: "Name and email are required.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setLoading(true);
            if (isEditing) {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/guides/${id}`, formData);
                toast({
                    title: "Guide Updated",
                    description: "The guide was successfully updated.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/guides`, {
                    ...formData,
                    tenantId,
                });
                toast({
                    title: "Guide Created",
                    description: "The guide was successfully created.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
            router.push("/dashboard/guides");
        } catch {
            toast({
                title: "Error",
                description: "Failed to save guide.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push("/dashboard/guides");
    };

    return (
        <DashboardLayout>
            <Box p={8} maxW="800px" mx="auto">
                <Heading size="lg" mb={6}>
                    {isEditing ? "Edit Guide" : "New Guide"}
                </Heading>

                <Divider mb={8}/>

                <Box>
                    <Heading size="md" mb={6}>
                        Details
                    </Heading>

                    <FormControl isRequired mb={4}>
                        <FormLabel>Name</FormLabel>
                        <Input
                            placeholder="Guide name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl isRequired mb={4}>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            placeholder="Guide email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl mb={4}>
                        <FormLabel>Phone</FormLabel>
                        <Input
                            placeholder="Guide phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl mb={6}>
                        <FormLabel>Bio</FormLabel>
                        <Textarea
                            placeholder="Short bio of the guide"
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleChange}
                        />
                    </FormControl>
                </Box>

                <Box mb={8}>
                    <PhotoUpload/>
                </Box>
                <Divider marginBottom={"10px"}/>
                <Flex justifyContent="center" mt={8}>
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={handleSave} isLoading={loading}>
                            {isEditing ? "Update" : "Save"}
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    </HStack>
                </Flex>
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(GuideForm);