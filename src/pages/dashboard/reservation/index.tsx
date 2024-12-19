import {
    Box,
    Button, Center, Divider,
    Flex,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Spacer,
    Text,
    VStack,
} from "@chakra-ui/react";
import DashboardLayout from "../../../components/DashboardLayout";
import ReservationItem from "../../../components/ReservationItem";
import {SearchIcon} from "@chakra-ui/icons";

export default function Dashboard() {
    const reservations = [
        {
            date: "13 Dec",
            day: "Friday",
            availableSummary: "0 Available",
            reservedSummary: "7 Reserved",
            reservations: [
                {
                    time: "1:00 PM",
                    imageUrl: "/images/los-angeles-tour.png",
                    title: "The Los Angeles Tour",
                    available: "298 Available",
                    reservedDetails: 2 + " Reserved",
                    statusColor: "red.500",
                    capacity: "0/2",
                    guide: "Ben Huss...",
                    hasNotes: true,
                },
                {
                    time: "1:00 PM",
                    imageUrl: "/images/los-angeles-tour.png",
                    title: "The Los Angeles Tour",
                    available: "∞",
                    reservedDetails: 2 + " Reserved",
                    statusColor: "red.500",
                    capacity: "0/2",
                    guide: "Ben Huss...",
                    hasNotes: true,
                },
                {
                    time: "3:00 PM",
                    imageUrl: "/images/beverly-tour.png",
                    title: "The Beverly Hills Tour",
                    available: 150,
                    reservedDetails: 0 + " Reserved",
                    statusColor: "green.500",
                    capacity: "1/3",
                    guide: "Anna Smith",
                    hasNotes: false,
                },


            ]
        }
    ];

    return (
        <DashboardLayout>
            <Box p={4} marginTop={"-30px"}>
                <Flex align="center" mb={4}>
                    <Text fontSize="2xl" fontWeight="medium" >
                        Dashboard
                    </Text>
                    <Center height='50px' w={"40px"}>
                        <Divider orientation='vertical' />
                    </Center>
                    <HStack spacing={2}>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none" marginTop={"-3px"}>
                                <SearchIcon color="gray.400" />
                            </InputLeftElement>
                            <Input
                                marginLeft={"5px"}
                                placeholder="Name, email, phone or ID"
                                width="250px"
                                size="sm"
                                border="none"
                                boxShadow="none"
                                focusBorderColor="transparent"
                                w={"1250px"}
                                _placeholder={{ fontSize: "lg" }}
                            />
                        </InputGroup>
                        <Button colorScheme="green" size="sm">
                            Make a Purchase
                        </Button>
                    </HStack>
                    <Spacer/>
                </Flex>
                <Divider orientation='horizontal' width="100%"/>
                <HStack spacing={2} mb={4} align="center" marginTop={"10px"}>
                    <Input type="date" defaultValue="2024-12-13" size="sm" width="130px"/>

                    <Select placeholder="Reserved" size="sm" width="120px">
                        <option value="reserved">Reserved</option>
                        <option value="not_reserved">Not Reserved</option>
                    </Select>

                    <Select size="sm" width="90px" placeholder="List">
                        <option value="list">List</option>
                        <option value="grid">Grid</option>
                    </Select>

                    {/*<Select size="sm" width="120px" placeholder="Default View">*/}
                    {/*    <option value="default">Default</option>*/}
                    {/*    <option value="view2">View 2</option>*/}
                    {/*</Select>*/}

                    <Spacer/>
                    <Button variant="outline" size="sm">
                        Sync Calendar
                    </Button>
                </HStack>

                <HStack spacing={4} mb={4}>
                    <Text fontSize="sm" color="gray.600">
                        Filters:
                    </Text>
                    <Button variant="outline" size="sm">
                        Products: All
                    </Button>
                    <Button variant="outline" size="sm">
                        Equipment: All
                    </Button>
                    <Button variant="outline" size="sm">
                        Guides: All
                    </Button>
                </HStack>
                <VStack spacing={6} align="stretch">
                    {reservations.map((data, index) => (
                        <ReservationItem
                            key={index}
                            date={data.date}
                            day={data.day}
                            availableSummary={data.availableSummary}
                            reservedSummary={data.reservedSummary}
                            reservations={data.reservations}
                        />
                    ))}
                </VStack>
                <Box textAlign="center" mt={6}>
                    <Button variant="outline" size="sm">
                        Load More
                    </Button>
                </Box>
            </Box>
        </DashboardLayout>
    );
}
