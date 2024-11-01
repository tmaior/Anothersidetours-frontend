import { SimpleGrid, Button, Box, Spinner, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import CardHome from "./CardHome";
import {api} from "../services/api";

export default function BodyCards() {
    const [cardData, setCardData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/tours/allBytenant/a2464722-da26-4013-a824-0ba44ad8fd44`);

                const mappedData = response.data.map(item => ({
                    id: item.id,
                    title: item.name,
                    description: item.description,
                    originalPrice: `$${item.price.toFixed(2)}`,
                    discountedPrice: `$${(item.price * 0.8).toFixed(2)}`,
                    duration: (item.duration / 60).toFixed(0),
                    image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
                }));

                setCardData(mappedData);
            } catch (err) {
                setError("Erro ao carregar os dados.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = cardData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(cardData.length / itemsPerPage);

    const goToNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    if (loading) {
        return <Spinner size="xl" />;
    }

    if (error) {
        return <Text color="red.500">{error}</Text>;
    }

    return (
        <Box paddingBottom="80px">
            <SimpleGrid columns={[1, 2, 2]} spacing="40px" padding="20px">
                {currentItems.map((data, index) => (
                    <CardHome
                        key={data.id || index}
                        title={data.title}
                        description={data.description}
                        originalPrice={data.originalPrice}
                        discountedPrice={data.discountedPrice}
                        duration={`${data.duration}`}
                        image={data.image}
                    />
                ))}
            </SimpleGrid>

            <Box
                position="fixed"
                bottom="0"
                left="0"
                width="100%"
                bg="white"
                py="10px"
                borderTop="1px solid #e2e8f0"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Button onClick={goToPreviousPage} disabled={currentPage === 1} mr="4">
                    Anterior
                </Button>
                <Button onClick={goToNextPage} disabled={currentPage === totalPages}>
                    Próximo
                </Button>
            </Box>
        </Box>
    );
}
