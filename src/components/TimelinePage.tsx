import React, {useEffect, useState} from "react";
import {Box, Flex, HStack, Spinner, StackDivider, Switch, Text, useColorModeValue, VStack} from "@chakra-ui/react";
import {EmailIcon} from "@chakra-ui/icons";
import axios from "axios";
import {FaCheck, FaDollarSign, FaPlus, FaPuzzlePiece, FaTicketAlt, FaTimes, FaUsers} from "react-icons/fa";
import {GrUpdate} from "react-icons/gr";
import {TfiLayoutWidthDefaultAlt} from "react-icons/tfi";
import {format} from "date-fns";
import {MdDoNotDisturbOn} from "react-icons/md";

interface Event {
    id: string;
    eventTitle: string;
    status: "ACCEPTED" | "REJECTED" | "CANCELED" | "PAYMENT" | "CREATED" | "UPDATE" | "VOUCHER" | "REFUND";
    eventType: "Reservation" | "Communication";
    createdAt: string;
    createdBy?: string;
    eventDescription?: string;
    value?: number;
    to?: string;
    metadata?: any;
}

interface Transaction {
    id: string;
    tenant_id: string;
    reservation_id: string;
    payment_method?: string;
    amount: number;
    payment_status: string;
    transaction_type?: string;
    metadata?: any;
    transaction_direction?: string;
    created_at: string;
    updated_at: string;
}

export default function TimelinePage({reservationId}: { reservationId: string }) {
    const [events, setEvents] = useState([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReservation, setShowReservation] = useState(true);
    const [showCommunication, setShowCommunication] = useState(true);
    const dividerColor = useColorModeValue("gray.200", "gray.700");

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const eventsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history/byReservation/${reservationId}`,{
                    withCredentials: true,
                });

                const processedEvents = eventsResponse.data.map(event => {
                    if (event.metadata && typeof event.metadata === 'string') {
                        try {
                            event.metadata = JSON.parse(event.metadata);
                        } catch (e) {
                            console.error("Failed to parse event metadata:", e);
                        }
                    }
                    return event;
                });

                const transactionsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions/by-reservation/${reservationId}`,{
                    withCredentials: true,
                });

                const processedTransactions = transactionsResponse.data.map(transaction => {
                    if (transaction.metadata) {
                        try {
                            if (typeof transaction.metadata === 'object' && !Array.isArray(transaction.metadata)) {
                            } else if (typeof transaction.metadata === 'string') {
                                transaction.metadata = JSON.parse(transaction.metadata);
                            } else if (Array.isArray(transaction.metadata) &&
                                transaction.metadata.every(item => typeof item === 'object' && '0' in item)) {
                                const jsonString = Object.values(transaction.metadata)
                                    .filter(val => typeof val === 'string')
                                    .join('');

                                if (jsonString) {
                                    transaction.metadata = JSON.parse(jsonString);
                                }
                            } else if (Array.isArray(transaction.metadata) &&
                                transaction.metadata.every(item => typeof item === 'string' || typeof item === 'number')) {
                                const jsonString = transaction.metadata.join('');
                                if (jsonString) {
                                    transaction.metadata = JSON.parse(jsonString);
                                }
                            }
                        } catch (e) {
                            console.error("Failed to parse transaction metadata:", e);
                        }
                    }
                    return transaction;
                });
                const transactionEvents = processedTransactions
                    .filter(transaction =>
                        ['GUEST_QUANTITY_CHANGE', 'GUEST_QUANTITY_REFUND', 'ADDON_CHANGE', 'CUSTOM_LINE_ITEMS'].includes(transaction.transaction_type)
                    )
                    .map(transaction => {
                        let eventTitle = '';
                        let eventDescription = '';
                        let metadata = transaction.metadata;
                        switch (transaction.transaction_type) {
                            case 'GUEST_QUANTITY_CHANGE':
                            case 'GUEST_QUANTITY_REFUND':
                                const originalGuestQty = metadata?.originalGuestQuantity || metadata?.newGuestQuantity;
                                const newGuestQty = metadata?.newGuestQuantity || metadata?.originalGuestQuantity;

                                eventTitle = 'Guest Quantity Changed';
                                eventDescription = `Guest quantity changed from ${originalGuestQty} to ${newGuestQty}`;
                                break;

                            case 'ADDON_CHANGE':
                                eventTitle = 'Add-ons Modified';

                                const originalAddonsTotal = metadata?.originalAddonsTotal || 0;
                                const newAddonsTotal = metadata?.newAddonsTotal || 0;

                                eventDescription = `Addons total changed from $${originalAddonsTotal} to $${newAddonsTotal}`;
                                break;

                            case 'CUSTOM_LINE_ITEMS':
                                eventTitle = 'Custom Items Modified';

                                const previousItems = metadata?.previousItems || [];
                                const currentItems = metadata?.currentItems || [];

                                const itemsAdded = currentItems.filter(item =>
                                    !previousItems.some(prevItem => prevItem.id === item.id)
                                );

                                if (itemsAdded.length > 0) {
                                    eventDescription = `Added ${itemsAdded.length} new custom item(s)`;
                                } else {
                                    eventDescription = 'Custom line items were modified';
                                }
                                break;
                        }

                        return {
                            id: transaction.id,
                            eventTitle: eventTitle,
                            status: transaction.transaction_direction === 'refund' ? 'REFUND' : 'UPDATE',
                            eventType: 'Reservation',
                            createdAt: transaction.created_at,
                            createdBy: 'System',
                            eventDescription: eventDescription,
                            value: transaction.amount,
                            metadata: metadata
                        };
                    });
                const allEvents = [...processedEvents, ...transactionEvents];
                const sortedEvents = allEvents.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setEvents(sortedEvents);
                setTransactions(processedTransactions);
            } catch (err) {
                setError(err.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [reservationId]);

    const filteredEvents = events.filter((evt: Event) => {
        if (evt.eventType === "Reservation" && !showReservation) return false;
        if (evt.eventType === "Communication" && !showCommunication) return false;
        return true;
    });

    if (loading) {
        return (
            <Box p={8} textAlign="center">
                <Spinner size="xl"/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={8} textAlign="center" color="red.500">
                <Text>Error: {error}</Text>
            </Box>
        );
    }

    return (
        <Box p={8}>
            <HStack spacing={8} mb={4}>
                <HStack>
                    <Switch
                        isChecked={showReservation}
                        onChange={(e) => setShowReservation(e.target.checked)}
                        colorScheme="blue"
                    />
                    <Text>Reservation Events</Text>
                </HStack>
                <HStack>
                    <Switch
                        isChecked={showCommunication}
                        onChange={(e) => setShowCommunication(e.target.checked)}
                        colorScheme="blue"
                    />
                    <Text>Communication</Text>
                </HStack>
            </HStack>

            <VStack align="stretch" divider={<StackDivider borderColor={dividerColor}/>}>
                {filteredEvents.map((event: Event, idx: number) => (
                    <TimelineItem key={event.id} event={event} isLast={idx === filteredEvents.length - 1}/>
                ))}
            </VStack>
        </Box>
    );
}


