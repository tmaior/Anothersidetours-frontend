import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Image,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import {FiCalendar, FiWatch} from "react-icons/fi";
import {ArrowBackIcon} from "@chakra-ui/icons";
import React, {useEffect, useState} from "react";
import ManageGuidesModal from "../../../components/ManageGuidesModal";
import {CiSquarePlus} from "react-icons/ci";
import NotesSection from "../../../components/NotesSection";
import {FaRegTimesCircle} from "react-icons/fa";
import {AiOutlineCompass} from "react-icons/ai";
import {useGuides} from "../../../hooks/useGuides";
import {useGuideAssignment} from "../../../hooks/useGuideAssignment";
import CancelConfirmationModal from "../../../components/CancelConfirmationModal";
import BookingCancellationModal from "../../../components/BookingCancellationModal";
import ChangeArrivalModal from "../../../components/ChangeArrivalModal";
import SendMessageModal from "../../../components/SendMessageModal";
import {format, parse} from "date-fns";
import useGuidesStore from "../../../utils/store";

export default function ReservationDetail({reservation, onCloseDetail, setReservations}) {
    const [isGuideModalOpen, setGuideModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedGuide, setSelectedGuide] = useState([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {guidesList, loadingGuides} = useGuides();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {assignGuides, isAssigning} = useGuideAssignment();
    const toast = useToast();
    // const {guides, loading} = useReservationGuides(reservation?.id);
    const [currentStatus, setCurrentStatus] = useState(reservation?.status);
    const [isChangeArrivalonOpen, setChangeArrivalOpen] = useState(false);
    const [isSendMessageModalOpen, setSendMessageModalOpen] = useState(false);

    const {reservationGuides, setReservationGuides} = useGuidesStore();
    const guides = reservationGuides[reservation?.id] || [];
    const loading = false;
    const [, setLocalGuides] = useState([]);

    const {
        isOpen: isConfirmOpen,
        onOpen: onConfirmOpen,
        onClose: onConfirmClose,
    } = useDisclosure();

    const {
        isOpen: isCancelOpen,
        onOpen: onCancelOpen,
        onClose: onCancelClose,
    } = useDisclosure();

    const handleConfirmCancel = () => {
        onConfirmClose();
        onCancelOpen();
    };

    useEffect(() => {
        setCurrentStatus(reservation?.status);
        setLocalGuides(reservationGuides[reservation.id]);
    }, [reservation, reservationGuides]);

    const displayGuideText = () => {
        if (loading) return "Loading guides...";
        if (guides.length === 0) return "No Guide assigned";
        return guides.map((guide) => guide.name).join(", ");
    };

    const handleSaveGuides = async (guides) => {
        const guideIds = guides.map((guide) => guide.id);

        setReservationGuides(reservation.id, guides);

        try {
            await assignGuides(reservation.id, guideIds);
            toast({
                title: "Guides Updated",
                description: guideIds.length > 0
                    ? "Guides successfully assigned to reservation"
                    : "All guides removed from reservation",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch {

            setReservationGuides(reservation.id, reservationGuides[reservation.id] || []);

            toast({
                title: "Error",
                description: "Failed to update guides",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


    if (!reservation) {
        return (
            <Box p={4}>
                <Text>No reservation selected. Select an item from the list below.</Text>
            </Box>
        );
    }
    const {user} = reservation;

    const handleAccept = async () => {
        try {
            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm-payment`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: reservation.user?.email,
                    paymentMethodId: reservation.paymentMethodId,
                    amount: reservation.total_price * 100,
                    currency: "usd",
                }),
            });

            if (!paymentResponse.ok) throw new Error("Failed to confirm payment");

            const parsedDate = parse(reservation.dateFormatted, 'MMM dd, yyyy', new Date());
            const formattedDate = format(parsedDate, 'yyyy-MM-dd');

            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/send-reservation-email`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    toEmail: reservation.user?.email,
                    emailData: {
                        userType: "customer",
                        title: "booking email",
                        status: "approved",
                        name: reservation.user?.name,
                        email: reservation.user?.email,
                        phone: reservation.user?.phone,
                        date: formattedDate,
                        time: reservation.time,
                        duration: reservation.duration,
                        quantity: reservation.guestQuantity,
                        tourTitle: reservation.title,
                        description: "your reservation has been approved",
                        totals: [
                            {label: "total", amount: `$${reservation.total_price.toFixed(2)}`},
                            {label: "paid", amount: `$${reservation.total_price.toFixed(2)}`}
                        ]
                    }
                }),
            });

            if (!emailResponse.ok) throw new Error("Failed to send email");

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservation.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({status: "ACCEPTED"}),
            });

            setCurrentStatus("ACCEPTED");
            setReservations((prevDays) =>
                prevDays.map((dayObj) => ({
                    ...dayObj,
                    reservations: dayObj.reservations.map((r) =>
                        r.id === reservation.id ? {...r, status: "ACCEPTED"} : r
                    ),
                }))
            );

            toast({
                title: "Reservation Accepted",
                description: "The reservation has been accepted and payment confirmed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error confirming payment:", error);
            toast({
                title: "Error",
                description: "Failed to accept reservation.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const confirmReject = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/invalidate-payment-method`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({paymentMethodId: reservation.paymentMethodId}),
            });

            const parsedDate = parse(reservation.dateFormatted, 'MMM dd, yyyy', new Date());
            const formattedDate = format(parsedDate, 'yyyy-MM-dd');

            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/send-reservation-email`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    toEmail: reservation.user?.email,
                    emailData: {
                        userType: "customer",
                        title: "booking email",
                        status: "declined",
                        name: reservation.user?.name,
                        email: reservation.user?.email,
                        phone: reservation.user?.phone,
                        date: formattedDate,
                        time: reservation.time,
                        duration: reservation.duration,
                        quantity: reservation.guestQuantity,
                        tourTitle: reservation.title,
                        description: "your reservation has been declined",
                        totals: [
                            {label: "total", amount: `$${reservation.total_price.toFixed(2)}`},
                            {label: "paid", amount: `$${reservation.total_price.toFixed(2)}`}
                        ]
                    }
                }),
            });

            if (!emailResponse.ok) throw new Error("Failed to send email");

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservation.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({status: "REJECTED"}),
            });

            setCurrentStatus("REJECTED");
            setReservations((prevDays) =>
                prevDays.map((dayObj) => ({
                    ...dayObj,
                    reservations: dayObj.reservations.map((r) =>
                        r.id === reservation.id ? {...r, status: "REJECTED"} : r
                    ),
                }))
            );

            toast({
                title: "Reservation Rejected",
                description: "The reservation has been rejected.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error rejecting reservation:", error);
            toast({
                title: "Error",
                description: "Failed to reject reservation.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box p={4} overflowX="hidden">
            <Divider marginTop={"-15px"} maxW={"100%"}/>
            <Button
                marginTop={"15px"}
                leftIcon={<ArrowBackIcon/>}
                variant="outline"
                size="sm"
                mb={4}
                onClick={onCloseDetail}
            >
                Back
            </Button>
            <Flex alignItems="center" justifyContent="space-between" mb={4}>
                {/*<HStack spacing={4}>*/}
                {/*    <Text fontSize="xl" fontWeight="bold">*/}
                {/*        Filtros (exemplo)*/}
                {/*    </Text>*/}
                {/*    <Menu>*/}
                {/*        <MenuButton as={Button} variant="outline" size="sm" rightIcon={<ChevronDownIcon />}>*/}
                {/*            Products: All*/}
                {/*        </MenuButton>*/}
                {/*        <MenuList>*/}
                {/*            <MenuItem>All</MenuItem>*/}
                {/*            <MenuItem>Product A</MenuItem>*/}
                {/*            <MenuItem>Product B</MenuItem>*/}
                {/*        </MenuList>*/}
                {/*    </Menu>*/}
                {/*</HStack>*/}
            </Flex>
            <HStack alignItems="flex-start" justifyContent="space-between">
                <HStack alignItems="flex-start">
                    <Box boxSize="130px">
                        <Image
                            src={reservation.imageUrl || "https://via.placeholder.com/80"}
                            alt="Event Image"
                            borderRadius="md"
                            width="130px"
                            height="130px"
                            objectFit="contain"
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xl" fontWeight="bold">{reservation.title}</Text>
                        <HStack spacing={2}>
                            <Icon as={FiCalendar} color="gray.500"/>
                            <Text fontSize="sm" color="gray.600">
                                {reservation.dateFormatted}
                            </Text>
                            <Icon as={FiWatch} color="gray.500"/>
                            <Text fontSize="sm" color="gray.600">
                                {reservation.time}
                            </Text>
                        </HStack>
                    </Box>
                </HStack>
            </HStack>
            <HStack spacing={4} mt={4}>
                <Button
                    size="sm"
                    colorScheme="green"
                    onClick={handleAccept}
                    isDisabled={currentStatus !== "PENDING"}
                >
                    Accept
                </Button>
                <Button
                    size="sm"
                    colorScheme="red"
                    onClick={confirmReject}
                    isDisabled={currentStatus !== "PENDING"}
                >
                    Reject
                </Button>
                <Button size="sm" variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSendMessageModalOpen(true);
                        }}
                >
                    Message
                </Button>
                <Button size="sm" variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            setChangeArrivalOpen(true);
                        }}
                        isDisabled={currentStatus == "CANCELED" || currentStatus == "REJECTED"}
                >
                    Change Arrival
                </Button>

                <Button size="sm" variant="outline"
                        color={"red.500"}
                        onClick={onConfirmOpen}
                        isDisabled={currentStatus == "CANCELED" || currentStatus == "REJECTED"}
                >
                    <FaRegTimesCircle style={{marginRight: '8px'}}/>
                    Cancel Reservations
                </Button>
                <Button size="sm" variant="outline">Email Roster</Button>
                <Button size="sm" variant="outline">Export Roster</Button>
                <Button size="sm" variant="outline" color={"green"}> + Purchase</Button>
            </HStack>

            <CancelConfirmationModal
                isOpen={isConfirmOpen}
                onClose={onConfirmClose}
                onConfirm={handleConfirmCancel}
                booking={reservation}
            />

            <BookingCancellationModal
                isOpen={isCancelOpen}
                onClose={onCancelClose}
                booking={reservation}
                onStatusChange={(newStatus) => {
                    setCurrentStatus(newStatus);
                    setReservations((prevDays) =>
                        prevDays.map((dayObj) => ({
                            ...dayObj,
                            reservations: dayObj.reservations.map((r) =>
                                r.id === reservation.id ? {...r, status: newStatus} : r
                            ),
                        }))
                    );
                }}
            />

            <SendMessageModal
                isOpen={isSendMessageModalOpen}
                onClose={() => setSendMessageModalOpen(false)}
                eventDetails={{
                    title: reservation.title,
                    date: reservation.dateFormatted,
                    time: reservation.time,
                    image: reservation.imageUrl
                }}
            />

            <ChangeArrivalModal
                booking={reservation}
                isOpen={isChangeArrivalonOpen}
                onClose={() => setChangeArrivalOpen(false)}
            />

            <HStack spacing={8} mt={4}>
                <Box mt={6}>
                    <HStack spacing={2}>
                        <AiOutlineCompass/>
                        <Text fontSize="xl" fontWeight="bold">Guide</Text>
                    </HStack>
                    <Text fontSize="sm" color="black.500">
                        {displayGuideText()}
                    </Text>

                    <Button
                        variant="link"
                        size="xs"
                        onClick={() => setGuideModalOpen(true)}
                        color="black"
                        fontWeight={"bold"}
                    >
                        <CiSquarePlus size={"17px"}/>
                        Manage Guides
                    </Button>
                </Box>
                <ManageGuidesModal
                    isOpen={isGuideModalOpen}
                    onClose={() => setGuideModalOpen(false)}
                    onSelectGuide={(selected) => {
                        setSelectedGuide(selected);
                        setGuideModalOpen(false);
                        handleSaveGuides(selected);
                    }} reservationId={reservation.id}/>
            </HStack>

            <NotesSection
                reservationId={reservation.id}
            />

            <Box mt={6} maxW="100%" overflowX="auto">
                <Text fontSize="lg" fontWeight="bold" mb={4}>Guests</Text>
                <Table size="sm" variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Action</Th>
                            <Th>Guest Name</Th>
                            <Th>Demographics</Th>
                            <Th>Balance Due</Th>
                            <Th>Notes</Th>
                            <Th>Waivers</Th>
                            <Th>Source</Th>
                            <Th>Vouchers</Th>
                            <Th>Phone</Th>
                            <Th>Email</Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>
                                <Accordion allowToggle>
                                    <AccordionItem border="none">
                                        <AccordionButton p={0}>
                                            <AccordionIcon/>
                                        </AccordionButton>
                                        <AccordionPanel>
                                            Additional information...
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                            </Td>
                            <Td>{user?.name || 'N/A'}</Td>
                            <Td>{reservation.guestQuantity}</Td>
                            <Td>0</Td>
                            <Td>
                                0 Purchase Notes<br/>
                                0 Customer Notes
                            </Td>
                            <Td>
                                <Text color="green.500">0 Signed</Text>
                                <Text color="red.500">0 Unsigned</Text>
                            </Td>
                            <Td> - </Td>
                            <Td> - </Td>
                            <Td>{user?.phone || 'N/A'}</Td>
                            <Td>{user?.email || 'N/A'}</Td>
                            <Td color={currentStatus === "ACCEPTED" ? "green.500" : currentStatus === "PENDING" ? "black"
                                : "red.500"
                            }
                            >
                                {currentStatus}
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>

                {/*<HStack justifyContent="space-between" mt={4}>*/}
                {/*    <Text fontSize="sm" color="gray.500">Status: Checkout</Text>*/}
                {/*</HStack>*/}
            </Box>
        </Box>
    );
}