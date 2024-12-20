import {
    Box,
    Button,
    Center,
    Divider,
    Flex,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spacer,
    Text,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import DashboardLayout from "../../../components/DashboardLayout";
import ReservationItem from "../../../components/ReservationItem";
import {SearchIcon} from "@chakra-ui/icons";
import {useEffect, useState} from "react";
import { useRouter } from "next/router";

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
                    id: "1",
                    email: "ben.huss@example.com",
                    phone: "123-456-7890",
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
                    id: "2",
                    email: "good.huss@example.com",
                    phone: "7890-123-456",
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
                    id: "3",
                    email: "Anna@example.com",
                    phone: "456-7890-123",
                },


            ]
        },
        {
            date: "23 Dec",
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
                    id: "1",
                    email: "ben.huss@example.com",
                    phone: "123-456-7890",
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
                    id: "2",
                    email: "good.huss@example.com",
                    phone: "7890-123-456",
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
                    id: "3",
                    email: "Anna@example.com",
                    phone: "456-7890-123",
                },


            ]
        },
        {
            date: "30 Dec",
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
                    id: "1",
                    email: "ben.huss@example.com",
                    phone: "123-456-7890",
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
                    id: "2",
                    email: "good.huss@example.com",
                    phone: "7890-123-456",
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
                    id: "3",
                    email: "Anna@example.com",
                    phone: "456-7890-123",
                },


            ]
        },
        {
            date: "06 Jan",
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
                    id: "1",
                    email: "ben.huss@example.com",
                    phone: "123-456-7890",
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
                    id: "2",
                    email: "good.huss@example.com",
                    phone: "7890-123-456",
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
                    id: "3",
                    email: "Anna@example.com",
                    phone: "456-7890-123",
                },


            ]
        },
        {
            date: "13 Jan",
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
                    id: "1",
                    email: "ben.huss@example.com",
                    phone: "123-456-7890",
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
                    id: "2",
                    email: "good.huss@example.com",
                    phone: "7890-123-456",
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
                    id: "3",
                    email: "Anna@example.com",
                    phone: "456-7890-123",
                },


            ]
        },
        {
            date: "20 Jan",
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
                    id: "1",
                    email: "ben.huss@example.com",
                    phone: "123-456-7890",
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
                    id: "2",
                    email: "good.huss@example.com",
                    phone: "7890-123-456",
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
                    id: "3",
                    email: "Anna@example.com",
                    phone: "456-7890-123",
                },


            ]
        },
        {
            date: "27 Jan",
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
                    id: "1",
                    email: "ben.huss@example.com",
                    phone: "123-456-7890",
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
                    id: "2",
                    email: "good.huss@example.com",
                    phone: "7890-123-456",
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
                    id: "abc-defg-hijklm",
                    email: "teste123@example.com",
                    phone: "951",
                },
            ]
        }

    ];

    const [searchTerm, setSearchTerm] = useState("");
    const [loadedDates, setLoadedDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [activeNote, setActiveNote] = useState(null);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const router = useRouter();

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openNoteModal = (note) => {
        setActiveNote(note);
        onOpen();
    };

    const handlePurchaseClick = () => {
        router.push("/dashboard/list-tours");
    };

    const filterReservations = (reservations) => {
        if (!searchTerm) return reservations;

        return reservations.filter((reservation) => {
            const {guide, email, phone, id} = reservation;
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            return (
                (guide && guide.toLowerCase().includes(lowercasedSearchTerm)) ||
                (email && email.toLowerCase().includes(lowercasedSearchTerm)) ||
                (phone && phone.toLowerCase().includes(lowercasedSearchTerm)) ||
                (id && id.toLowerCase().includes(lowercasedSearchTerm))
            );
        });
    };

    const getNextDateWithReservations = () => {
        const today = new Date();
        const todayISO = today.toISOString().split("T")[0];

        for (const reservation of reservations) {
            const reservationDate = new Date(`${reservation.date} ${new Date().getFullYear()}`).toISOString().split("T")[0];
            if (!loadedDates.includes(reservationDate)) {
                return reservationDate;
            }
        }
        return null;
    };

    useEffect(() => {
        const initialDate = getNextDateWithReservations();
        if (initialDate) {
            setSelectedDate(initialDate);
            setLoadedDates([initialDate]);
        }
    }, []);

    const handleLoadMore = () => {
        const nextDate = getNextDateWithReservations();
        if (nextDate) {
            setLoadedDates((prev) => [...prev, nextDate]);
        }
    };

    return (
        <DashboardLayout>
            <Box p={4} marginTop={"-30px"}>
                <Flex align="center" mb={4}>
                    <Text fontSize="2xl" fontWeight="medium">
                        Dashboard
                    </Text>
                    <Center height='50px' w={"40px"}>
                        <Divider orientation='vertical'/>
                    </Center>
                    <HStack spacing={2}>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none" marginTop={"-3px"}>
                                <SearchIcon color="gray.400"/>
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
                                _placeholder={{fontSize: "lg"}}
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </InputGroup>
                        <Button colorScheme="green" size="md" marginLeft={"-50px"} h={"40px"} w={"200px"}
                                border={"none"}
                                borderRadius={"4px"}
                                onClick={handlePurchaseClick}
                        >
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
                    {reservations
                        .filter((data) => loadedDates.includes(new Date(`${data.date} ${new Date().getFullYear()}`).toISOString().split("T")[0]))
                        .map((data) => ({
                            ...data,
                            reservations: filterReservations(data.reservations),
                        }))
                        .map((data, index) => (
                            <ReservationItem
                                key={index}
                                date={data.date}
                                day={data.day}
                                availableSummary={data.availableSummary}
                                reservedSummary={data.reservedSummary}
                                reservations={data.reservations}
                                onNoteClick={openNoteModal}
                            />
                        ))}
                </VStack>
                <Box textAlign="center" mt={6}>
                    <Button variant="outline" size="sm" onClick={handleLoadMore}>
                        Load More
                    </Button>
                </Box>
            </Box>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Notes</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        {activeNote ? (
                            <>
                                <Text fontWeight="bold">{activeNote.title}</Text>
                                <Text>{activeNote.notes}</Text>
                            </>
                        ) : (
                            <Text>No notes available</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </DashboardLayout>
    );
}
