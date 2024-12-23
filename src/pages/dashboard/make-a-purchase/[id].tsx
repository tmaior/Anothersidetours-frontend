import React, {useEffect, useState} from 'react'
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Select,
    Spinner,
    Switch,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react'
import DashboardLayout from "../../../components/DashboardLayout";
import {useRouter} from "next/router";
import {CardElement, useElements, useStripe} from '@stripe/react-stripe-js';

interface AddOn {
    id: string;
    tourId: string;
    label: string;
    description: string;
    type: 'CHECKBOX' | 'SELECT';
    price: number;
}

interface SelectedAddOn {
    addOnId: string;
    quantity: number;
    checked: boolean;
}

const PurchasePage = () => {
    const router = useRouter();
    const {id} = router.query;

    const stripe = useStripe();
    const elements = useElements();

    const [tour, setTour] = useState<any>(null);
    const [addons, setAddons] = useState<AddOn[]>([]);
    const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAddons, setLoadingAddons] = useState(true);

    const [schedules, setSchedules] = useState<{ value: string; label: string }[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);

    const [quantity, setQuantity] = useState(2);
    const [date, setDate] = useState('2024-12-20');
    const [time, setTime] = useState('08:00');

    const [organizerName, setOrganizerName] = useState("");
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [organizerEmail, setOrganizerEmail] = useState("");
    const [phoneEnabled, setPhoneEnabled] = useState(true);
    const [organizerPhone, setOrganizerPhone] = useState("");
    const [organizerAttending, setOrganizerAttending] = useState(true);

    const [attendees, setAttendees] = useState([
        {name: "Guests #1", info: ""},
        {name: "Guests #2", info: ""}
    ]);
    const [mainAttendeeIndex, setMainAttendeeIndex] = useState(0);

    const [doNotCharge, setDoNotCharge] = useState(false);

    const [bookingFee, setBookingFee] = useState(false);
    const [gratuity, setGratuity] = useState('');

    const [internalNotesEnabled, setInternalNotesEnabled] = useState(true);
    const [purchaseTags, setPurchaseTags] = useState("");
    const [purchaseNote, setPurchaseNote] = useState("");
    const [customLineItems, setCustomLineItems] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pickUpAddOn, setPickUpAddOn] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [privateTourAddOn, setPrivateTourAddOn] = useState(0);
    const toast = useToast();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchTour = async () => {
            try {
                if (!id) return;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`);
                if (!res.ok) throw new Error('Tour not found');
                const data = await res.json();
                setTour(data);
            } catch (error) {
                console.error('Failed to fetch tour:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [id]);

    useEffect(() => {
        const fetchAddOns = async () => {
            try {
                if (!id) return;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${id}`);
                const data = await res.json();
                setAddons(data);

                const initSelected = data.map((addon: AddOn) => ({
                    addOnId: addon.id,
                    quantity: 0,
                    checked: false
                }));
                setSelectedAddOns(initSelected);

                setLoadingAddons(false);
            } catch (error) {
                console.error('Failed to fetch addons:', error);
                setLoadingAddons(false);
            }
        };
        fetchAddOns();
    }, [id]);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!id) return;
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/listScheduleByTourId/${id}`
                );
                const data = await res.json();

                const formattedSchedules = data.map((timeStr: string) => {
                    let dateObj: Date;
                    const testDate = `2024-12-20 ${timeStr}`;
                    dateObj = new Date(testDate);

                    if (isNaN(dateObj.getTime())) {
                        return {
                            value: timeStr,
                            label: timeStr,
                        };
                    }

                    return {
                        value: timeStr,
                        label: dateObj.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        }),
                    };
                });
                setSchedules(formattedSchedules);
                setLoadingSchedules(false);
            } catch (error) {
                console.error('Failed to fetch schedules:', error);
                setLoadingSchedules(false);
            }
        };

        fetchSchedules();
    }, [id]);

    const handleInfoChange = (index: number, newInfo: string) => {
        const updated = [...attendees];
        updated[index].info = newInfo;
        setAttendees(updated);
    };

    const incrementAddon = (addonId: string) => {
        setSelectedAddOns((prev) =>
            prev.map((sel) =>
                sel.addOnId === addonId
                    ? {...sel, quantity: sel.quantity + 1}
                    : sel
            )
        );
    };

    const decrementAddon = (addonId: string) => {
        setSelectedAddOns((prev) =>
            prev.map((sel) =>
                sel.addOnId === addonId
                    ? {...sel, quantity: sel.quantity > 0 ? sel.quantity - 1 : 0}
                    : sel
            )
        );
    };

    const toggleCheckboxAddon = (addonId: string, newValue: boolean) => {
        setSelectedAddOns((prev) =>
            prev.map((sel) =>
                sel.addOnId === addonId
                    ? {...sel, checked: newValue}
                    : sel
            )
        );
    };

    const basePricePerGuest = 149;
    const basePrice = tour?.price || basePricePerGuest;
    const totalBase = quantity * basePrice;

    const dynamicAddOnsPrice = selectedAddOns.reduce((acc, selected) => {
        const addonInfo = addons.find((a) => a.id === selected.addOnId);
        if (!addonInfo) return acc;

        if (addonInfo.type === 'CHECKBOX') {
            return selected.checked ? acc + addonInfo.price : acc;
        }
        if (addonInfo.type === 'SELECT') {
            return acc + addonInfo.price * selected.quantity;
        }
        return acc;
    }, 0);

    const totalManualAddOns = pickUpAddOn * 50 + privateTourAddOn * 50;

    const gratuityAmount = gratuity !== '' ? parseFloat(gratuity) : 0;

    const feeAmount = bookingFee ? totalBase * 0.06 : 0;
    const grandTotalFinal = totalBase + dynamicAddOnsPrice + totalManualAddOns + gratuityAmount + feeAmount;
    const combineDateAndTime = (dateStr: string, timeStr: string): string => {
        const [year, month, day] = dateStr.split("-").map(Number);

        const amPmMatch = timeStr.match(/(AM|PM)$/i);

        let hour = 0;
        let minute = 0;

        if (amPmMatch) {
            const meridian = amPmMatch[1].toUpperCase();
            const timeWithoutAmPm = timeStr.replace(/(AM|PM)/i, '').trim();
            const [hStr, mStr] = timeWithoutAmPm.split(":");
            hour = parseInt(hStr, 10);
            minute = parseInt(mStr, 10);

            if (meridian === "PM" && hour < 12) {
                hour += 12;
            } else if (meridian === "AM" && hour === 12) {
                hour = 0;
            }
        } else {
            const [hStr, mStr] = timeStr.split(":");
            hour = parseInt(hStr, 10);
            minute = parseInt(mStr, 10);
        }

        const finalDate = new Date(year, (month - 1), day, hour, minute);
        return finalDate.toISOString();
    };
    const handleCreateReservationAndPay = async () => {
        if (!stripe || !elements) {
            alert("Stripe has not yet been loaded.");
            return;
        }

        let reservationId: string | null = null;
        let userId: string | null = null;

        try {
            const userPayload = {
                name: organizerName,
                email: emailEnabled ? organizerEmail : "",
                phone: phoneEnabled ? organizerPhone : "",
                selectedDate: combineDateAndTime(date, time),
                selectedTime: time,
                guestQuantity: quantity,
                statusCheckout: "PENDING",
            };

            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(userPayload),
            });

            if (!userResponse.ok) {
                throw new Error("Failed to create user.");
            }

            const userResult = await userResponse.json();
            userId = userResult.id;
            const updateUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({statusCheckout: "COMPLETED"}),
            });

            if (!updateUserResponse.ok) {
                throw new Error("Failed to update user status.");
            }

            const reservationDateTime = combineDateAndTime(date, time);

            const reservationData = {
                tourId: id,
                userId: userId,
                reservation_date: reservationDateTime,
                addons: selectedAddOns.map((sel) => ({
                    addonId: sel.addOnId,
                    quantity: sel.checked ? 1 : sel.quantity,
                })),
                total_price: grandTotalFinal,
                guestQuantity: quantity,
                status: "PENDING",

                purchaseTags,
                purchaseNote,
            };

            const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(reservationData),
            });

            if (!reservationResponse.ok) {
                throw new Error("Failed to create reservation.");
            }

            const reservationResult = await reservationResponse.json();
            reservationId = reservationResult.id;
            console.log("Reservation created with ID:", reservationId);

            if (!doNotCharge) {
                const setupIntentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-setup-intent`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({reservationId}),
                });

                if (!setupIntentRes.ok) {
                    throw new Error("Failed to create SetupIntent.");
                }

                const {clientSecret} = await setupIntentRes.json();

                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    throw new Error("CardElement is not available.");
                }

                const paymentMethodResponse = await stripe.confirmCardSetup(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: organizerName || "Guest Organizer",
                            email: emailEnabled ? organizerEmail : "",
                        },
                    },
                });

                if (paymentMethodResponse.error) {
                    throw new Error(paymentMethodResponse.error.message);
                }

                const paymentMethodId = paymentMethodResponse.setupIntent.payment_method;

                const savePMRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/save-payment-method`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({paymentMethodId, reservationId}),
                });

                if (!savePMRes.ok) {
                    throw new Error("Failed to save PaymentMethod.");
                }

                toast({
                    title: "Reservation Complete!",
                    description: "Your reservation and payment were successful.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                setTimeout(() => {
                    router.push("/dashboard/reservation");
                }, 1000);
            } else {
                alert("Reservation created without immediate charge (Do Not Charge).");
            }

        } catch (error) {
            console.error("Error creating reservation/payment:", error);
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("An unexpected error has occurred.");
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box p={8} textAlign="center">
                    <Spinner size="xl"/>
                    <Text mt={4}>Loading tour details...</Text>
                </Box>
            </DashboardLayout>
        );
    }

    if (!tour) {
        return (
            <DashboardLayout>
                <Box p={8} textAlign="center">
                    <Heading size="lg">Tour Not Found</Heading>
                    <Text>Please try selecting another tour.</Text>
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box p={8}>
                <Heading size="lg" mb={6}>Make a Purchase</Heading>
                <Flex direction={{base: 'column', md: 'row'}} gap={8}>

                    <Box flex="1" bg="gray.50" p={6} borderRadius="md" boxShadow="sm">
                        <FormControl mb={4}>
                            <FormLabel>Quantity</FormLabel>
                            <HStack>
                                <Button
                                    onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                                    variant="outline"
                                >
                                    -
                                </Button>
                                <Text>{quantity}</Text>
                                <Button
                                    onClick={() => setQuantity(quantity + 1)}
                                    variant="outline"
                                >
                                    +
                                </Button>
                                <Text>Guests</Text>
                            </HStack>
                        </FormControl>

                        <FormControl mb={4} w={"150px"}>
                            <FormLabel>Date</FormLabel>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Time</FormLabel>
                            {loadingSchedules ? (
                                <Spinner size="sm"/>
                            ) : schedules.length > 0 ? (
                                <Select
                                    placeholder="Select time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                >
                                    {schedules.map((s, i) => (
                                        <option key={i} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </Select>
                            ) : (
                                <Text>No schedules available</Text>
                            )}
                        </FormControl>

                        <Heading size="md" mt={8} mb={4}>Add-ons</Heading>
                        {!loadingAddons && addons.map((addon) => {
                            const selectedState = selectedAddOns.find((s) => s.addOnId === addon.id);
                            if (!selectedState) return null;

                            return (
                                <Box key={addon.id} mb={4}>
                                    <HStack justify="space-between">
                                        <Text>
                                            {addon.label} (US${addon.price})
                                        </Text>
                                        {addon.type === 'CHECKBOX' && (
                                            <Switch
                                                isChecked={selectedState.checked}
                                                onChange={(e) => toggleCheckboxAddon(addon.id, e.target.checked)}
                                                colorScheme="blue"
                                            />
                                        )}
                                        {addon.type === 'SELECT' && (
                                            <HStack>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => decrementAddon(addon.id)}
                                                >
                                                    -
                                                </Button>
                                                <Text>{selectedState.quantity}</Text>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => incrementAddon(addon.id)}
                                                >
                                                    +
                                                </Button>
                                            </HStack>
                                        )}
                                    </HStack>
                                    {addon.description && (
                                        <Text fontSize="sm" color="gray.600">
                                            {addon.description}
                                        </Text>
                                    )}
                                </Box>
                            );
                        })}

                        <HStack justify="space-between" mb={4}>
                            <Text>6% Booking Fee</Text>
                            <Switch
                                isChecked={bookingFee}
                                onChange={(e) => setBookingFee(e.target.checked)}
                                colorScheme="blue"
                            />
                        </HStack>

                        <FormControl mb={4}>
                            <FormLabel>Gratuity (optional)</FormLabel>
                            <Select
                                placeholder="Select tip amount"
                                value={gratuity}
                                onChange={(e) => setGratuity(e.target.value)}
                            >
                                <option value="0">0%</option>
                                <option value={(totalBase * 0.10).toFixed(2)}>10%</option>
                                <option value={(totalBase * 0.15).toFixed(2)}>15%</option>
                                <option value={(totalBase * 0.20).toFixed(2)}>20%</option>
                            </Select>
                        </FormControl>

                        <FormControl display="flex" alignItems="center" mb={4}>
                            <FormLabel mb="0" fontWeight="medium">
                                Custom Line Items
                            </FormLabel>
                            <Switch
                                isChecked={customLineItems}
                                onChange={(e) => setCustomLineItems(e.target.checked)}
                                colorScheme="blue"
                                ml={4}
                            />
                        </FormControl>

                        <Divider my={6}/>

                        <Heading size="md" mb={4}>Organizer Details</Heading>

                        <FormControl mb={4}>
                            <FormLabel>Organizer Name</FormLabel>
                            <Input
                                placeholder="John Doe"
                                value={organizerName}
                                onChange={(e) => setOrganizerName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl mb={4}>
                            <HStack justify="space-between">
                                <HStack>
                                    <Text fontWeight="medium">Email</Text>
                                    <Switch
                                        isChecked={emailEnabled}
                                        onChange={(e) => setEmailEnabled(e.target.checked)}
                                        colorScheme="blue"
                                    />
                                </HStack>
                                {emailEnabled && <Text color="red.500" fontSize="xl">•</Text>}
                            </HStack>
                            {emailEnabled && (
                                <Input
                                    placeholder="Email"
                                    mt={2}
                                    value={organizerEmail}
                                    onChange={(e) => setOrganizerEmail(e.target.value)}
                                />
                            )}
                        </FormControl>

                        <FormControl mb={4}>
                            <HStack justify="space-between">
                                <HStack>
                                    <Text fontWeight="medium">Phone Number</Text>
                                    <Switch
                                        isChecked={phoneEnabled}
                                        onChange={(e) => setPhoneEnabled(e.target.checked)}
                                        colorScheme="blue"
                                    />
                                </HStack>
                                {phoneEnabled && <Text color="red.500" fontSize="xl">•</Text>}
                            </HStack>
                            {phoneEnabled && (
                                <Input
                                    placeholder="(999) 999-9999"
                                    mt={2}
                                    value={organizerPhone}
                                    onChange={(e) => setOrganizerPhone(e.target.value)}
                                />
                            )}
                        </FormControl>

                        <FormControl mb={4}>
                            <HStack justify="space-between">
                                <Text fontWeight="medium">Organizer is attending</Text>
                                <Switch
                                    isChecked={organizerAttending}
                                    onChange={(e) => setOrganizerAttending(e.target.checked)}
                                    colorScheme="blue"
                                />
                            </HStack>
                        </FormControl>

                        <Divider my={6}/>

                        <Heading size="md" mb={4}>Attendee Info</Heading>
                        {attendees.map((attendee, i) => (
                            <Box key={i} borderWidth="1px" borderRadius="md" p={4} mb={4}>
                                <HStack spacing={4}>
                                    <Button
                                        variant="ghost"
                                        fontSize="2xl"
                                        onClick={() => setMainAttendeeIndex(i)}
                                        aria-label="Set as main attendee"
                                        border={mainAttendeeIndex === i ? "2px solid" : "none"}
                                        borderColor={mainAttendeeIndex === i ? "blue.500" : "transparent"}
                                        borderRadius="full"
                                        p={2}
                                    >
                                        🏳
                                    </Button>
                                    <Text fontWeight="medium">{attendee.name}</Text>
                                    <Input
                                        placeholder={`Guests #${i + 1}`}
                                        value={attendee.info}
                                        onChange={(e) => handleInfoChange(i, e.target.value)}
                                        variant="outline"
                                        w="200px"
                                    />
                                </HStack>
                            </Box>
                        ))}

                        <Heading size="md" mb={4}>Payment</Heading>

                        <FormControl display="flex" alignItems="center" mb={4}>
                            <Switch
                                isChecked={doNotCharge}
                                onChange={(e) => setDoNotCharge(e.target.checked)}
                                colorScheme="blue"
                                mr={2}
                            />
                            <FormLabel mb="0">Do Not Charge Card Now</FormLabel>
                        </FormControl>

                        {!doNotCharge && (
                            <Box mb={4}>
                                <Text mb={2}>Card Details</Text>
                                <div style={{
                                    border: '1px solid #9E9E9E',
                                    paddingBottom: '8px',
                                    marginBottom: '16px',
                                    padding: '4px 8px',
                                    width: '100%',
                                    borderRadius: '4px'
                                }}>
                                    <CardElement
                                        options={{
                                            hidePostalCode: true,
                                            style: {
                                                base: {
                                                    iconColor: '#0c0e0e',
                                                    color: '#000',
                                                    fontWeight: '500',
                                                    fontFamily: 'Arial, sans-serif',
                                                    fontSize: '16px',
                                                    fontSmoothing: 'antialiased',
                                                    '::placeholder': {
                                                        color: '#aab7c4',
                                                    },
                                                },
                                                invalid: {
                                                    color: '#9e2146',
                                                    iconColor: '#fa755a',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                                {errorMessage && (
                                    <Box mt={2}>
                                        <Alert status="error">
                                            <AlertIcon/>
                                            {errorMessage}
                                        </Alert>
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Divider my={6}/>

                        <FormControl display="flex" alignItems="center" mb={4}>
                            <Text mr={4} fontWeight="medium">Internal Notes</Text>
                            <Switch
                                isChecked={internalNotesEnabled}
                                onChange={(e) => setInternalNotesEnabled(e.target.checked)}
                                colorScheme="blue"
                            />
                        </FormControl>

                        {internalNotesEnabled && (
                            <VStack align="stretch" spacing={4} mb={4}>
                                <FormControl>
                                    <FormLabel>Purchase Tags</FormLabel>
                                    <Input
                                        placeholder="Tag"
                                        value={purchaseTags}
                                        onChange={(e) => setPurchaseTags(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Purchase Note</FormLabel>
                                    <Input
                                        placeholder=""
                                        value={purchaseNote}
                                        onChange={(e) => setPurchaseNote(e.target.value)}
                                    />
                                </FormControl>
                            </VStack>
                        )}

                        <Divider my={6}/>

                        <HStack justify="space-between">
                            <Button variant="outline">Cancel</Button>
                            <HStack spacing={4}>
                                <Button variant="outline">Add Another Product</Button>
                                <Button
                                    colorScheme="green"
                                    onClick={handleCreateReservationAndPay}
                                >
                                    Pay US${grandTotalFinal.toFixed(2)}
                                </Button>
                            </HStack>
                        </HStack>
                    </Box>

                    <Box w={{base: "100%", md: "400px"}} bg="white" p={6} borderRadius="md" boxShadow="sm">
                        <Heading size="md" mb={4}>Purchase Summary</Heading>
                        <Box bg="blue.50" p={4} borderRadius="md" mb={4}>
                            <Text fontWeight="bold">{tour.name}</Text>
                            <Text fontSize="sm">
                                {date} - {time}
                            </Text>
                            <Text mt={2}>
                                Guests ({quantity} × US${basePrice}) = US${(quantity * basePrice).toFixed(2)}
                            </Text>
                        </Box>
                        <Divider mb={4}/>
                        <Text fontWeight="bold" mb={2}>Grand Total</Text>
                        <Text fontSize="xl" mb={4}>US${grandTotalFinal.toFixed(2)}</Text>

                        <FormControl mb={4}>
                            <FormLabel>Code</FormLabel>
                            <HStack>
                                <Input placeholder="Enter code"/>
                                <Button>Apply Code</Button>
                            </HStack>
                        </FormControl>
                    </Box>
                </Flex>
            </Box>
        </DashboardLayout>
    )
}

export default PurchasePage