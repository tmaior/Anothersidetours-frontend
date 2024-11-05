import { SimpleGrid, Button, Box, Spinner, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import CardHome from "./CardHome";
import {api} from "../services/api";

interface CardData {
    id: number;
    title: string;
    description: string;
    valuePrice: number;
    originalPrice: string;
    discountedPrice: string;
    duration: string;
    image: string;
    addons: [];
}

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
                const response = await api.get(`/tours/allBytenant/61cc17e9-7e9a-4461-84cf-4c85e9da5c4a`);

                const mappedData: CardData[] = response.data.map((item): CardData => ({
                    id: item.id,
                    title: item.name,
                    description: item.description,
                    valuePrice: item.price,
                    originalPrice: `$${item.price.toFixed(2)}`,
                    discountedPrice: `$${(item.price * 0.8).toFixed(2)}`,
                    duration: (item.duration / 60).toFixed(0),
                    image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
                    addons: item.addons.map((addon: any) => ({
                        id: addon.id,
                        label: addon.label,
                        type: addon.type,
                        description: addon.description
                    }))
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
                        valuePrice={data.valuePrice}
                        addons={data.addons}
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
