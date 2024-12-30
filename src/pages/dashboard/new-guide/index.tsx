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


function GuideForm() {

    const [sidebarWidth, setSidebarWidth] = useState(250);
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
    });

    useEffect(() => {
        const handleResize = () => {
            const sidebar = document.getElementById("dashboard-sidebar");
            if (sidebar) {
                setSidebarWidth(sidebar.offsetWidth);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [loading, setLoading] = useState(false);
    const toast = useToast();

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
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/guides`, formData);
            toast({
                title: "Guide Created",
                description: "The guide was successfully created.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            router.push("/dashboard/guides");
        } catch {
            toast({
                title: "Error",
                description: "Failed to create guide.",
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
                    <Box as="span" fontWeight="medium" color="gray.500">
                        Guide Management
                    </Box>
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
                <Flex
                    as="footer"
                    position="fixed"
                    bottom="0"
                    bg="white"
                    py={4}
                    px={8}
                    boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
                    justifyContent="center"
                    borderTop="1px solid #E2E8F0"
                    left={`${sidebarWidth}px`}
                    width={`calc(100% - ${sidebarWidth}px)`}
                >
                    <HStack spacing={4}>
                        <Button colorScheme="blue"
                                onClick={handleSave}
                                isLoading={loading}
                        >Save</Button>
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    </HStack>
                </Flex>
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(GuideForm);