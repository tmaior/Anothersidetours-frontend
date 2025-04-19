import {Box, Button, Divider, Flex, Heading, useToast, VStack} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import GuideItem from "../../../components/GuideItem";
import withAuth from "../../../utils/withAuth";
import DashboardLayout from "../../../components/DashboardLayout";
import {useRouter} from "next/router";
import axios from "axios";
import {useGuest} from "../../../contexts/GuestContext";

interface Guide {
    id: string;
    name: string;
    email: string;
    status: string;
    phone?: string;
    imageUrl?: string;
    available: boolean;
}

function GuidesPage() {
    const router = useRouter();
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();
    const {tenantId} = useGuest();

    useEffect(() => {
        const fetchGuides = async () => {
            try {

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/guides`, {
                    withCredentials: true
                });
                setGuides(response.data);
            } catch (error) {
                console.error("Failed to load guides:", error);
                setError("Failed to load guides.");
                toast({
                    title: "Error",
                    description: "Failed to load guides.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchGuides();
    }, [toast, tenantId]);

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
                title: "Guide Deleted",
                description: "The guide has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Failed to delete guide:", error);
            toast({
                title: "Error",
                description: "Failed to delete the guide.",
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
            <Box p={8} w={"1000px"} maxW="100%" marginLeft={"100px"} marginTop={"-30px"}>
                <Flex justifyContent="space-between" alignItems="center" mb={3} w={"100%"}>
                    <Flex alignItems="center">
                        <Heading>Guide Management</Heading>
                        <Divider
                            orientation="vertical"
                            height="50px"
                            ml={4}
                            borderColor="gray.300"
                        />
                    </Flex>
                    <Button colorScheme="blue" onClick={handleAdd}>
                        + Add Guide
                    </Button>
                </Flex>
                <Divider borderColor="gray.300" w={"100%"} marginLeft={"5px"}/>
                <VStack spacing={4} mt={4}>
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
                                status={guide.status || "Active"}
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