import {Box, SimpleGrid, Spinner, Text} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import CardHome from "./CardHome";
import {api} from "../services/api";
import {useGuest} from "./GuestContext";

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

interface Addon {
    id: string;
    label: string;
    type: string;
    description: string;
    price: number;
}

export default function BodyCards() {
    const [cardData, setCardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {setTourId ,tenantId } = useGuest();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/tours/allBytenant/${tenantId}`);

                const mappedData: CardData[] = response.data.map((item): CardData => ({
                    id: item.id,
                    title: item.name,
                    description: item.description,
                    valuePrice: item.price,
                    originalPrice: `$${item.price.toFixed(2)}`,
                    discountedPrice: `$${(item.price * 0.8).toFixed(2)}`,
                    duration: (item.duration / 60).toFixed(0),
                    image: "https://anothersideoflosangelestours.com/wp-content/uploads/2024/01/IMG_4688-1.jpeg",
                    addons: item.addons.map((addon: Addon) => ({
                        id: addon.id,
                        label: addon.label,
                        type: addon.type,
                        description: addon.description,
                        price: addon.price,
                    })),
                }));

                setCardData(mappedData);
            } catch {
                setError("Error loading data.");


            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantId]);
    
    if (loading) {
        return <Spinner size="xl"/>;
    }

    if (error) {
        return <Text color="red.500">{error}</Text>;
    }

    return (
        <Box paddingBottom="80px">
            <SimpleGrid columns={[1, 2, 2]} spacing="40px" padding="20px">
                {cardData.map((data, index) => (
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
                        onSelect={() => setTourId(data.id.toString())}
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
            </Box>
        </Box>
    );
}
