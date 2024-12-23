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
import {useRouter} from "next/router";
import ReservationDetail from "../reservation-details";
import {useGuest} from "../../../components/GuestContext";

export default function Dashboard() {

    const [searchTerm, setSearchTerm] = useState("");
    const [loadedDates, setLoadedDates] = useState([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedDate, setSelectedDate] = useState("");
    const [activeNote, setActiveNote] = useState(null);
    const {tenantId} = useGuest();
    const [reservations, setReservations] = useState([]);

    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [userDetails, setUserDetails] = useState({});

    const {isOpen, onOpen, onClose} = useDisclosure();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            if (!tenantId) return;
            setIsLoading(true);

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/byTenantId/${tenantId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch reservations");
                }

                const data = await response.json();

                const reservationsWithUserDetails = await Promise.all(
                    data.map(async (reservation) => {
                        if (reservation.user_id) {
                            if (!userDetails[reservation.user_id]) {
                                const userResponse = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/users/${reservation.user_id}`
                                );
                                if (userResponse.ok) {
                                    const userData = await userResponse.json();
                                    return {...reservation, user: userData};
                                }
                            } else {
                                return {...reservation, user: userDetails[reservation.user_id]};
                            }
                        }
                        return reservation;
                    })
                );

                reservationsWithUserDetails.sort((a, b) => {
                    return new Date(a.reservation_date).getTime() - new Date(b.reservation_date).getTime();
                });

                interface ReservationItem {
                    guestQuantity: number;
                    time: string;
                    dateFormatted: string;
                    title: string;
                    available: string;
                    reservedDetails: string;
                    statusColor: string;
                    capacity: string;
                    guide: string;
                    hasNotes: boolean;
                    id: string;
                    email: string;
                    phone: string;
                    imageUrl: string;
                    user?: {
                        name: string;
                        phone: string;
                        email: string;
                    };
                }

                interface Reservation {
                    date: string;
                    day: string;
                    availableSummary: string;
                    reservedSummary: string;
                    reservations: ReservationItem[];
                }

                const groupedReservations: Record<string, Reservation> = reservationsWithUserDetails.reduce((acc, reservation) => {
                    const date = new Date(reservation.reservation_date).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    });

                    if (!acc[date]) {
                        acc[date] = {
                            date: date,
                            day: new Date(reservation.reservation_date).toLocaleDateString("en-US", {weekday: 'long'}),
                            availableSummary: "∞ Available",
                            reservedSummary: `${reservation.guestQuantity} Reserved`,
                            reservations: [],
                        };
                    }

                    acc[date].reservations.push({
                        guestQuantity: reservation.guestQuantity,
                        time: new Date(reservation.reservation_date).toLocaleTimeString("en-US", {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        dateFormatted: new Date(reservation.reservation_date).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }),
                        title: reservation.tour.name,
                        available: "∞",
                        reservedDetails: `${reservation.guestQuantity} Reserved`,
                        statusColor: reservation.status === "PENDING" ? "red.500" : "green.500",
                        capacity: `${reservation.guestQuantity}/∞`,
                        guide: reservation.tour.StandardOperation || "No Guide",
                        hasNotes: reservation.notes.length > 0,
                        id: reservation.id,
                        email: reservation.tour.name + "@example.com",
                        phone: "N/A",
                        imageUrl: reservation.tour.imageUrl || "/images/default-tour.png",
                        user: reservation.user
                    });

                    return acc;
                }, {});

                const transformedReservations = Object.values(groupedReservations);

                setReservations(transformedReservations);

                if (transformedReservations.length > 0) {
                    const firstAvailableDate = new Date(transformedReservations[0].date);
                    const formattedDate = firstAvailableDate.toISOString().split('T')[0];
                    setSelectedDate(formattedDate);
                    setLoadedDates([formattedDate]);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReservations();
    }, [tenantId]);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openNoteModal = (note) => {
        setActiveNote(note);
        onOpen();
    };

    const handlePurchaseClick = () => {
        router.push("/dashboard/choose-a-product");
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const handleSelectReservation = (reserva) => {
        setSelectedReservation(reserva);
        setIsDetailVisible(true);
    };

    const handleCloseDetail = () => {
        setIsDetailVisible(false);
        setSelectedReservation(null);
    };

    return (
        <DashboardLayout>
            <Flex align="center" mb={4}>
                <Text fontSize="2xl" fontWeight="medium" marginLeft={"-15px"}>
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
                    <Button
                        colorScheme="green"
                        size="md"
                        marginLeft={"-50px"}
                        h={"40px"}
                        w={"200px"}
                        border={"none"}
                        borderRadius={"4px"}
                        onClick={handlePurchaseClick}
                    >
                        Make a Purchase
                    </Button>
                </HStack>
                <Spacer/>
            </Flex>
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
            <HStack spacing={2} mb={4} align="center" marginTop={"10px"}>
                <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    size="sm"
                    width="130px"
                />
                <Select placeholder="Reserved" size="sm" width="120px">
                    <option value="reserved">Reserved</option>
                    <option value="not_reserved">Not Reserved</option>
                </Select>
                <Select size="sm" width="90px" placeholder="List">
                    <option value="list">List</option>
                    <option value="grid">Grid</option>
                </Select>
                <Spacer/>
                <Button variant="outline" size="sm">
                    Sync Calendar
                </Button>
            </HStack>
            <Flex height="calc(100vh - 80px)">
                <Box
                    w={isDetailVisible ? "15%" : "100%"}
                    overflowY="auto"
                    overflowX="hidden"
                    borderRight={isDetailVisible ? "1px solid #e2e8f0" : "none"}
                    transition="width 0.3s ease"
                    display="flex"
                    flexDirection="column"
                >
                    <Box p={4} marginTop={"-30px"}>

                        <Divider orientation='horizontal' width="100%"/>
                        <VStack spacing={6} align="stretch" marginTop={"10px"}>
                            {reservations.map((data, index) => (
                                <ReservationItem
                                    key={index}
                                    date={data.date}
                                    day={data.day}
                                    availableSummary={data.availableSummary}
                                    reservedSummary={data.reservedSummary}
                                    reservations={filterReservations(data.reservations)}
                                    onNoteClick={openNoteModal}
                                    onSelectReservation={handleSelectReservation}
                                    isCompactView={isDetailVisible}
                                />
                            ))}
                        </VStack>
                        <Box textAlign="center" mt={6}>
                            <Button variant="outline" size="sm" onClick={handleLoadMore}>
                                Load More
                            </Button>
                        </Box>
                    </Box>
                </Box>
                {isDetailVisible && (
                    <Box w="70%" overflowY="auto" transition="width 0.3s ease">
                        <ReservationDetail
                            reservation={selectedReservation}
                            onCloseDetail={handleCloseDetail}
                        />
                    </Box>
                )}
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose} size="3xl">
                <ModalOverlay/>
                <ModalContent h={"600px"}>
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
