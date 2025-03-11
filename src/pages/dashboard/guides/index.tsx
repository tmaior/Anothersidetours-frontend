import {Box, Button, Divider, Flex, Heading, useToast, VStack} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import GuideItem from "../../../components/GuideItem";
import withAuth from "../../../utils/withAuth";
import DashboardLayout from "../../../components/DashboardLayout";
import {useRouter} from "next/router";
import axios from "axios";
import {useGuest} from "../../../contexts/GuestContext";

interface Guide {
    id: number;
    name: string;
    status: string;
    initials: string;
    imageUrl?: string;
}

function GuidesPage() {
    const router = useRouter();
    const [guides, setGuides] = useState<Guide[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState<boolean>(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();
    const {tenantId} = useGuest();

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/guides/byTenant/${tenantId}`);
                setGuides(response.data);
            } catch {
                setError("Failed to load guides.");
            } finally {
                setLoading(false);
            }
        };
        if (tenantId) {
            fetchGuides();
        }
    }, [tenantId]);

    const handleEdit = (id: number) => {
        router.push(`/dashboard/new-guide/${id}`);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/guides/${id}`);
            setGuides(guides.filter((guide) => guide.id !== id));
            toast({
                title: "Guide Deleted",
                description: "The guide has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch {
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
                        + Add
                    </Button>
                </Flex>
                <Divider borderColor="gray.300" w={"100%"} marginLeft={"5px"}/>
                <VStack spacing={4} mt={4}>
                    {guides.map((guide) => (
                        <GuideItem
                            key={guide.id}
                            name={guide.name}
                            status={guide.status}
                            imageUrl={guide.imageUrl}
                            onEdit={() => handleEdit(guide.id)}
                            onDelete={() => handleDelete(guide.id)}
                        />
                    ))}
                </VStack>
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(GuidesPage);