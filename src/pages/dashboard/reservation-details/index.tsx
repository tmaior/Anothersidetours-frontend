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
    useBreakpointValue,
    Center,
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
import withPermission from "../../../utils/withPermission";

function ReservationDetail({reservation, onCloseDetail, setReservations, hasManageReservationPermission = false}) {
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
    const [groupedUserDetails, setGroupedUserDetails] = useState({});
    const [loadingGroupedUsers, setLoadingGroupedUsers] = useState(false);
    const [processingReservationId, setProcessingReservationId] = useState(null);

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
        setLocalGuides(reservationGuides[reservation?.id] || []);
    }, [reservation, reservationGuides]);

    useEffect(() => {
        if (reservation?.isGrouped && reservation?.groupedReservations?.length > 1) {
            setLoadingGroupedUsers(true);
            
            const fetchUserDetails = async () => {
                try {
                    const userDetailsMap = {};
                    await Promise.all(
                        reservation.groupedReservations.map(async (subReservation) => {
                            if (subReservation.user_id && !userDetailsMap[subReservation.user_id]) {
                                try {
                                    const response = await fetch(
                                        `${process.env.NEXT_PUBLIC_API_URL}/users/${subReservation.user_id}`,
                                        {
                                            credentials: 'include',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Accept': 'application/json',
                                            }
                                        }
                                    );
                                    
                                    if (response.ok) {
                                        const userData = await response.json();
                                        userDetailsMap[subReservation.user_id] = userData;
                                        subReservation.user = userData;
                                    }
                                } catch (error) {
                                    console.error(`Error fetching user data for ${subReservation.user_id}:`, error);
                                }
                            }
                        })
                    );
                    
                    setGroupedUserDetails(userDetailsMap);
                } catch (error) {
                    console.error("Error fetching grouped user details:", error);
                } finally {
                    setLoadingGroupedUsers(false);
                }
            };
            
            fetchUserDetails();
        }
    }, [reservation]);

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

    const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

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
            const transactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${reservation.id}`, {
                credentials: "include",
            });

            if (!transactionResponse.ok) {
                const errorText = await transactionResponse.text();
                console.error("Transaction response error:", {
                    status: transactionResponse.status,
                    statusText: transactionResponse.statusText,
                    body: errorText
                });
                throw new Error(`Failed to get payment transaction data: ${transactionResponse.status} ${transactionResponse.statusText}`);
            }

            const transactionText = await transactionResponse.text();
            if (!transactionText) {
                console.error("Empty response received from transaction endpoint");
                throw new Error("No data received from payment transaction endpoint");
            }

            let transactionData;
            try {
                transactionData = JSON.parse(transactionText);
            } catch (e) {
                console.error("Failed to parse transaction response:", e, "Response text:", transactionText);
                throw new Error("Invalid response format from payment transaction endpoint");
            }

            if (!transactionData || transactionData.length === 0) {
                throw new Error("No payment transaction found for this reservation");
            }

            const transaction = transactionData[0];

            if (!reservation.tenantId) {
                const tourResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${reservation.tourId}`, {
                    credentials: "include",
                });

                if (!tourResponse.ok) {
                    const errorText = await tourResponse.text();
                    console.error("Tour response error:", {
                        status: tourResponse.status,
                        statusText: tourResponse.statusText,
                        body: errorText
                    });
                    throw new Error("Failed to get tour data");
                }

                const tourText = await tourResponse.text();
                if (!tourText) {
                    console.error("Empty response received from tour endpoint");
                    throw new Error("No data received from tour endpoint");
                }

                let tourData;
                try {
                    tourData = JSON.parse(tourText);
                    console.log("Tour data:", tourData);
                    if (!tourData.tenantId) {
                        throw new Error("No tenantId found in tour data");
                    }
                    reservation.tenantId = tourData.tenantId;
                } catch (e) {
                    console.error("Failed to parse tour response or get tenantId:", e, "Response text:", tourText);
                    throw new Error("Invalid response format from tour endpoint or missing tenantId");
                }
            }

            const tenantResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${reservation.tenantId}`, {
                credentials: "include",
            });

            if (!tenantResponse.ok) {
                const errorText = await tenantResponse.text();
                console.error("Tenant response error:", {
                    status: tenantResponse.status,
                    statusText: tenantResponse.statusText,
                    body: errorText,
                    tenantId: reservation.tenantId
                });
                throw new Error(`Failed to get tenant data: ${tenantResponse.status} ${tenantResponse.statusText}`);
            }

            const tenantText = await tenantResponse.text();
            
            if (!tenantText) {
                console.error("Empty response received from tenant endpoint", {
                    tenantId: reservation.tenantId,
                    endpoint: `${process.env.NEXT_PUBLIC_API_URL}/tenants/${reservation.tenantId}`
                });
                throw new Error("No data received from tenant endpoint");
            }

            let tenantData;
            try {
                tenantData = JSON.parse(tenantText);
            } catch (e) {
                console.error("Failed to parse tenant response:", e, "Response text:", tenantText);
                throw new Error("Invalid response format from tenant endpoint");
            }

            const stripeAccountId = tenantData.stripeAccountId;
            if (!stripeAccountId) {
                console.warn("No stripeAccountId found for tenant:", tenantData);
            }

            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/process-transaction-payment`, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    transactionId: transaction.id,
                    stripeAccountId: stripeAccountId
                }),
            });

            if (!paymentResponse.ok) {
                const errorText = await paymentResponse.text();
                console.error("Payment processing error:", {
                    status: paymentResponse.status,
                    statusText: paymentResponse.statusText,
                    body: errorText
                });
                throw new Error("Failed to process payment");
            }

            const paymentText = await paymentResponse.text();
            if (!paymentText) {
                console.error("Empty response received from payment endpoint");
                throw new Error("No data received from payment endpoint");
            }

            let paymentResult;
            try {
                paymentResult = JSON.parse(paymentText);
            } catch (e) {
                console.error("Failed to parse payment response:", e, "Response text:", paymentText);
                throw new Error("Invalid response format from payment endpoint");
            }

            const parsedDate = parse(reservation.dateFormatted, 'MMM dd, yyyy', new Date());
            const formattedDate = format(parsedDate, 'yyyy-MM-dd');

            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/send-reservation-email`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
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
                        reservationId: reservation.id,
                        totals: [
                            {label: "total", amount: `$${reservation.total_price.toFixed(2)}`},
                            {label: "paid", amount: `$${reservation.total_price.toFixed(2)}`}
                        ]
                    }
                }),
            });

            if (!emailResponse.ok) {
                const errorText = await emailResponse.text();
                console.error("Email sending error:", {
                    status: emailResponse.status,
                    statusText: emailResponse.statusText,
                    body: errorText
                });
                throw new Error("Failed to send email");
            }

            const emailText = await emailResponse.text();
            if (emailText) {
                try {
                    const emailResult = JSON.parse(emailText);
                    console.log("Email sent successfully:", emailResult);
                } catch (e) {
                    console.warn("Email response not JSON format:", emailText);
                }
            }

            setCurrentStatus("ACCEPTED");
            setReservations((prevDays) =>
                prevDays.map((dayObj) => ({
                    ...dayObj,
                    reservations: dayObj.reservations.map((r) =>
                        r.id === reservation.id ? {
                            ...r,
                            status: "ACCEPTED",
                            paymentIntentId: paymentResult.paymentIntentId
                        } : r
                    ),
                }))
            );

            toast({
                title: "Reservation Accepted",
                description: "The reservation has been accepted and payment processed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error in handleAccept:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to accept reservation.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const confirmReject = async () => {
        try {
            const transactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${reservation.id}`,
                {
                    method: "GET",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                }
            );

            if (!transactionResponse.ok) throw new Error("Failed to get payment transaction data");

            const transactionData = await transactionResponse.json();

            if (transactionData && transactionData.length > 0) {
                const transaction = transactionData[0];
                if (transaction.paymentMethodId) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/invalidate-payment-method`, {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({paymentMethodId: transaction.paymentMethodId}),
                    });
                }
            } else if (reservation.paymentMethodId) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/invalidate-payment-method`, {
                    method: "POST",
                    credentials: 'include',
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({paymentMethodId: reservation.paymentMethodId}),
                });
            }

            const parsedDate = parse(reservation.dateFormatted, 'MMM dd, yyyy', new Date());
            const formattedDate = format(parsedDate, 'yyyy-MM-dd');

            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/send-reservation-email`, {
                method: "POST",
                credentials: 'include',
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
                        reservationId: reservation.id,
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
                credentials: "include",
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
                description: error.message || "Failed to reject reservation.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleAcceptIndividualReservation = async (subReservation) => {
        if (!subReservation || !subReservation.id) return;
        
        setProcessingReservationId(subReservation.id);
        
        try {
            const transactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${subReservation.id}`, {
                credentials: "include",
            });

            if (!transactionResponse.ok) {
                throw new Error(`Failed to get payment transaction data: ${transactionResponse.status}`);
            }

            const transactionData = await transactionResponse.json();
            if (!transactionData || transactionData.length === 0) {
                throw new Error("No payment transaction found for this reservation");
            }

            const transaction = transactionData[0];

            let tenantId = subReservation.tenantId || reservation.tenantId;
            if (!tenantId && subReservation.tourId) {
                const tourResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${subReservation.tourId}`, {
                    credentials: "include",
                });
                
                if (tourResponse.ok) {
                    const tourData = await tourResponse.json();
                    tenantId = tourData.tenantId;
                }
            }
            
            if (!tenantId) {
                throw new Error("Could not determine tenant for this reservation");
            }

            const tenantResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenantId}`, {
                credentials: "include",
            });
            
            if (!tenantResponse.ok) {
                throw new Error(`Failed to get tenant data: ${tenantResponse.status}`);
            }
            
            const tenantData = await tenantResponse.json();
            const stripeAccountId = tenantData.stripeAccountId;
            
            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/process-transaction-payment`, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    transactionId: transaction.id,
                    stripeAccountId: stripeAccountId
                }),
            });

            if (!paymentResponse.ok) {
                throw new Error("Failed to process payment");
            }

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${subReservation.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({status: "ACCEPTED"}),
            });

            if (reservation.isGrouped && reservation.groupedReservations) {
                const updatedGroupedReservations = reservation.groupedReservations.map(res => 
                    res.id === subReservation.id ? {...res, status: "ACCEPTED"} : res
                );
                reservation.groupedReservations = updatedGroupedReservations;
            }
            
            toast({
                title: "Reservation Accepted",
                description: `The reservation for ${subReservation.user?.name || 'Guest'} has been accepted`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
        } catch (error) {
            console.error("Error accepting individual reservation:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to accept reservation",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setProcessingReservationId(null);
        }
    };

    const handleRejectIndividualReservation = async (subReservation) => {
        if (!subReservation || !subReservation.id) return;
        
        setProcessingReservationId(subReservation.id);
        
        try {
            const transactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${subReservation.id}`, {
                credentials: "include",
            });

            if (transactionResponse.ok) {
                const transactionData = await transactionResponse.json();
                if (transactionData && transactionData.length > 0) {
                    const transaction = transactionData[0];
                    if (transaction.paymentMethodId) {
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/invalidate-payment-method`, {
                            method: "POST",
                            credentials: 'include',
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({paymentMethodId: transaction.paymentMethodId}),
                        });
                    }
                }
            }

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${subReservation.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({status: "REJECTED"}),
            });

            if (reservation.isGrouped && reservation.groupedReservations) {
                const updatedGroupedReservations = reservation.groupedReservations.map(res => 
                    res.id === subReservation.id ? {...res, status: "REJECTED"} : res
                );
                reservation.groupedReservations = updatedGroupedReservations;
            }
            
            toast({
                title: "Reservation Rejected",
                description: `The reservation for ${subReservation.user?.name || 'Guest'} has been rejected`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
        } catch (error) {
            console.error("Error rejecting individual reservation:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to reject reservation",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setProcessingReservationId(null);
        }
    };

    return (
        <Box p={{base: 4, md: 2, lg: 4}} overflowX="hidden">
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
            <HStack alignItems="flex-start" justifyContent="space-between" spacing={{base: 2, md: 3, lg: 4}}>
                <HStack alignItems="flex-start" spacing={{base: 2, md: 3, lg: 4}}>
                    <Box boxSize={{base: "100px", md: "110px", lg: "130px"}}>
                        <Image
                            src={reservation.imageUrl || "https://via.placeholder.com/80"}
                            alt="Event Image"
                            borderRadius="md"
                            width="100%"
                            height="100%"
                            objectFit="contain"
                        />
                    </Box>
                    <Box>
                        <Text fontSize={{base: "lg", lg: "xl"}} fontWeight="bold">{reservation.title}</Text>
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
                        
                        {/* Remover o card de Group Information */}
                    </Box>
                </HStack>
            </HStack>
            <Flex 
                mt={4} 
                gap={{base: 2, md: 3, lg: 4}} 
                flexWrap="wrap"
                direction={{ base: "column", md: "row" }}
            >
                {hasManageReservationPermission && (
                    <>
                        <Button
                            size="sm"
                            colorScheme="green"
                            onClick={handleAccept}
                            isDisabled={currentStatus !== "PENDING" || reservation.isGrouped}
                            title={reservation.isGrouped ? "Use individual controls for grouped reservations" : ""}
                        >
                            Accept
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="red"
                            onClick={confirmReject}
                            isDisabled={currentStatus !== "PENDING" || reservation.isGrouped}
                            title={reservation.isGrouped ? "Use individual controls for grouped reservations" : ""}
                        >
                            Reject
                        </Button>
                    </>
                )}
                
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

                {hasManageReservationPermission && (
                    <Button size="sm" variant="outline"
                            color={"red.500"}
                            onClick={onConfirmOpen}
                            isDisabled={currentStatus == "CANCELED" || currentStatus == "REJECTED"}
                    >
                        <FaRegTimesCircle style={{marginRight: '8px'}}/>
                        Cancel Reservations
                    </Button>
                )}
                <Button size="sm" variant="outline">Email Roster</Button>
                <Button size="sm" variant="outline">Export Roster</Button>
                <Button size="sm" variant="outline" color={"green"}> + Purchase</Button>
            </Flex>

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

            <HStack spacing={{base: 4, md: 6, lg: 8}} mt={4} flexWrap="wrap">
                <Box mt={6}>
                    <HStack spacing={2}>
                        <AiOutlineCompass/>
                        <Text fontSize={{base: "lg", lg: "xl"}} fontWeight="bold">Guide</Text>
                    </HStack>
                    <Text fontSize="sm" color="black.500">
                        {displayGuideText()}
                    </Text>

                    {hasManageReservationPermission && (
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
                    )}
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
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Guests {reservation.isGrouped && `(${reservation.groupedReservations?.length || 0} total)`}
                </Text>
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
                            {hasManageReservationPermission && <Th>Controls</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {!reservation.isGrouped ? (
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
                                {hasManageReservationPermission && (
                                    <Td>
                                    </Td>
                                )}
                            </Tr>
                        ) : (
                            reservation.groupedReservations && 
                            reservation.groupedReservations.map((subReservation, index) => {
                                const userDetail = subReservation.user_id ? 
                                                   groupedUserDetails[subReservation.user_id] || 
                                                   subReservation.user : 
                                                   null;
                                
                                return (
                                    <Tr key={subReservation.id || index}>
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
                                        <Td>{userDetail?.name || 'N/A'}</Td>
                                        <Td>{subReservation.guestQuantity}</Td>
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
                                        <Td>{userDetail?.phone || 'N/A'}</Td>
                                        <Td>{userDetail?.email || 'N/A'}</Td>
                                        <Td color={subReservation.status === "ACCEPTED" ? "green.500" : 
                                                 subReservation.status === "PENDING" ? "black" : "red.500"}
                                        >
                                            {subReservation.status}
                                        </Td>
                                        {hasManageReservationPermission && (
                                            <Td>
                                                <HStack spacing={1}>
                                                    {subReservation.status === "PENDING" && (
                                                        <>
                                                            <Button 
                                                                size="xs" 
                                                                colorScheme="green"
                                                                isLoading={processingReservationId === subReservation.id}
                                                                onClick={() => handleAcceptIndividualReservation(subReservation)}
                                                            >
                                                                Accept
                                                            </Button>
                                                            <Button 
                                                                size="xs" 
                                                                colorScheme="red"
                                                                isLoading={processingReservationId === subReservation.id}
                                                                onClick={() => handleRejectIndividualReservation(subReservation)}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {subReservation.status === "ACCEPTED" && (
                                                        <Button 
                                                            size="xs" 
                                                            colorScheme="red"
                                                            variant="outline"
                                                            isLoading={processingReservationId === subReservation.id}
                                                            onClick={() => {
                                                                toast({
                                                                    title: "Info",
                                                                    description: "Use the Cancel Reservation button for canceling accepted reservations",
                                                                    status: "info",
                                                                    duration: 3000,
                                                                    isClosable: true,
                                                                });
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </HStack>
                                            </Td>
                                        )}
                                    </Tr>
                                );
                            })
                        )}
                    </Tbody>
                </Table>
                
                {loadingGroupedUsers && (
                    <Center mt={4}>
                        <Text>Carregando detalhes dos convidados...</Text>
                    </Center>
                )}

                {/*<HStack justifyContent="space-between" mt={4}>*/}
                {/*    <Text fontSize="sm" color="gray.500">Status: Checkout</Text>*/}
                {/*</HStack>*/}
            </Box>
        </Box>
    );
}

export default withPermission(ReservationDetail, "RESERVATION_READ");