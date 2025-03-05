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
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spinner,
    Switch,
    Text,
    Textarea,
    useToast,
    VStack,
} from '@chakra-ui/react'
import DashboardLayout from "../../../components/DashboardLayout";
import {useRouter} from "next/router";
import {CardElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {AddIcon, DeleteIcon, MinusIcon} from "@chakra-ui/icons";
import {useGuest} from "../../../contexts/GuestContext";
import PurchaseSummary from '../../../components/PurchaseSummary';
import {useCart} from "../../../contexts/CartContext";

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

interface Tour {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    valuePerGuest?: number;
    description?: string;
}

interface FormData {
    quantity: number;
    date: string;
    time: string;
    organizerName: string;
    emailEnabled: boolean;
    organizerEmail: string;
    phoneEnabled: boolean;
    organizerPhone: string;
    organizerAttending: boolean;
    attendees: Array<{ name: string, info: string }>;
    purchaseTags: string;
    purchaseNote: string;
    selectedAddOns: SelectedAddOn[];
}

const PurchasePage = () => {
    const router = useRouter();
    const {id} = router.query;

    const stripe = useStripe();
    const elements = useElements();

    const [tour, setTour] = useState<Tour>(null);
    const [addons, setAddons] = useState<AddOn[]>([]);
    const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
    const [combinedAddons, setCombinedAddons] = useState<(AddOn & { quantity: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setLoadingAddons] = useState(true);

    const [schedules, setSchedules] = useState<{ value: string; label: string }[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [formDataMap, setFormDataMap] = useState<{ [key: string]: FormData }>({});
    const [selectedCartItemIndex, setSelectedCartItemIndex] = useState<number>(0);

    const [quantity, setQuantity] = useState(1);
    const [quantityError, setQuantityError] = useState(false);
    const [date, setDate] = useState('2024-12-20');
    const [time, setTime] = useState('08:00');
    const [organizerName, setOrganizerName] = useState("");
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [organizerEmail, setOrganizerEmail] = useState("");
    const [phoneEnabled, setPhoneEnabled] = useState(true);
    const [organizerPhone, setOrganizerPhone] = useState("");
    const [organizerAttending, setOrganizerAttending] = useState(true);
    const [attendees, setAttendees] = useState([{name: "", info: ""}, {name: "", info: ""}]);
    const [doNotCharge, setDoNotCharge] = useState(false);
    const [bookingFee, setBookingFee] = useState(false);
    const [gratuity, setGratuity] = useState('');
    const [internalNotesEnabled, setInternalNotesEnabled] = useState(true);
    const [purchaseTags, setPurchaseTags] = useState("");
    const [purchaseNote, setPurchaseNote] = useState("");
    const [isCustomLineItemsEnabled, setIsCustomLineItemsEnabled] = useState(false);
    const [customLineItems, setCustomLineItems] = useState([]);
    const [pickUpAddOn, setPickUpAddOn] = useState(0);
    const [privateTourAddOn, setPrivateTourAddOn] = useState(0);
    const toast = useToast();
    const [finalPrice, setFinalPrice] = useState(0);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [voucherValid, setVoucherValid] = useState(false);
    const [voucherError, setVoucherError] = useState('');
    const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const {tenantId} = useGuest();
    const {cart, setCart, addToCart, newCart, setNavigationSource, navigationSource, removeFromCart} = useCart();

    const [items, setItems] = useState([{id: 1, type: "Charge", amount: 0, quantity: 1, name: ""}]);

    const fetchAddOnsForTour = async (tourId: string) => {
        try {
            if (!tourId) return;
            
            setLoadingAddons(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${tourId}`);
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

    const saveCurrentFormData = () => {
        if (cart.length === 0) return;
        const currentCartItem = cart[selectedCartItemIndex];
        if (!currentCartItem) return;
        const formData: FormData = {
            quantity,
            date,
            time,
            organizerName,
            emailEnabled,
            organizerEmail,
            phoneEnabled,
            organizerPhone,
            organizerAttending,
            attendees,
            purchaseTags,
            purchaseNote,
            selectedAddOns,
        };
        setFormDataMap(prev => ({
            ...prev,
            [currentCartItem.id]: formData
        }));
    };

    const loadFormData = (index: number) => {
        if (cart.length === 0) return;
        const cartItem = cart[index];
        if (!cartItem) return;
        saveCurrentFormData();
        setSelectedCartItemIndex(index);
        const formData = formDataMap[cartItem.id];
        if (!formData) {
            const initialFormData: FormData = {
                quantity: 1,
                date: '2024-12-20',
                time: '08:00',
                organizerName: "",
                emailEnabled: true,
                organizerEmail: "",
                phoneEnabled: true,
                organizerPhone: "",
                organizerAttending: true,
                attendees: [
                    {name: "Guests #1", info: ""},
                    {name: "Guests #2", info: ""}
                ],
                purchaseTags: "",
                purchaseNote: "",
                selectedAddOns: selectedAddOns.length > 0 ? [...selectedAddOns] : [],
            };

            setFormDataMap(prev => ({
                ...prev,
                [cartItem.id]: initialFormData
            }));
            fetchAddOnsForTour(cartItem.id);
            return;
        }
        setQuantity(formData.quantity);
        setDate(formData.date);
        setTime(formData.time);
        setOrganizerName(formData.organizerName);
        setEmailEnabled(formData.emailEnabled);
        setOrganizerEmail(formData.organizerEmail);
        setPhoneEnabled(formData.phoneEnabled);
        setOrganizerPhone(formData.organizerPhone);
        setOrganizerAttending(formData.organizerAttending);
        setAttendees(formData.attendees);
        setPurchaseTags(formData.purchaseTags);
        setPurchaseNote(formData.purchaseNote);
        setSelectedAddOns(formData.selectedAddOns);
    };
    useEffect(() => {
        if (cart.length === 0) return;
        let hasNewItems = false;
        cart.forEach((item) => {
            if (!formDataMap[item.id]) {
                hasNewItems = true;
                const initialFormData: FormData = {
                    quantity: 1,
                    date: '2024-12-20',
                    time: '08:00',
                    organizerName: "",
                    emailEnabled: true,
                    organizerEmail: "",
                    phoneEnabled: true,
                    organizerPhone: "",
                    organizerAttending: true,
                    attendees: [
                        {name: "Guests #1", info: ""},
                        {name: "Guests #2", info: ""}
                    ],
                    purchaseTags: "",
                    purchaseNote: "",
                    selectedAddOns: selectedAddOns.length > 0 ? [...selectedAddOns] : [],
                };
                setFormDataMap(prev => ({
                    ...prev,
                    [item.id]: initialFormData
                }));
            }
        });
        if (hasNewItems) {
            const newItemIndex = cart.findIndex(item => !formDataMap[item.id]);
            if (newItemIndex >= 0) {
                setSelectedCartItemIndex(newItemIndex);
            }
        } else if (selectedCartItemIndex >= cart.length && cart.length > 0) {
            setSelectedCartItemIndex(0);
        }
    }, [cart]);
    useEffect(() => {
        if (cart.length > 0) {
            saveCurrentFormData();
        }
    }, [
        quantity, date, time, organizerName,
        emailEnabled, organizerEmail, phoneEnabled,
        organizerPhone, organizerAttending, attendees,
        purchaseTags, purchaseNote, selectedAddOns
    ]);

    const addItem = () => {
        setItems([...items, {id: Date.now(), type: "Charge", amount: 0, quantity: 1, name: ""}]);
    };

    const removeItem = (id) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const updateItem = (id, field, value) => {
        setItems(items.map((item) => (item.id === id ? {...item, [field]: value} : item)));
    };

    const handleSaveLineItems = () => {
        if (isCustomLineItemsEnabled) {
            setCustomLineItems([...items]);
        }
        setIsLineItemModalOpen(false);
    };

    const [isLineItemModalOpen, setIsLineItemModalOpen] = useState(false);
    const [lineItems, setLineItems] = useState([]);
    const [newLineItem, setNewLineItem] = useState({
        type: "Charge",
        amount: "",
        quantity: 1,
        isTaxed: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleAddLineItem = () => {
        setLineItems([...lineItems, newLineItem]);
        setIsLineItemModalOpen(false);
        setNewLineItem({type: "Charge", amount: "", quantity: 1, isTaxed: false});
    };

    const handleNavigateToProducts = () => {
        saveCurrentFormData();
        setNavigationSource('make-a-purchase');
        if (typeof window !== 'undefined') {
            localStorage.setItem('navigationSource', 'make-a-purchase');
            window.location.href = '/dashboard/choose-a-product?source=make-a-purchase';
        }
        router.push("/dashboard/choose-a-product");
    };

    useEffect(() => {
        if (!id) return;
        const fetchTourData = async () => {
            try {
                setLoading(true);
                const existingTour = cart.find(item => item.id === id);
                const directAccess = !navigationSource || navigationSource !== 'make-a-purchase';
                if (existingTour) {
                    setTour(existingTour);
                } else {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`);
                    if (!res.ok) throw new Error('Tour not found');
                    const data = await res.json();
                    setTour(data);
                    if (directAccess) {
                        newCart(data);
                    } else {
                        addToCart(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch tour:', error);
                toast({
                    title: "Error",
                    description: "Failed to load tour information",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchTourData();
    }, [id, cart, addToCart, newCart, navigationSource, toast]);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!id) return;
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/listScheduleByTourId/${id}`
                );
                const data = await res.json();

                const formattedSchedules = data.map((timeStr: string) => {

                    const testDate = `2024-12-20 ${timeStr}`;
                    const dateObj = new Date(testDate);

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleInfoChange = (index: number, newInfo: string) => {
        const updated = [...attendees];
        updated[index].info = newInfo;
        setAttendees(updated);
    };


    const basePrice = cart.length > 0 ? cart[0].price : 0;
    const totalBase = quantity * basePrice;

    useEffect(() => {
        const total = quantity * basePrice;
        const discountedTotal = total - voucherDiscount;
        setFinalPrice(discountedTotal > 0 ? discountedTotal : 0);
    }, [basePrice, voucherDiscount, quantity]);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        const finalDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
        return finalDate.toISOString();
    };

    useEffect(() => {
        if (addons.length === 0) return;
        const updatedCombinedAddons = selectedAddOns.reduce((acc: (AddOn & { quantity: number })[], selectedAddon) => {
            const addonInfo = addons.find(a => a.id === selectedAddon.addOnId);
            if (!addonInfo) return acc;

            if (addonInfo.type === 'CHECKBOX' && selectedAddon.checked) {
                acc.push({
                    ...addonInfo,
                    quantity: 1
                });
            } else if (addonInfo.type === 'SELECT' && selectedAddon.quantity > 0) {
                acc.push({
                    ...addonInfo,
                    quantity: selectedAddon.quantity
                });
            }
            return acc;
        }, []);
        setCombinedAddons(updatedCombinedAddons);
    }, [selectedAddOns, addons]);

    const addonsTotalPrice = combinedAddons.reduce(
        (sum, addon) => sum + (addon.price * addon.quantity),
        0
    );

    const finalTotalPrice = cart.length > 0
        ? ((cart[0].valuePerGuest || cart[0].price) * quantity) + addonsTotalPrice
        : 0;

    const totalWithDiscount = Math.max(finalTotalPrice - voucherDiscount, 0);

    const handleCreateReservationAndPay = async () => {
        saveCurrentFormData();
        setSubmitting(true);
        const formattedAttendees = [];
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
            cart.forEach((cartItem, index) => {
                const tourFormData = formDataMap[cartItem.id];
                if (!tourFormData) return;
                const tourAttendees = tourFormData.attendees.filter(a => a.name && a.name.trim() !== '');
                tourAttendees.forEach(attendee => {
                    formattedAttendees.push({
                        name: attendee.name,
                        additionalInfo: attendee.info || '',
                    });
                });
            });

            const reservationDateTime = combineDateAndTime(date, time);
            const requestBody = {
                tourId: cart[0].id,
                status: "ACCEPTED",
                userId: userId,
                reservation_date: reservationDateTime,
                addons: selectedAddOns.map(addonItem => {
                    if (addonItem.checked) {
                        return {
                            addonId: addonItem.addOnId,
                            value: "1",
                        };
                    } else if (addonItem.quantity > 0) {
                        return {
                            addonId: addonItem.addOnId,
                            value: addonItem.quantity.toString(),
                        };
                    }
                    return null;
                }).filter(Boolean),
                total_price: totalWithDiscount,
                guestQuantity: quantity,
                createdBy: "Back Office",
                purchaseTags,
                purchaseNote,
            };

            const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestBody),
            });

            if (!reservationResponse.ok) {
                throw new Error("Failed to create reservation.");
            }

            const reservationResult = await reservationResponse.json();
            reservationId = reservationResult.id;

            if (customLineItems.length > 0) {
                const customItemsPayload = customLineItems.map(item => ({
                    tenantId: tenantId,
                    tourId: id,
                    label: item.name,
                    description: item.type,
                    amount: item.amount,
                    quantity: item.quantity,
                }));

                const customItemsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-items`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({items: customItemsPayload, reservationId}),
                });

                if (!customItemsResponse.ok) throw new Error("Failed to create custom items.");
            }

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

                if (voucherValid && appliedVoucherCode) {
                    const redeemResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/redeem`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            code: appliedVoucherCode,
                            reservationId: reservationResult.id,
                        }),
                    });

                    if (redeemResponse.ok) {
                        toast({
                            title: 'Voucher Redeemed',
                            description: 'The voucher has been successfully redeemed.',
                            status: 'success',
                            duration: 4000,
                            isClosable: true,
                        });
                        setAppliedVoucherCode("")
                    } else {
                        throw new Error('Failed to redeem voucher');
                    }
                }

                toast({
                    title: "Reservation Complete!",
                    description: "Your reservation and payment were successful.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                setTimeout(() => {
                    router.push("/dashboard/purchases");
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
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/reservation');
    };

    const handleValidateVoucher = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({code: voucherCode}),
            });

            const data = await response.json();

            if (data.isValid) {
                setVoucherDiscount(data.amount);
                setVoucherValid(true);
                setVoucherError('');
                setAppliedVoucherCode(voucherCode);
                setVoucherCode('');
                toast({
                    title: 'Voucher Applied',
                    description: `Discount of $${data.amount} applied successfully!`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                setVoucherValid(false);
                setVoucherDiscount(0);
                setVoucherError(data.message || 'Invalid voucher');
                toast({
                    title: 'Invalid Voucher',
                    description: data.message || 'Voucher cannot be applied.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Failed to validate voucher:', error);
            setVoucherError('Failed to validate voucher.');
        }
    };

    useEffect(() => {
        const fetchInitialAddOns = async () => {
            const currentTourId = cart.length > 0 && selectedCartItemIndex < cart.length
                ? cart[selectedCartItemIndex].id
                : id;
            if (currentTourId) {
                await fetchAddOnsForTour(currentTourId);
            }
        };
        fetchInitialAddOns();
    }, [id, cart, selectedCartItemIndex, fetchAddOnsForTour]);

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

    if (cart.length === 0) {
        return (
            <DashboardLayout>
                <Box p={8} textAlign="center">
                    <Heading size="lg">Tour Not Found</Heading>
                    <Text>Please try selecting another tour.</Text>
                </Box>
            </DashboardLayout>
        );
    }


    const handleIncrement = (addonId) => {
        setSelectedAddOns((prev) => {
            const existingAddonIndex = prev.findIndex(addon => addon.addOnId === addonId);

            if (existingAddonIndex >= 0) {
                const updatedAddons = [...prev];
                updatedAddons[existingAddonIndex] = {
                    ...updatedAddons[existingAddonIndex],
                    quantity: (updatedAddons[existingAddonIndex].quantity || 0) + 1
                };
                return updatedAddons;
            } else {
                return [...prev, {
                    addOnId: addonId,
                    quantity: 1,
                    checked: false
                }];
            }
        });
    };

    const handleDecrement = (addonId) => {
        setSelectedAddOns((prev) => {
            const existingAddonIndex = prev.findIndex(addon => addon.addOnId === addonId);

            if (existingAddonIndex >= 0) {
                const updatedAddons = [...prev];
                const newQuantity = Math.max((updatedAddons[existingAddonIndex].quantity || 0) - 1, 0);

                if (newQuantity === 0) {
                    return prev.filter(addon => addon.addOnId !== addonId);
                } else {
                    updatedAddons[existingAddonIndex] = {
                        ...updatedAddons[existingAddonIndex],
                        quantity: newQuantity
                    };
                    return updatedAddons;
                }
            }
            return prev;
        });
    };

    const handleCheckboxChange = (addonId) => {
        setSelectedAddOns((prev) => {
            const existingAddonIndex = prev.findIndex(addon => addon.addOnId === addonId);

            if (existingAddonIndex >= 0) {
                const updatedAddons = [...prev];
                const newChecked = !updatedAddons[existingAddonIndex].checked;

                if (!newChecked) {
                    return prev.filter(addon => addon.addOnId !== addonId);
                } else {
                    updatedAddons[existingAddonIndex] = {
                        ...updatedAddons[existingAddonIndex],
                        checked: newChecked
                    };
                    return updatedAddons;
                }
            } else {
                return [...prev, {
                    addOnId: addonId,
                    quantity: 0,
                    checked: true
                }];
            }
        });
    };

    return (
        <DashboardLayout>
            <Box p={8}>
                <HStack justifyContent="space-between" mb={6}>
                    <Heading size="lg">Make a Purchase</Heading>
                </HStack>
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
                        <VStack spacing={4} align="stretch">
                            {addons.map(addon => (
                                <Flex key={addon.id} justify="space-between" align="center" gap={20}>
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold">{addon.label}</Text>
                                        <Text color="gray.500">${addon.price.toFixed(2)}</Text>
                                    </VStack>
                                    {addon.type === 'SELECT' ? (
                                        <Flex align="center">
                                            <Button size="sm" onClick={() => handleDecrement(addon.id)}
                                                    disabled={!selectedAddOns.find(s => s.addOnId === addon.id) ||
                                                        (selectedAddOns.find(s => s.addOnId === addon.id)?.quantity || 0) <= 0}>
                                                -
                                            </Button>
                                            <Input
                                                value={selectedAddOns.find(s => s.addOnId === addon.id)?.quantity || 0}
                                                readOnly
                                                w="50px"
                                                textAlign="center"
                                                mx={2}
                                            />
                                            <Button size="sm" onClick={() => handleIncrement(addon.id)}>
                                                +
                                            </Button>
                                        </Flex>
                                    ) : addon.type === 'CHECKBOX' ? (
                                        <Switch
                                            isChecked={selectedAddOns.find(s => s.addOnId === addon.id)?.checked || false}
                                            onChange={() => handleCheckboxChange(addon.id)}
                                        />
                                    ) : null}
                                </Flex>
                            ))}
                        </VStack>
                        {/*<HStack justify="space-between" mb={4}>*/}
                        {/*    <Text>6% Booking Fee</Text>*/}
                        {/*    <Switch*/}
                        {/*        isChecked={bookingFee}*/}
                        {/*        onChange={(e) => setBookingFee(e.target.checked)}*/}
                        {/*        colorScheme="blue"*/}
                        {/*    />*/}
                        {/*</HStack>*/}

                        {/*<FormControl mb={4}>*/}
                        {/*    <FormLabel>Gratuity (optional)</FormLabel>*/}
                        {/*    <Select*/}
                        {/*        placeholder="Select tip amount"*/}
                        {/*        value={gratuity}*/}
                        {/*        onChange={(e) => setGratuity(e.target.value)}*/}
                        {/*    >*/}
                        {/*        <option value="0">0%</option>*/}
                        {/*        <option value={(totalBase * 0.10).toFixed(2)}>10%</option>*/}
                        {/*        <option value={(totalBase * 0.15).toFixed(2)}>15%</option>*/}
                        {/*        <option value={(totalBase * 0.20).toFixed(2)}>20%</option>*/}
                        {/*    </Select>*/}
                        {/*</FormControl>*/}

                        <FormControl display="flex" alignItems="center" mb={4}>
                            <FormLabel mb="0" fontWeight="medium">
                                Custom Line Items
                            </FormLabel>
                            <Switch
                                isChecked={isCustomLineItemsEnabled}
                                onChange={(e) => setIsCustomLineItemsEnabled(e.target.checked)}
                                colorScheme="blue"
                                ml={4}
                            />
                        </FormControl>

                        {isCustomLineItemsEnabled && (
                            <Button onClick={() => setIsLineItemModalOpen(true)}>+ Line Item</Button>
                        )}

                        <Modal isOpen={isLineItemModalOpen} onClose={() => setIsLineItemModalOpen(false)} size="2xl">
                            <ModalOverlay/>
                            <ModalContent h={"500px"}>
                                <ModalHeader>Custom Line Items</ModalHeader>
                                <ModalCloseButton/>

                                <ModalBody>
                                    <Flex gap={4}>
                                        <Box flex="2" maxH="300px" overflowY="auto" pr={2} maxW={"300px"}>
                                            {items.map((item) => (
                                                <Box key={item.id} borderBottom="1px solid" borderColor="gray.200"
                                                     pb={3} mb={3}>
                                                    <HStack>
                                                        <Input
                                                            placeholder="Item"
                                                            value={item.name}
                                                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                                        />
                                                        <IconButton
                                                            icon={<DeleteIcon/>}
                                                            colorScheme="gray"
                                                            size="sm"
                                                            onClick={() => removeItem(item.id)} aria-label={'delete'}/>
                                                    </HStack>

                                                    <HStack mt={2}>
                                                        <Select
                                                            value={item.type}
                                                            onChange={(e) => updateItem(item.id, "type", e.target.value)}
                                                            width="100px"
                                                        >
                                                            <option value="Charge">Charge</option>
                                                            <option value="Discount">Discount</option>
                                                        </Select>

                                                        <Input
                                                            type="number"
                                                            placeholder="$"
                                                            width="80px"
                                                            value={item.amount}
                                                            onChange={(e) => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                                                        />

                                                        <HStack>
                                                            <IconButton
                                                                icon={<MinusIcon/>}
                                                                size="sm"
                                                                onClick={() => updateItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                                                                aria-label={'Decrease quantity'}
                                                            />
                                                            <Text>{item.quantity}</Text>
                                                            <IconButton
                                                                icon={<AddIcon/>}
                                                                size="sm"
                                                                onClick={() => updateItem(item.id, "quantity", item.quantity + 1)}
                                                                aria-label={'Increase quantity'}
                                                            />
                                                        </HStack>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </Box>

                                        <Box flex="1" bg="gray.100" p={4} borderRadius="md" h={"300px"} display="flex"
                                             flexDirection="column" justifyContent="space-between">
                                            <Text fontWeight="bold">Breakdown</Text>
                                            <HStack justify="space-between" mb={-10} spacing={2} mt={-8}>
                                                <Text>Guests (${basePrice} × {quantity})</Text>
                                                <Text fontWeight="semibold">${(quantity * basePrice).toFixed(2)}</Text>
                                            </HStack>
                                            {items.length > 0 && (
                                                <Box>
                                                    {items.map((item) => {
                                                        const totalItem = item.amount * item.quantity;
                                                        return (
                                                            <HStack key={item.id} justify="space-between">
                                                                <Text>
                                                                    {item.name || "Unnamed"} ({item.type === "Discount" ? "-" : ""}${item.amount} × {item.quantity})
                                                                </Text>
                                                                <Text
                                                                    fontWeight="semibold">{item.type === "Discount" ? "-" : ""}${totalItem.toFixed(2)}</Text>
                                                            </HStack>
                                                        );
                                                    })}
                                                </Box>
                                            )}

                                            <Divider my={2}/>
                                            <Text textAlign="right" fontWeight="bold" fontSize="lg">
                                                Total: ${(
                                                quantity * basePrice +
                                                items.reduce((acc, item) => {
                                                    const totalItem = item.amount * item.quantity;
                                                    return item.type === "Discount" ? acc - totalItem : acc + totalItem;
                                                }, 0)
                                            ).toFixed(2)}
                                            </Text>
                                        </Box>
                                    </Flex>
                                </ModalBody>

                                <ModalFooter>
                                    <Button variant="outline" onClick={addItem} leftIcon={<AddIcon/>}>
                                        Add Line Item
                                    </Button>
                                    <Button colorScheme="blue" ml={3} onClick={handleSaveLineItems}>
                                        Save
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>


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

                        {/*<Heading size="md" mb={4}>Attendee Info</Heading>*/}
                        {/*{attendees.map((attendee, i) => (*/}
                        {/*    <Box key={i} borderWidth="1px" borderRadius="md" p={4} mb={4}>*/}
                        {/*        <HStack spacing={4}>*/}
                        {/*            <Button*/}
                        {/*                variant="ghost"*/}
                        {/*                fontSize="2xl"*/}
                        {/*                onClick={() => setMainAttendeeIndex(i)}*/}
                        {/*                aria-label="Set as main attendee"*/}
                        {/*                border={mainAttendeeIndex === i ? "2px solid" : "none"}*/}
                        {/*                borderColor={mainAttendeeIndex === i ? "blue.500" : "transparent"}*/}
                        {/*                borderRadius="full"*/}
                        {/*                p={2}*/}
                        {/*            >*/}
                        {/*                🏳*/}
                        {/*            </Button>*/}
                        {/*            <Text fontWeight="medium">{attendee.name}</Text>*/}
                        {/*            <Input*/}
                        {/*                placeholder={`Guests #${i + 1}`}*/}
                        {/*                value={attendee.info}*/}
                        {/*                onChange={(e) => handleInfoChange(i, e.target.value)}*/}
                        {/*                variant="outline"*/}
                        {/*                w="200px"*/}
                        {/*            />*/}
                        {/*        </HStack>*/}
                        {/*    </Box>*/}
                        {/*))}*/}

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
                                    <Textarea
                                        value={purchaseNote}
                                        onChange={(e) => setPurchaseNote(e.target.value)}
                                        placeholder="Enter Notes"
                                    />
                                </FormControl>
                            </VStack>
                        )}

                        <Divider my={6}/>

                        <HStack justify="space-between">
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            <HStack spacing={4}>
                                <Button variant="outline" onClick={handleNavigateToProducts}>Add Another
                                    Product</Button>
                                <Button
                                    colorScheme="green"
                                    onClick={handleCreateReservationAndPay}
                                    loadingText="Processing Payment"
                                    isLoading={submitting}
                                    isDisabled={submitting}
                                >
                                    Pay US${(totalWithDiscount +
                                    items.reduce((acc, item) => {
                                        const totalItem = item.amount * item.quantity;
                                        return item.type === "Discount" ? acc - totalItem : acc + totalItem;
                                    }, 0)
                                ).toFixed(2)}
                                </Button>
                            </HStack>
                        </HStack>
                    </Box>

                    <Box w={{base: "100%", md: "400px"}} bg="white" p={6} borderRadius="md" boxShadow="sm">
                        <Heading size="md" mb={4}>Purchase Summary</Heading>
                        <PurchaseSummary
                            cart={cart}
                            date={date}
                            time={time}
                            quantity={quantity}
                            combinedAddons={combinedAddons}
                            isCustomLineItemsEnabled={isCustomLineItemsEnabled}
                            customLineItems={customLineItems}
                            voucherDiscount={voucherDiscount}
                            totalWithDiscount={totalWithDiscount}
                            items={items}
                            voucherCode={voucherCode}
                            setVoucherCode={setVoucherCode}
                            voucherError={voucherError}
                            handleValidateVoucher={handleValidateVoucher}
                            removeFromCart={removeFromCart}
                            selectedCartItemIndex={selectedCartItemIndex}
                            onSelectCartItem={loadFormData}
                            formDataMap={formDataMap}
                            addons={addons}
                        />
                    </Box>
                </Flex>
            </Box>
        </DashboardLayout>
    )
}

export default PurchasePage