import React, {useEffect, useState} from 'react'
import {
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
    VStack,
} from '@chakra-ui/react'
import DashboardLayout from "../../../components/DashboardLayout";
import {useRouter} from "next/router";

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

    const [quantity, setQuantity] = useState(2)
    const [date, setDate] = useState('2024-12-20')
    const [time, setTime] = useState('08:00')
    const [pickUpAddOn, setPickUpAddOn] = useState(0)
    const [bookingFeePercent, setBookingFeePercent] = useState(0)
    const [gratuity, setGratuity] = useState('')
    const [paymentWorkflow, setPaymentWorkflow] = useState("Now")
    const [paymentMethod, setPaymentMethod] = useState("Credit Card")
    const [cardNumber, setCardNumber] = useState("")
    const [doNotCharge, setDoNotCharge] = useState(false)
    const [internalNotesEnabled, setInternalNotesEnabled] = useState(true)
    const [purchaseTags, setPurchaseTags] = useState("")
    const [purchaseNote, setPurchaseNote] = useState("")

    const isCreditCardMethod = paymentMethod === "Credit Card"
    const isCreditCardRequired = isCreditCardMethod && !doNotCharge && cardNumber.trim() === ""

    const [privateTourAddOn, setPrivateTourAddOn] = useState(0);
    const [bookingFee, setBookingFee] = useState(false)

    const basePricePerGuest = 149
    const totalBase = quantity * basePricePerGuest
    const totalAddOns = pickUpAddOn * 50 + privateTourAddOn * 50
    const gratuityAmount = gratuity !== '' ? parseFloat(gratuity) : 0
    const grandTotal = totalBase + totalAddOns + gratuityAmount
    const feeAmount = bookingFee ? totalBase * 0.06 : 0

    const [customLineItems, setCustomLineItems] = useState(false)
    const [emailEnabled, setEmailEnabled] = useState(true)
    const [phoneEnabled, setPhoneEnabled] = useState(true)
    const [organizerAttending, setOrganizerAttending] = useState(true)
    const [mainAttendeeIndex, setMainAttendeeIndex] = useState(0)
    const [attendees, setAttendees] = useState([
        {name: "Guests #1", info: ""},
        {name: "Guests #2", info: ""}
    ])
    const [addons, setAddons] = useState<AddOn[]>([]);
    const selects = addons.filter((addon) => addon.type === 'SELECT');
    const checkboxes = addons.filter((addon) => addon.type === 'CHECKBOX');
    const orderedAddons = [...selects, ...checkboxes];
    const [loadingAddons, setLoadingAddons] = useState(true);

    const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);

    const handleNameChange = (index, newName) => {
        const updated = [...attendees]
        updated[index].name = newName
        setAttendees(updated)
    }

    const handleInfoChange = (index, newInfo) => {
        const updated = [...attendees]
        updated[index].info = newInfo
        setAttendees(updated)
    }

    const router = useRouter();
    const {id} = router.query;
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);

    useEffect(() => {
        const fetchTour = async () => {
            try {
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

        if (id) {
            fetchTour();
        }
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

                const formattedSchedules = data.map((time) => {
                    const datetime = `2024-12-20 ${time}`;
                    const dateObj = new Date(datetime);

                    return {
                        value: time,
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

    const basePrice = tour.price || basePricePerGuest
    const totalBaseFinal = quantity * basePrice
    const gratuityAmountFinal = gratuity !== '' ? parseFloat(gratuity) : 0
    const grandTotalFinal = totalBaseFinal + dynamicAddOnsPrice + gratuityAmountFinal

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
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                        </FormControl>
                        <FormControl mb={4}>
                            <FormLabel>Time</FormLabel>
                            {schedules.length > 0 ? (
                                <Select
                                    placeholder="Select time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                >
                                    {schedules.map((schedule, index) => (
                                        <option key={index} value={schedule.value}>
                                            {schedule.label}
                                        </option>
                                    ))}
                                </Select>
                            ) : (
                                <Text>No schedules available</Text>
                            )}
                        </FormControl>
                        <Heading size="md" mt={8} mb={4}>Add-ons</Heading>
                        {!loadingAddons && (
                            <>
                                {(() => {
                                    const selects = addons.filter((addon) => addon.type === 'SELECT');
                                    const checkboxes = addons.filter((addon) => addon.type === 'CHECKBOX');
                                    const orderedAddons = [...selects, ...checkboxes];

                                    return orderedAddons.map((addon) => {
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
                                                            <Button variant="outline"
                                                                    onClick={() => decrementAddon(addon.id)}>
                                                                -
                                                            </Button>
                                                            <Text>{selectedState.quantity}</Text>
                                                            <Button variant="outline"
                                                                    onClick={() => incrementAddon(addon.id)}>
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
                                    });
                                })()}
                            </>
                        )}
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
                                <option value={(totalBaseFinal * 0.10).toFixed(2)}>10%</option>
                                <option value={(totalBaseFinal * 0.15).toFixed(2)}>15%</option>
                                <option value={(totalBaseFinal * 0.20).toFixed(2)}>20%</option>
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
                        <HStack mb={4}>
                            <FormControl>
                                <FormLabel>Name</FormLabel>
                                <Select defaultValue="Guests #1">
                                    <option>Guests #1</option>
                                    <option>Guests #2</option>
                                    <option>Guests #3</option>
                                </Select>
                            </FormControl>
                            <Button variant="outline" colorScheme="blue" alignSelf="flex-end" mt="auto">
                                Search Customers
                            </Button>
                        </HStack>
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
                                <Input placeholder="Email" mt={2}/>
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
                                <Input placeholder="Phone Number" mt={2}/>
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

                                    <Text fontWeight="medium">Guests</Text>
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
                        {isCreditCardMethod && (
                            <FormControl display="flex" alignItems="center" mb={4}>
                                <Switch
                                    isChecked={doNotCharge}
                                    onChange={(e) => setDoNotCharge(e.target.checked)}
                                    colorScheme="blue"
                                    mr={2}
                                />
                                <FormLabel mb="0">Do Not Charge Card Now</FormLabel>
                            </FormControl>
                        )}
                        {isCreditCardMethod && !doNotCharge && (
                            <Box mb={4}>
                                {isCreditCardRequired && (
                                    <Text color="red.500" mb={1}>
                                        Credit Card is required
                                    </Text>
                                )}
                                <Input
                                    placeholder="Número do cartão"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    borderColor={isCreditCardRequired ? "red.500" : "gray.200"}
                                />
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
                                <Button colorScheme="green">US${grandTotalFinal.toFixed(2)}</Button>
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
                                Guests ({quantity} × US${basePrice}) = US${totalBaseFinal.toFixed(2)}
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