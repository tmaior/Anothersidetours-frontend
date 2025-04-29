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
    Select,
    Spacer,
    Stack,
    Text,
    VStack,
    useBreakpointValue,
    IconButton,
    Collapse,
} from "@chakra-ui/react";
import DashboardLayout from "../../../components/DashboardLayout";
import ReservationItem from "../../../components/ReservationItem";
import {SearchIcon} from "@chakra-ui/icons";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import ReservationDetail from "../reservation-details";
import {useGuest} from "../../../contexts/GuestContext";
import withPermission from "../../../utils/withPermission";
import NotesFromReservationModalicon from "../../../components/NotesFromReservationModalicon";
import CustomDatePicker from "../../../components/DatePickerDefault";
import axios from "axios";
import { IoMdFunnel } from "react-icons/io";

function Dashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [loadedDates, setLoadedDates] = useState([]);
    const {tenantId} = useGuest();
    const [reservations, setReservations] = useState([]);

    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [userPermissions, setUserPermissions] = useState([]);
    const [userRoles, setUserRoles] = useState([]);
    const [userId, setUserId] = useState("");
    const [hasManageReservationPermission, setHasManageReservationPermission] = useState(false);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);

    const isMobile = useBreakpointValue({ base: true, md: false });

    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [isNotesOpen, setNotesOpen] = useState(false);
    const [notesReservationList, setNotesReservationList] = useState([]);

    const filteredReservations = reservations.filter((reservation) =>
        loadedDates.includes(reservation.date)
    );

    useEffect(() => {
        const fetchUserProfileAndPermissions = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                    withCredentials: true,
                });
                const userData = response.data;
                setUserPermissions(userData.permissions || []);
                setUserRoles(userData.roles || []);
                setUserId(userData.id);
                const isAdmin = userData.roles.some(role => role.name === 'ADMIN');
                const canManageReservations = userData.permissions.includes('MANAGE_RESERVATION');
                setHasManageReservationPermission(isAdmin || canManageReservations);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfileAndPermissions();
    }, []);

    useEffect(() => {
        const fetchReservations = async () => {
            if (!tenantId || !userId) return;
            setIsLoading(true);

            try {
                let data = [];
                if (hasManageReservationPermission) {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/reservations/byTenantId/${tenantId}`,
                        {
                            method: 'GET',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch reservations");
                    }
                    data = await response.json();
                } else {
                    const allResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/byTenantId/${tenantId}`,
                        {
                            method: 'GET',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            }
                        }
                    );

                    if (!allResponse.ok) {
                        throw new Error("Failed to fetch reservations");
                    }

                    const allData = await allResponse.json();
                    const filteredData = [];

                    for (const reservation of allData) {
                        try {
                            const guidesResponse = await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservation.id}/guides`,
                                {
                                    method: 'GET',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                    }
                                }
                            );
                            if (guidesResponse.ok) {
                                const guides = await guidesResponse.json();
                                if (guides.some(guide => guide.guideId === userId)) {
                                    filteredData.push(reservation);
                                }
                            }
                        } catch (error) {
                            console.error(`Error checking guides for reservation ${reservation.id}:`, error);
                        }
                    }
                    data = filteredData;
                }

                const reservationsWithUserDetails = await Promise.all(
                    data.map(async (reservation) => {
                        if (reservation.user_id) {
                            if (!userDetails[reservation.user_id]) {
                                const userResponse = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/users/${reservation.user_id}`,
                                    {
                                        method: 'GET',
                                        credentials: 'include',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Accept': 'application/json',
                                        }
                                    }
                                );
                                if (userResponse.ok) {
                                    const userData = await userResponse.json();
                                    setUserDetails((prev) => ({
                                        ...prev,
                                        [reservation.user_id]: userData,
                                    }));
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
                    status: string;
                    paymentMethodId: string;
                    total_price: number;
                    imageUrl: string;
                    paymentIntentId: string;
                    duration: number;
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

                const groupedReservations: Record<string, Reservation> = reservationsWithUserDetails.reduce(
                    (acc, reservation) => {
                        const date = new Date(reservation.reservation_date).toISOString().split("T")[0];

                        if (!acc[date]) {
                            const dayName = new Date(reservation.reservation_date).toLocaleDateString("en-US", {
                                weekday: "long",
                            });
                            acc[date] = {
                                date: date,
                                day: dayName,
                                availableSummary: "∞ Available",
                                reservedSummary: `${reservation.guestQuantity} Reserved`,
                                reservations: [],
                            };
                        }

                        acc[date].reservations.push({
                            guestQuantity: reservation.guestQuantity,
                            time: new Date(reservation.reservation_date).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "UTC",
                            }),
                            dateFormatted: new Date(reservation.reservation_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            }),
                            title: reservation.tour.name,
                            available: "∞",
                            reservedDetails: `${reservation.guestQuantity} Reserved`,
                            statusColor: reservation.status === "PENDING" ? "red.500" : "green.500",
                            capacity: `${reservation.guestQuantity}/∞`,
                            guide: reservation.tour.StandardOperation || "No Guide",
                            hasNotes: reservation.notes.length > 0,
                            id: reservation.id,
                            email: reservation.tour.email,
                            phone: reservation.tour.phone || "N/A",
                            imageUrl: reservation.tour.imageUrl || "/images/default-tour.png",
                            user: reservation.user,
                            status: reservation.status,
                            paymentMethodId: reservation.paymentMethodId,
                            total_price: reservation.total_price,
                            paymentIntentId: reservation.paymentIntentId,
                            valuePerGuest: reservation.tour.price,
                            tourId: reservation.tour.id,
                            duration: reservation.tour.duration
                        });
                        return acc;
                    },
                    {}
                );

                const transformedReservations = Object.values(groupedReservations);

                setReservations(transformedReservations);

                const today = new Date();
                const todayISO = today.toISOString().split("T")[0];

                const futureReservations = transformedReservations.filter(
                    (res) => res.date >= todayISO
                );

                if (futureReservations.length > 0) {
                    const initialDate = futureReservations[0].date;
                    setSelectedDate(initialDate);
                    setLoadedDates([initialDate]);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId && tenantId) {
            fetchReservations();
        }
    }, [userDetails, tenantId, userId, hasManageReservationPermission]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openNoteModal = ({notes, reservation}) => {
        if (reservation) {
            setSelectedReservation(reservation);
            setNotesReservationList(notes || []);
            setNotesOpen(true);
        }
    };

    const handlePurchaseClick = () => {
        router.push("/dashboard/choose-a-product");
    };

    const filterReservations = (reservations) => {
        if (!searchTerm) return reservations;
        const lowercasedSearchTerm = searchTerm.toLowerCase();

        return reservations.filter((reservation) => {
            const {guide, email, phone, id, user} = reservation;

            const matchesReservation =
                (guide && guide.toLowerCase().includes(lowercasedSearchTerm)) ||
                (email && email.toLowerCase().includes(lowercasedSearchTerm)) ||
                (phone && phone.toLowerCase().includes(lowercasedSearchTerm)) ||
                (id && id.toLowerCase().includes(lowercasedSearchTerm));

            const matchesUser =
                user &&
                ((user.name && user.name.toLowerCase().includes(lowercasedSearchTerm)) ||
                    (user.email && user.email.toLowerCase().includes(lowercasedSearchTerm)) ||
                    (user.phone && user.phone.toLowerCase().includes(lowercasedSearchTerm)));

            return matchesReservation || matchesUser;
        });
    };

    const getNextDateWithReservations = () => {
        const lastLoadedDate = loadedDates[loadedDates.length - 1];
        const nextDateIndex = reservations.findIndex((res) => res.date === lastLoadedDate) + 1;
        if (nextDateIndex < reservations.length) {
            return reservations[nextDateIndex].date;
        }
        return null;
    };

    const handleLoadMore = () => {
        const nextDate = getNextDateWithReservations();
        if (nextDate) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setLoadedDates((prev) => [...prev, nextDate]);
                setIsLoadingMore(false);
            }, 500);
        }
    };

    const handleSelectReservation = (reserva) => {
        setSelectedReservation(reserva);
        setIsDetailVisible(true);

        if (isMobile) {
            window.scrollTo(0, 0);
        }
    };

    const handleCloseDetail = () => {
        setIsDetailVisible(false);
        setSelectedReservation(null);
    };

    function createDateFromISO(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const toggleFilters = () => {
        setIsFiltersVisible(!isFiltersVisible);
    };

    return (
        <DashboardLayout>
            <Flex align="center"
                  mb={4}
                  direction={{base: "column", md: "row"}}
                  px={{base: 4, md: 0}}>
                <Text fontSize="2xl" fontWeight="medium" ml={{base: 0, md: "-15px"}}>
                    Dashboard
                </Text>
                <Center height="50px"
                        w={{base: "100%", md: "40px"}}
                        display={{base: "none", md: "block"}}>
                    <Divider orientation='vertical'/>
                </Center>
                <Stack direction={{base: "column", md: "row"}} spacing={2} width="100%">
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
                            w={{base: "100%", md: "250px"}}
                            _placeholder={{fontSize: "lg"}}
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </InputGroup>
                    <Button
                        colorScheme="green"
                        size="md"
                        marginLeft={{base: 0, md: "-50px"}}
                        h={"40px"}
                        w={{base: "100%", md: "200px"}}
                        border={"none"}
                        borderRadius={"4px"}
                        onClick={handlePurchaseClick}
                    >
                        Make a Purchase
                    </Button>
                </Stack>
                <Spacer/>
            </Flex>
            <Divider/>

            <Flex align="center" justify="space-between" mt={4} mb={2} px={{base: 4, md: 0}}>
                {!isMobile && (
                    <HStack spacing={2} wrap="wrap">
                        <Box w={{base: "100px", md: "130px"}}>
                            <CustomDatePicker
                                selected={selectedDate ? createDateFromISO(selectedDate) : null}
                                onDateChange={(date) => {
                                    const formattedDate = formatDate(date);
                                    setSelectedDate(formattedDate);
                                    setLoadedDates([formattedDate]);
                                }}
                            />
                        </Box>
                        {/*<Select placeholder="Reserved" size="sm" w={{base: "100px", md: "120px"}}>*/}
                        {/*    <option value="reserved">Reserved</option>*/}
                        {/*    <option value="not_reserved">Not Reserved</option>*/}
                        {/*</Select>*/}
                        {/*<Select size="sm" w={{base: "80px", md: "90px"}} placeholder="List">*/}
                        {/*    <option value="list">List</option>*/}
                        {/*    <option value="grid">Grid</option>*/}
                        {/*</Select>*/}
                    </HStack>
                )}
                
                <Button variant="outline" size="sm" display={{base: "none", md: "block"}}>
                    Sync Calendar
                </Button>
            </Flex>

            {isMobile && (
                <CustomDatePicker
                    selected={selectedDate ? createDateFromISO(selectedDate) : null}
                    onDateChange={(date) => {
                        const formattedDate = formatDate(date);
                        setSelectedDate(formattedDate);
                        setLoadedDates([formattedDate]);
                    }}
                />
            )}
            
            <Divider/>
            {/*<HStack spacing={4} mb={4} mt="10px" wrap="wrap" px={{base: 4, md: 0}} overflowX="auto">*/}
            {/*    <Text fontSize="sm" color="gray.600">*/}
            {/*        Filters:*/}
            {/*    </Text>*/}
            {/*    <Button variant="outline" size="sm">*/}
            {/*        Products: All*/}
            {/*    </Button>*/}
            {/*    <Button variant="outline" size="sm">*/}
            {/*        Equipment: All*/}
            {/*    </Button>*/}
            {/*    <Button variant="outline" size="sm">*/}
            {/*        Guides: All*/}
            {/*    </Button>*/}
            {/*</HStack>*/}
            <Flex 
                direction={{base: "column", md: "row"}}
                maxHeight={{base: "unset", md: "calc(100vh - 80px)"}}
                overflowY="auto"
                ml={{base: 0, md: "-40px"}}
            >
                {(!isMobile || !isDetailVisible) && (
                    <Box
                        w={{base: "100%", md: isDetailVisible ? "20%" : "100%"}}
                        overflowY="auto"
                        overflowX="hidden"
                        borderRight={{base: "none", md: isDetailVisible ? "1px solid #e2e8f0" : "none"}}
                        transition="width 0.3s ease"
                        display="flex"
                        flexDirection="column"
                        px={{base: 4, md: 0}}
                    >
                        <Box p={4} mt={{base: "0", md: "-30px"}}>
                            <Divider orientation='horizontal' width="100%"/>
                            <VStack spacing={isMobile ? 8 : 6} align="stretch" marginTop={"10px"}>
                                {filteredReservations.map((data, index) => (
                                    <ReservationItem
                                        key={data.reservations[0]?.id || index}
                                        reservationId={data.reservations[0]?.id}
                                        date={data.date}
                                        day={data.day}
                                        availableSummary={data.availableSummary}
                                        reservedSummary={data.reservedSummary}
                                        reservations={filterReservations(data.reservations)}
                                        onNoteClick={(notes, reservationId) =>
                                            openNoteModal({
                                                notes,
                                                reservation: data.reservations.find(reservation => reservation.id === reservationId),
                                            })
                                        }
                                        onSelectReservation={handleSelectReservation}
                                        isCompactView={isDetailVisible && !isMobile}
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
                )}

                {isDetailVisible && (
                    <Box 
                        w={{base: "100%", md: "70%"}}
                        overflowY="auto"
                        transition="width 0.3s ease"
                        px={{base: 4, md: 0}}
                    >
                        <ReservationDetail
                            reservation={selectedReservation}
                            onCloseDetail={handleCloseDetail}
                            setReservations={setReservations}
                            hasManageReservationPermission={hasManageReservationPermission}
                        />
                    </Box>
                )}
            </Flex>

            <NotesFromReservationModalicon
                isOpen={isNotesOpen}
                notes={notesReservationList}
                reservation={selectedReservation}
                onClose={() => {
                    setNotesOpen(false);
                    setSelectedReservation(null);
                    setNotesReservationList([]);
                }}
            />
        </DashboardLayout>
    );
}

export default withPermission(Dashboard, "DASHBOARD_ACCESS");