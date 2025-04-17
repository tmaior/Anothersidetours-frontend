import {Box, Flex, Heading, Image, Text, VStack} from "@chakra-ui/react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function Home() {
    const tours = [
        // {
        //     id: 1,
        //     title: "Praia dos Sonhos",
        //     description: "Um lugar paradisíaco para relaxar e aproveitar o sol.",
        //     image: "https://via.placeholder.com/300x200?text=Praia+dos+Sonhos",
        // },
        // {
        //     id: 2,
        //     title: "Montanhas Encantadas",
        //     description: "Explore trilhas e paisagens de tirar o fôlego.",
        //     image: "https://via.placeholder.com/300x200?text=Montanhas+Encantadas",
        // },
        // {
        //     id: 3,
        //     title: "Cidade Histórica",
        //     description: "Descubra a rica história e cultura local.",
        //     image: "https://via.placeholder.com/300x200?text=Cidade+Histórica",
        // },
    ];

    return (
        <DashboardLayout>
            <VStack spacing={6} align="stretch" p={6}>
                <Heading color="teal.500">Welcome to Anotherside tours dashboard</Heading>
                {tours.map((tour) => (
                    <Flex
                        key={tour.id}
                        p={4}
                        bg="gray.700"
                        borderRadius="md"
                        boxShadow="md"
                        align="center"
                    >
                        <Image
                            src={tour.image}
                            alt={tour.title}
                            boxSize="150px"
                            borderRadius="md"
                            mr={4}
                        />
                        <Box>
                            <Heading fontSize="lg" color="white">
                                {tour.title}
                            </Heading>
                            <Text color="gray.300">{tour.description}</Text>
                        </Box>
                    </Flex>
                ))}
            </VStack>
        </DashboardLayout>
    );
}