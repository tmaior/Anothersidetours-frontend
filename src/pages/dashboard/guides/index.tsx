import {Box, Button, Divider, Flex, Heading, useToast, VStack} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import GuideItem from "../../../components/GuideItem";
import withAuth from "../../../utils/withAuth";
import DashboardLayout from "../../../components/DashboardLayout";
import {useRouter} from "next/router";
import axios from "axios";

interface Guide {
    id: string;
    name: string;
    email: string;
    status: string;
    phone?: string;
    imageUrl?: string;
    available: boolean;
    isActive?: boolean;
}

function GuidesPage() {
    const router = useRouter();
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/guides`, {
                    withCredentials: true
                });
                const guidesData = response.data.map(guide => ({
                    id: guide.id,
                    name: guide.name,
                    email: guide.email,
                    status: guide.status || "Active",
                    phone: guide.phone || "",
                    imageUrl: guide.imageUrl || "",
                    available: guide.isActive !== false
                }));
                setGuides(guidesData);
            } catch (error) {
                console.error("Failed to load guides:", error);
                setError("Failed to load guides.");
                toast({
                    title: "Error",
                    description: "Failed to load guides: " + (error.response?.data?.message || error.message),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchGuides();
    }, [toast]);

    const handleEdit = (id: string) => {
        router.push(`/dashboard/new-guide/${id}`);
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/guides/${id}`, {
                withCredentials: true
            });
            
            setGuides(guides.filter((guide) => guide.id !== id));
            
            toast({
                title: "Guide Removed",
                description: "The guide role was successfully removed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Failed to remove guide:", error);
            toast({
                title: "Error",
                description: "Failed to remove the guide: " + (error.response?.data?.message || error.message),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleAdd = () => {
        router.push("/dashboard/new-guide/new");
    };

    return (
        <DashboardLayout>
            <Box 
                p={{ base: 4, md: 6, lg: 8 }} 
                w="100%" 
                maxW={{ base: "100%", lg: "1000px" }}
                mx="auto"
                mt={{ base: 0, md: "-20px", lg: "-30px" }}
            >
                <Flex 
                    direction={{ base: "column", sm: "row" }}
                    justifyContent="space-between" 
                    alignItems={{ base: "flex-start", sm: "center" }} 
                    mb={{ base: 4, md: 3 }} 
                    w="100%"
                    gap={{ base: 3, sm: 0 }}
                >
                    <Flex 
                        alignItems="center"
                        mb={{ base: 2, sm: 0 }}
                        w={{ base: "100%", sm: "auto" }}
                    >
                        <Heading size={{ base: "lg", md: "xl" }}>Guide Management</Heading>
                        <Divider
                            orientation="vertical"
                            height="50px"
                            ml={4}
                            borderColor="gray.300"
                            display={{ base: "none", sm: "block" }}
                        />
                    </Flex>
                    <Button 
                        colorScheme="blue" 
                        onClick={handleAdd}
                        w={{ base: "100%", sm: "auto" }}
                    >
                        + Add Guide
                    </Button>
                </Flex>
                <Divider borderColor="gray.300" w="100%" />
                <VStack spacing={4} mt={4} align="stretch">
                    {loading ? (
                        <Box>Loading guides...</Box>
                    ) : guides.length === 0 ? (
                        <Box>No guides found.</Box>
                    ) : (
                        guides.map((guide) => (
                            <GuideItem
                                key={guide.id}
                                id={guide.id}
                                name={guide.name}
                                email={guide.email}
                                status={guide.status}
                                imageUrl={guide.imageUrl}
                                onEdit={() => handleEdit(guide.id)}
                                onDelete={() => handleDelete(guide.id)}
                            />
                        ))
                    )}
                </VStack>
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(GuidesPage);