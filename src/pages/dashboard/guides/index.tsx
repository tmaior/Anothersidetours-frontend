import {Box, Button, Divider, Flex, Heading, VStack} from "@chakra-ui/react";
import {useState} from "react";
import GuideItem from "../../../components/GuideItem";
import withAuth from "../../../utils/withAuth";

interface Guide {
    id: number;
    name: string;
    status: string;
    initials: string;
}

function GuidesPage() {
    const [guides, setGuides] = useState<Guide[]>([
        {id: 1, name: "AJ West", status: "Confirmed", initials: "AW"},
        {id: 2, name: "Ben Hussock", status: "Confirmed", initials: "BH"},
        {id: 3, name: "Jeff Mirkin", status: "Confirmed", initials: "JM"},
    ]);

    const handleEdit = (id: number) => {
        console.log("Edit", id);
    };

    const handleDelete = (id: number) => {
        setGuides(guides.filter((guide) => guide.id !== id));
    };

    return (
        <Box p={8}>
            <Flex marginLeft={"70px"} justifyContent="space-between" alignItems="center" mb={3} w={"1700px"}>
                <Flex alignItems="center">
                    <Heading>Guide Management</Heading>
                    <Divider
                        orientation="vertical"
                        height="50px"
                        ml={4}
                        borderColor="gray.300"
                    />
                </Flex>
                <Button colorScheme="blue">
                    + Add
                </Button>
            </Flex>
            <Divider borderColor="gray.300" w={"1700px"} marginLeft={"70px"}/>
            <VStack spacing={4} mt={4}>
                {guides.map((guide) => (
                    <GuideItem
                        key={guide.id}
                        name={guide.name}
                        status={guide.status}
                        onEdit={() => handleEdit(guide.id)}
                        onDelete={() => handleDelete(guide.id)}
                    />
                ))}
            </VStack>
        </Box>
    );
}

export default withAuth(GuidesPage);