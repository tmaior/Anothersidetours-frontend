import React, { useEffect, useState } from 'react';
import {
    Box,
    Tabs,
    TabList,
    TabPanels,
    TabPanel,
    Tab,
    Radio,
    RadioGroup,
    Stack,
    Input,
    InputGroup,
    InputLeftElement,
    Text,
    Image,
    HStack,
    IconButton,
    useClipboard,
    useToast,
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon, CopyIcon } from '@chakra-ui/icons';
import { useGuest } from '../contexts/GuestContext';

interface Tour {
    id: string;
    name: string;
    imageUrl: string;
    description?: string;
}

export default function ButtonCodeSettings() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkoutType, setCheckoutType] = useState('single');
    const { tenantId } = useGuest();
    const toast = useToast();
    const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const { onCopy } = useClipboard(selectedTourId ? `${baseUrl}/bookingdetails/${selectedTourId}` : '');

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/allBytenant/${tenantId}`);
                if (!response.ok) throw new Error('Failed to fetch tours');
                const data = await response.json();
                const activeTours = data.filter(tour => !tour.isDeleted);
                setTours(activeTours);
                setFilteredTours(activeTours);
            } catch (error) {
                console.error('Error fetching tours:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load tours',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        };

        if (tenantId) {
            fetchTours();
        }
    }, [tenantId, toast]);

    useEffect(() => {
        const filtered = tours.filter(tour =>
            tour.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTours(filtered);
    }, [searchTerm, tours]);

    const handleCopyUrl = (tourId: string) => {
        setSelectedTourId(tourId);
        onCopy();
        toast({
            title: 'URL copied',
            description: 'Booking details URL has been copied to clipboard',
            status: 'success',
            duration: 2000,
            isClosable: true,
        });
    };

    const handleViewDetails = (tourId: string) => {
        window.open(`${baseUrl}/bookingdetails/${tourId}`, '_blank');
    };

    return (
        <Box p={6} width="100%">
            <Tabs>
                <TabList>
                    <Tab 
                        color="blue.500" 
                        _selected={{ color: 'blue.500', borderBottom: '2px solid' }}
                    >
                        Single Item Checkout
                    </Tab>
                    <Tab>Multiple Item Checkout</Tab>
                    <Tab>Timeline</Tab>
                    <Tab>Gifts</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <RadioGroup onChange={setCheckoutType} value={checkoutType} mb={6}>
                            <Stack direction="row" spacing={5}>
                                <Radio 
                                    value="single" 
                                    isChecked={checkoutType === 'single'}
                                >
                                    One button per product
                                </Radio>
                                <Radio 
                                    value="multiple"
                                    isChecked={checkoutType === 'multiple'}
                                >
                                    One button for all products
                                </Radio>
                            </Stack>
                        </RadioGroup>

                        <InputGroup mb={6}>
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.300" />
                            </InputLeftElement>
                            <Input
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>

                        <Stack spacing={4}>
                            {filteredTours.map((tour) => (
                                <Box
                                    key={tour.id}
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    borderColor="gray.200"
                                >
                                    <HStack spacing={4}>
                                        <Image
                                            src={tour.imageUrl || 'https://via.placeholder.com/60'}
                                            alt={tour.name}
                                            boxSize="60px"
                                            objectFit="cover"
                                            borderRadius="md"
                                        />
                                        <Text flex="1" fontWeight="medium">
                                            {tour.name}
                                        </Text>
                                        <Box
                                            flex="1"
                                            color="gray.500"
                                            fontSize="sm"
                                            fontFamily="monospace"
                                            noOfLines={1}
                                        >
                                            {`${baseUrl}/bookingdetails/${tour.id}`}
                                        </Box>
                                        <HStack>
                                            <IconButton
                                                aria-label="View booking details"
                                                icon={<ViewIcon />}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewDetails(tour.id)}
                                            />
                                            <IconButton
                                                aria-label="Copy booking URL"
                                                icon={<CopyIcon />}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyUrl(tour.id)}
                                            />
                                        </HStack>
                                    </HStack>
                                </Box>
                            ))}
                        </Stack>
                    </TabPanel>
                    <TabPanel>
                        <Text>Multiple Item Checkout content</Text>
                    </TabPanel>
                    <TabPanel>
                        <Text>Timeline content</Text>
                    </TabPanel>
                    <TabPanel>
                        <Text>Gifts content</Text>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
} 