function TimelineItem({event, isLast}: { event: Event; isLast: boolean }) {

    function getEventIcon(title: string) {
        if (event.status === "ACCEPTED") {
            return <FaCheck color="green.400"/>;
        }

        if (event.status === "REJECTED") {
            return <MdDoNotDisturbOn color="green.400"/>;
        }

        if (event.status === "CANCELED") {
            return <FaTimes color="red.400"/>;
        }

        if (event.status === "PAYMENT" || event.status === "REFUND") {
            return <FaDollarSign color="green.400"/>;
        }

        if (event.status === "VOUCHER") {
            return <FaTicketAlt color="purple.400"/>;
        }

        switch (title.toLowerCase()) {
            case "reservation created":
                return <FaPlus color="green.400"/>;
            case "reservation updated":
                return <GrUpdate color="blue.400"/>;
            case "email sent":
                return <EmailIcon/>;
            case "guest quantity changed":
                return <FaUsers color="blue.400"/>;
            case "add-ons modified":
            case "addons updated":
            case "add-on added":
            case "add-on removed":
                return <FaPuzzlePiece color="orange.400"/>;
            case "voucher applied":
            case "voucher redeemed":
            case "voucher generated":
                return <FaTicketAlt color="purple.400"/>;
            case "custom items modified":
                return <FaPlus color="teal.400"/>;
            default:
                return <TfiLayoutWidthDefaultAlt color="gray.400"/>;
        }
    }

    const icon = getEventIcon(event.eventTitle);

    const renderEventValue = () => {
        if (!event.value && !event.metadata) return null;

        const isVoucher = event.eventTitle?.toLowerCase().includes('voucher');
        const isAddOn = event.eventTitle?.toLowerCase().includes('add-on') ||
            event.eventTitle?.toLowerCase().includes('addons');
        const isGuestChange = event.eventTitle?.toLowerCase().includes('guest quantity');
        const isCustomItem = event.eventTitle?.toLowerCase().includes('custom item');

        let metadata = event.metadata;
        if (metadata && typeof metadata === 'string') {
            try {
                metadata = JSON.parse(metadata);
            } catch (e) {
                console.error("Failed to parse metadata:", e);
            }
        }
        if (isVoucher && event.value) {
            return (
                <Text fontSize="sm" fontWeight="bold" color="purple.500">
                    {metadata?.type === 'redemption' ? 'Discount: ' : 'Credit: '}
                    ${Math.abs(Number(event.value)).toFixed(2)}
                    {metadata?.voucherCode && ` (Code: ${metadata.voucherCode})`}
                </Text>
            );
        }

        if (isGuestChange) {
            if (metadata && typeof metadata === 'object') {
                const originalQty = metadata.originalGuestQuantity || metadata.originalGuestQty ||
                    metadata.oldGuestQuantity || metadata.oldGuestQty;

                const newQty = metadata.newGuestQuantity || metadata.guestQuantity ||
                    metadata.newGuestQty || metadata.newGuests;

                if (originalQty !== undefined && newQty !== undefined) {
                    const origQtyNum = Number(originalQty);
                    const newQtyNum = Number(newQty);
                    const change = newQtyNum - origQtyNum;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const changeText = change > 0 ? `+${change}` : change;

                    return (
                        <Text fontSize="sm" color={change > 0 ? "green.500" : "red.500"}>
                            {/*Guest Quantity: {changeText} (from {origQtyNum} to {newQtyNum})*/}
                        </Text>
                    );
                }
            } else if (event.eventDescription) {
                const match = event.eventDescription.match(/from (\d+) to (\d+)/);
                if (match && match.length === 3) {
                    const originalQty = Number(match[1]);
                    const newQty = Number(match[2]);
                    const change = newQty - originalQty;
                    const changeText = change > 0 ? `+${change}` : change;

                    return (
                        <Text fontSize="sm" color={change > 0 ? "green.500" : "red.500"}>
                            Guest Quantity: {changeText} (from {originalQty} to {newQty})
                        </Text>
                    );
                }
            }
        }
        if (isAddOn && metadata && typeof metadata === 'object') {
            if ('addons' in metadata && Array.isArray(metadata.addons)) {
                return (
                    <Box fontSize="sm" mt={1}>
                        <Text fontWeight="medium">Add-ons Modified:</Text>
                        {metadata.addons.map((addon, idx) => (
                            <Text key={idx} pl={2}>
                                • {addon.name || addon.label || 'Add-on'}
                                {addon.quantity && ` (Qty: ${addon.quantity})`}
                                {addon.price && ` - $${Number(addon.price).toFixed(2)}`}
                            </Text>
                        ))}
                    </Box>
                );
            } else if ('originalAddonsTotal' in metadata && 'newAddonsTotal' in metadata) {
                const originalTotal = Number(metadata.originalAddonsTotal);
                const newTotal = Number(metadata.newAddonsTotal);
                const change = newTotal - originalTotal;
                const changeText = change > 0 ? `+$${change.toFixed(2)}` : `-$${Math.abs(change).toFixed(2)}`;

                return (
                    <Text fontSize="sm" color={change > 0 ? "green.500" : "red.500"}>
                        Addons total: {changeText} (from ${originalTotal.toFixed(2)} to ${newTotal.toFixed(2)})
                    </Text>
                );
            }
        }
        if (isCustomItem && metadata && typeof metadata === 'object') {
            if ('currentItems' in metadata && Array.isArray(metadata.currentItems)) {
                return (
                    <Box fontSize="sm" mt={1}>
                        <Text fontWeight="medium">Custom Items:</Text>
                        {metadata.currentItems.map((item, idx) => (
                            <Text key={idx} pl={2}>
                                • {item.name || 'Item'}
                                {item.quantity && ` (Qty: ${item.quantity})`}
                                {item.amount && ` - $${Number(item.amount).toFixed(2)}`}
                            </Text>
                        ))}
                    </Box>
                );
            } else if ('priceDifference' in metadata) {
                const diff = Number(metadata.priceDifference);
                return (
                    <Text fontSize="sm" color={diff > 0 ? "green.500" : "red.500"}>
                        Custom items adjustment: {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                    </Text>
                );
            }
        }
        if (event.value) {
            return (
                <Text fontSize="sm">
                    ${Math.abs(Number(event.value)).toFixed(2)}
                </Text>
            );
        }
        return null;
    };

    return (
        <Flex position="relative" pb={4}>
            <Box minW="60px" textAlign="right" mr={4}>
                <Text fontSize="sm" color="gray.500">
                    {format(new Date(event.createdAt), 'MMM')}
                </Text>
                <Text fontWeight="bold" fontSize="lg">
                    {format(new Date(event.createdAt), 'd')}
                </Text>
                <Text fontSize="sm" color="gray.500">
                    {format(new Date(event.createdAt), 'EEE')}
                </Text>
            </Box>

            <Box position="relative" mr={4}>
                <Box
                    position="absolute"
                    left="15px"
                    top="0"
                    w="2px"
                    h="100%"
                    bg="gray.300"
                    zIndex={-1}
                    display={isLast ? "none" : "block"}
                />
                <Flex
                    w="30px"
                    h="30px"
                    borderRadius="50%"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.300"
                    align="center"
                    justify="center"
                >
                    {icon}
                </Flex>
            </Box>
            <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                    {format(new Date(event.createdAt), 'MMM d, hh:mm a')}
                </Text>
                <Text fontWeight="bold" mb={1}>
                    {event.eventTitle}
                </Text>
                {event.status?.toLowerCase() === "created" && (
                    <Text fontSize="sm" borderRadius="md" mb={1}>
                        {event.createdBy}
                    </Text>
                )}

                {renderEventValue()}

                {event.to && (
                    <Text fontSize="sm" color="gray.600">
                        To: {event.to}
                    </Text>
                )}

                {event.eventDescription && (
                    <Text fontSize="sm" bg="gray.100" p={2} borderRadius="md" mt={2}>
                        {event.eventDescription}
                    </Text>
                )}
            </Box>
        </Flex>
    );
}