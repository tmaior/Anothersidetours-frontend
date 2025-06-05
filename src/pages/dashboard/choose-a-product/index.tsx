import {useEffect, useState} from 'react';
import {
    Box,
    Divider,
    Flex,
    Heading,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Spinner,
    Text,
    useBreakpointValue,
} from '@chakra-ui/react';
import DashboardLayout from '../../../components/DashboardLayout';
import {SearchIcon} from '@chakra-ui/icons';
import {useGuest} from '../../../contexts/GuestContext';
import {useCart} from '../../../contexts/CartContext';
import withAuth from "../../../utils/withAuth";
import {useRouter} from 'next/router';

function ToursPage() {
    const {tenantId} = useGuest();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const {addToCart, setNavigationSource, resetCart} = useCart();
    const router = useRouter();
    const [tourPricing, setTourPricing] = useState({});
    const isMobile = useBreakpointValue({ base: true, md: false });

    const handleNavigateToProduct = (tour) => {
        resetCart();
        addToCart(tour);
        router.push(`/dashboard/make-a-purchase/${tour.id}`);
        setNavigationSource('choose-a-product');
    };

    useEffect(() => {
        const {source} = router.query;
        if (source) {
            setNavigationSource(source as string);
        }
    }, [router.query, setNavigationSource]);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/allBytenant/${tenantId}`,{
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                setTours(data);
                const pricingData = {};
                for (const tour of data) {
                    try {
                        const pricingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${tour.id}`,{
                            method: "GET",
                            credentials: "include",
                        });
                        if (pricingRes.ok) {
                            const pricingInfo = await pricingRes.json();
                            if (pricingInfo && pricingInfo.length > 0) {
                                pricingData[tour.id] = pricingInfo[0];
                            }
                        }
                    } catch (error) {
                        console.error(`Failed to fetch pricing for tour ${tour.id}:`, error);
                    }
                }
                setTourPricing(pricingData);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch tours:', error);
                setLoading(false);
            }
        };

        if (tenantId) {
            fetchTours();
        }
    }, [tenantId]);

    const filteredTours = tours.filter((tour) => {
        const normalizedTourName = tour.name.toLowerCase().trim();
        const normalizedSearch = searchTerm.toLowerCase().trim();
        return normalizedTourName.includes(normalizedSearch) && tour.isDeleted === false;
    });

    const getTourPrice = (tour) => {
        if (tourPricing[tour.id]) {
            return tourPricing[tour.id].basePrice;
        }
        return tour.price;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box p={8} textAlign="center">
                    <Spinner size="xl"/>
                    <Text mt={4}>Loading tours...</Text>
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box maxW="1500px" mx="auto" py={8} px={4}>
                <Flex 
                    direction={isMobile ? "column" : "row"} 
                    align={isMobile ? "center" : "flex-start"}
                    justifyContent="space-between"
                    marginTop="10px"
                    pt={4}
                    mb={6}
                >
                    <Heading 
                        as="h1" 
                        mb={isMobile ? 4 : 0}
                        w={isMobile ? "100%" : "auto"}
                        textAlign={isMobile ? "center" : "left"}
                        display="flex"
                        alignItems="center"
                    >
                        Make a Purchase
                    </Heading>
                    <InputGroup w={isMobile ? "100%" : "500px"}>
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400"/>
                        </InputLeftElement>
                        <Input
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Flex>
                <Divider/>
                <Text fontSize={"lg"} fontWeight={"bold"}>
                    Products
                </Text>

                <SimpleGrid columns={[1, 2, 3]} spacing={6} marginTop={"30px"}>
                    {filteredTours.map((tour) => (
                        <Box
                            key={tour.id}
                            borderWidth="1px"
                            borderRadius="md"
                            overflow="hidden"
                            p={4}
                            _hover={{boxShadow: 'md', cursor: 'pointer'}}
                            onClick={() => handleNavigateToProduct(tour)}
                        >
                            <Flex align="center">
                                <Image
                                    src={tour.imageUrl}
                                    alt={tour.name}
                                    boxSize="70px"
                                    objectFit="cover"
                                    borderRadius="md"
                                />
                                <Box ml={4}>
                                    <Heading as="h2" size="sm" mb={1}>
                                        {tour.name}
                                    </Heading>
                                    <Text color="gray.600">
                                        {`$${getTourPrice(tour)}`}
                                    </Text>
                                </Box>
                            </Flex>
                        </Box>
                    ))}
                </SimpleGrid>

                {filteredTours.length === 0 && searchTerm && (
                    <Text mt={4} textAlign="center">
                        No Products found.
                    </Text>
                )}
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(ToursPage); 