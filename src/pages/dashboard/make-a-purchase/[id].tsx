import React, {useCallback, useEffect, useState, useMemo} from 'react'
import {
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
    InputGroup, InputLeftElement,
    InputRightElement,
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
    useDisclosure,
    useToast,
    VStack,
    useBreakpointValue,
} from '@chakra-ui/react'
import DashboardLayout from "../../../components/DashboardLayout";
import {useRouter} from "next/router";
import {CardElement, CardNumberElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {AddIcon, CalendarIcon, DeleteIcon, MinusIcon} from "@chakra-ui/icons";
import {useGuest} from "../../../contexts/GuestContext";
import PurchaseSummary from '../../../components/PurchaseSummary';
import {useCart} from "../../../contexts/CartContext";
import axios from 'axios';
import PaymentWorkflow from "../../../components/PaymentWorkflow";
import CashPaymentModal from "../../../components/CashPaymentModal";
import DatePicker from "../../../components/TimePickerArrival";
import {CiSquarePlus} from "react-icons/ci";
import TimeSlotPicker from "../../../components/TimeSlotPicker";

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
    additionalInformation?: { [key: string]: string };
}

interface TierPriceEntry {
  id: string;
  tierPricingId: string;
  quantity: number;
  price: number;
  adjustmentType?: string;
  operation?: string; 
  adjustment?: number;
}

interface TierPricing {
  id: string;
  tourId: string;
  demographicId: string;
  pricingType: 'flat' | 'tiered';
  basePrice: number;
  tierEntries?: TierPriceEntry[];
  demographic?: {
    id: string;
    name: string;
  };
}

interface CustomLineItem {
    id: number | string;
    name: string;
    type: "Charge" | "Discount";
    amount: number;
    quantity: number;
}

const PurchasePage = () => {
    const router = useRouter();
    const {id} = router.query;

    const stripe = useStripe();
    const elements = useElements();
    const isMobileView = useBreakpointValue({ base: true, md: false });

    const [, setTour] = useState<Tour>(null);
    const [addons, setAddons] = useState<AddOn[]>([]);
    const [addonsMap, setAddonsMap] = useState<{ [key: string]: AddOn[] }>({});
    const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
    const [combinedAddons, setCombinedAddons] = useState<(AddOn & { quantity: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setLoadingAddons] = useState(true);

    const [schedulesMap, setSchedulesMap] = useState<{ [key: string]: { value: string; label: string }[] }>({});
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [formDataMap, setFormDataMap] = useState<{ [key: string]: FormData }>({});
    const [selectedCartItemIndex, setSelectedCartItemIndex] = useState<number>(0);

    const [quantity, setQuantity] = useState(1);
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [time, setTime] = useState('08:00');
    const [organizerName, setOrganizerName] = useState("");
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [organizerEmail, setOrganizerEmail] = useState("");
    const [phoneEnabled, setPhoneEnabled] = useState(true);
    const [organizerPhone, setOrganizerPhone] = useState("");
    const [organizerAttending, setOrganizerAttending] = useState(true);
    const [attendees, setAttendees] = useState([{name: "", info: ""}, {name: "", info: ""}]);
    const [doNotCharge, setDoNotCharge] = useState(false);
    const [bookingFee,] = useState(false);
    const [gratuity,] = useState('');
    const [internalNotesEnabled, setInternalNotesEnabled] = useState(true);
    const [purchaseTags, setPurchaseTags] = useState("");
    const [purchaseNote, setPurchaseNote] = useState("");
    const [isCustomLineItemsEnabled, setIsCustomLineItemsEnabled] = useState(false);
    const [customLineItems, setCustomLineItems] = useState<Record<string, CustomLineItem[]>>({});
    const [pickUpAddOn,] = useState(0);
    const [privateTourAddOn,] = useState(0);
    const toast = useToast();
    const [, setFinalPrice] = useState(0);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [voucherValid, setVoucherValid] = useState(false);
    const [voucherError, setVoucherError] = useState('');
    const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const {tenantId} = useGuest();
    const {
        cart,
        addToCart,
        newCart,
        setNavigationSource,
        navigationSource,
        removeFromCart,
        clearCart
    } = useCart();

    const [items, setItems] = useState<CustomLineItem[]>([
        { id: 1, type: "Charge", amount: 0, quantity: 1, name: "" }
    ]);
    const [additionalInformationQuestions, setAdditionalInformationQuestions] = useState([]);
    const [additionalInformationResponses, setAdditionalInformationResponses] = useState<{ [key: string]: string }>({});

    const [paymentWorkflowType, setPaymentWorkflowType] = useState<string>('now');
    const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
    const [cardNumber, setCardNumber] = useState<string>('');

    const [isCashModalOpen, setIsCashModalOpen] = useState<boolean>(false);
    const [cashAmountReceived, setCashAmountReceived] = useState<number>(0);

    const [invoiceData, setInvoiceData] = useState({
        daysBeforeEvent: 0,
        dueDate: '',
        message: ''
    });
    const {isOpen: isDatePickerOpen, onOpen: onDatePickerOpen, onClose: onDatePickerClose} = useDisclosure();

    const [isTimeslotModalOpen, setIsTimeslotModalOpen] = useState(false);
    const [newSelectedTime, setNewSelectedTime] = useState<string>('');
    const [tierPricing, setTierPricing] = useState<TierPricing[]>([]);
    const [selectedDemographic,] = useState<string>("");

    const getItemKey = (item: { id: string }, index: number): string => `${item.id}_${index}`;

    const getPricesForDatePicker = () => {
        if (cart.length === 0 || selectedCartItemIndex >= cart.length) return Array(31).fill(0);
        const currentItem = cart[selectedCartItemIndex];
        const pricePerGuest = getPriceForQuantity(quantity, currentItem.id);
        return Array(31).fill(pricePerGuest);
    };

    const handleDateSelect = (selectedDate: Date) => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
        onDatePickerClose();
    };

    useEffect(() => {
        if (date && paymentMethod === 'invoice') {
            const eventDate = new Date(date);

            if (invoiceData.daysBeforeEvent > 0) {
                const dueDateObj = new Date(eventDate);
                dueDateObj.setDate(eventDate.getDate() - invoiceData.daysBeforeEvent);
                setInvoiceData(prev => ({
                    ...prev,
                    dueDate: dueDateObj.toISOString().split('T')[0]
                }));
            } else {
                setInvoiceData(prev => ({
                    ...prev,
                    dueDate: eventDate.toISOString().split('T')[0]
                }));
            }
        }
    }, [date, time, paymentMethod, invoiceData.daysBeforeEvent]);

    useEffect(() => {
        if (paymentMethod !== 'invoice') {
            setInvoiceData({
                daysBeforeEvent: 0,
                dueDate: date ? new Date(date).toISOString().split('T')[0] : '',
                message: ''
            });
        }
    }, [paymentMethod, date]);

    const fetchAddOnsForTour = useCallback(async (tourId: string, itemKey?: string) => {
        try {
            if (!tourId) return;

            setLoadingAddons(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addons/byTourId/${tourId}`,{
                credentials: 'include',
            });
            const data = await res.json();

            const mapKey = itemKey || (cart.length > 0 && selectedCartItemIndex < cart.length ? 
                getItemKey(cart[selectedCartItemIndex], selectedCartItemIndex) : 
                tourId);
            setAddonsMap(prev => ({
                ...prev,
                [mapKey]: data
            }));
            setAddons(data);

            const existingFormData = formDataMap[mapKey];
            if (existingFormData && existingFormData.selectedAddOns && existingFormData.selectedAddOns.length > 0) {
                setSelectedAddOns(existingFormData.selectedAddOns);
            } else {
                const initSelected = data.map((addon: AddOn) => ({
                    addOnId: addon.id,
                    quantity: 0,
                    checked: false
                }));
                setSelectedAddOns(initSelected);

                if (cart.length > 0 && selectedCartItemIndex < cart.length) {
                    setFormDataMap(prev => ({
                        ...prev,
                        [mapKey]: {
                            ...prev[mapKey] || {
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
                            },
                            selectedAddOns: initSelected
                        }
                    }));
                }
            }

            setLoadingAddons(false);
            return data;
        } catch (error) {
            console.error("Error fetching add-ons:", error);
            return [];
        } finally {
            setLoadingAddons(false);
        }
    }, [formDataMap, cart, selectedCartItemIndex, quantity, date, time, organizerName, emailEnabled, organizerEmail, phoneEnabled, organizerPhone, organizerAttending, attendees, purchaseTags, purchaseNote]);

    const loadFormData = (index: number) => {
        if (cart.length === 0) return;
        const cartItem = cart[index];
        if (!cartItem) return;

        if (selectedCartItemIndex >= 0 && selectedCartItemIndex < cart.length) {
            const currentItem = cart[selectedCartItemIndex];
            const currentKey = getItemKey(currentItem, selectedCartItemIndex);
            
            setFormDataMap(prev => ({
                ...prev,
                [currentKey]: {
                    ...prev[currentKey],
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
                }
            }));
        }
        
        setSelectedCartItemIndex(index);

        const itemKey = getItemKey(cartItem, index);
        const formData = formDataMap[itemKey];
        
        if (!formData) {
            const initialFormData: FormData = {
                quantity: 1,
                date: new Date().toISOString().split('T')[0],
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
                selectedAddOns: [],
            };

            setFormDataMap(prev => ({
                ...prev,
                [itemKey]: initialFormData
            }));
            
            setQuantity(initialFormData.quantity);
            setDate(initialFormData.date);
            setTime(initialFormData.time);
            setOrganizerName(initialFormData.organizerName);
            setEmailEnabled(initialFormData.emailEnabled);
            setOrganizerEmail(initialFormData.organizerEmail);
            setPhoneEnabled(initialFormData.phoneEnabled);
            setOrganizerPhone(initialFormData.organizerPhone);
            setOrganizerAttending(initialFormData.organizerAttending);
            setAttendees(initialFormData.attendees);
            setPurchaseTags(initialFormData.purchaseTags);
            setPurchaseNote(initialFormData.purchaseNote);
            
            fetchAddOnsForTour(cartItem.id, itemKey);
            
            if (!schedulesMap[itemKey]) {
                fetchSchedules(cartItem.id, itemKey);
            }
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
        
        fetchAddOnsForTour(cartItem.id, itemKey);
        
        if (!schedulesMap[itemKey]) {
            fetchSchedules(cartItem.id, itemKey);
        }
    };

    useEffect(() => {
        if (cart.length === 0) return;
        
        let hasNewItems = false;
        cart.forEach((item, index) => {
            const itemKey = getItemKey(item, index);
            
            if (!formDataMap[itemKey]) {
                hasNewItems = true;
                const initialFormData: FormData = {
                    quantity: 1,
                    date: new Date().toISOString().split('T')[0],
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
                    selectedAddOns: [],
                };
                
                setFormDataMap(prev => ({
                    ...prev,
                    [itemKey]: initialFormData
                }));
                
                fetchAddOnsForTour(item.id, itemKey);
            }
        });
        
        if (hasNewItems) {
            const newItemIndex = cart.findIndex((item, index) => !formDataMap[getItemKey(item, index)]);
            if (newItemIndex >= 0) {
                setSelectedCartItemIndex(newItemIndex);
            }
        } else if (selectedCartItemIndex >= cart.length && cart.length > 0) {
            setSelectedCartItemIndex(0);
        }
    }, [cart, formDataMap, fetchAddOnsForTour]);

    useEffect(() => {
        if (cart.length > 0) {
            if (cart.length > 0 && selectedCartItemIndex < cart.length) {
                const currentItem = cart[selectedCartItemIndex];
                const itemKey = getItemKey(currentItem, selectedCartItemIndex);
                
                setFormDataMap(prev => ({
                    ...prev,
                    [itemKey]: {
                        ...prev[itemKey],
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
                    }
                }));
            }
        }
    }, [cart,
        quantity, date, time, organizerName,
        emailEnabled, organizerEmail, phoneEnabled,
        organizerPhone, organizerAttending, attendees,
        purchaseTags, purchaseNote,
        selectedCartItemIndex
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
        if (isCustomLineItemsEnabled && selectedCartItemIndex >= 0 && selectedCartItemIndex < cart.length) {
            const currentItem = cart[selectedCartItemIndex];
            const itemKey = getItemKey(currentItem, selectedCartItemIndex);
            
            setCustomLineItems(prev => ({
                ...prev,
                [itemKey]: [...items]
            }));
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
        if (typeof window !== 'undefined') {
            localStorage.setItem('navigationSource', 'make-a-purchase');
            window.location.href = '/dashboard/choose-a-product?source=make-a-purchase';
        }
        router.push("/dashboard/choose-a-product");
        setNavigationSource('make-a-purchase');
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
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`,{
                        credentials: 'include',
                    });
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

    const sortTimeSlots = (schedules: { value: string; label: string }[]): { value: string; label: string }[] => {
        return [...schedules].sort((a, b) => {
            const timeA = a.label.split(' ')[0] + ' ' + a.label.split(' ')[1];
            const timeB = b.label.split(' ')[0] + ' ' + b.label.split(' ')[1];

            const periodA = timeA.includes('AM') ? 'AM' : timeA.includes('PM') ? 'PM' : '';
            const periodB = timeB.includes('AM') ? 'AM' : timeB.includes('PM') ? 'PM' : '';

            if (periodA === 'AM' && periodB === 'PM') return -1;
            if (periodA === 'PM' && periodB === 'AM') return 1;

            if (periodA === periodB) {
                const timePartA = timeA.replace(periodA, '').trim();
                const timePartB = timeB.replace(periodB, '').trim();

                const [hoursA, minutesA] = timePartA.split(':').map(Number);
                const [hoursB, minutesB] = timePartB.split(':').map(Number);
                const normalizedHoursA = hoursA === 12 ? 0 : hoursA;
                const normalizedHoursB = hoursB === 12 ? 0 : hoursB;
                if (normalizedHoursA !== normalizedHoursB) {
                    return normalizedHoursA - normalizedHoursB;
                }
                return minutesA - minutesB;
            }
            return 0;
        });
    };

    useEffect(() => {
        const fetchSchedules = async (tourId: string, itemKey?: string) => {
            if (!tourId) return;
            try {
                setLoadingSchedules(true);
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/listScheduleByTourId/${tourId}`,
                    {
                        credentials: 'include',
                    }
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
                        }).replace(/^0/, ''),
                    };
                });
                
                const sortedSchedules = sortTimeSlots(formattedSchedules);
                const mapKey = itemKey || tourId;
                
                setSchedulesMap(prev => ({
                    ...prev,
                    [mapKey]: sortedSchedules
                }));
                
                setLoadingSchedules(false);
            } catch (error) {
                console.error(`Failed to fetch schedules for tour ${tourId}:`, error);
                const mapKey = itemKey || tourId;
                
                setSchedulesMap(prev => ({
                    ...prev,
                    [mapKey]: []
                }));
                setLoadingSchedules(false);
            }
        };
        if (id && typeof id === 'string') {
            fetchSchedules(id);
        }
    }, [id]);
    useEffect(() => {
        const fetchAllSchedules = async () => {
            if (cart.length === 0) return;
            
            const promises = cart.map(async (item) => {
                if (!schedulesMap[item.id]) {
                    await fetchSchedules(item.id);
                }
            });
            await Promise.all(promises);
        };
        fetchAllSchedules();
    }, [cart, schedulesMap]);
    const fetchSchedules = async (tourId: string, itemKey?: string) => {
        if (!tourId) return;
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/listScheduleByTourId/${tourId}`,
                {
                    credentials: 'include',
                }
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
                    }).replace(/^0/, ''),
                };
            });
            
            const sortedSchedules = sortTimeSlots(formattedSchedules);
            const mapKey = itemKey || tourId;
            
            setSchedulesMap(prev => ({
                ...prev,
                [mapKey]: sortedSchedules
            }));
            
            return sortedSchedules;
        } catch (error) {
            console.error(`Failed to fetch schedules for tour ${tourId}:`, error);
            const mapKey = itemKey || tourId;
            
            setSchedulesMap(prev => ({
                ...prev,
                [mapKey]: []
            }));
            return [];
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleInfoChange = (index: number, newInfo: string) => {
        const updated = [...attendees];
        updated[index].info = newInfo;
        setAttendees(updated);
    };

    const getPriceForQuantity = useCallback((quantity: number, tourId: string): number => {
        if (!tierPricing || tierPricing.length === 0) {
            return cart.length > 0 ? (cart.find(item => item.id === tourId)?.price || 0) : 0;
        }
        const pricingForTour = tierPricing.filter(tp => tp.tourId === tourId);
        
        if (!pricingForTour || pricingForTour.length === 0) {
            return cart.length > 0 ? (cart.find(item => item.id === tourId)?.price || 0) : 0;
        }
        const selectedPricing = selectedDemographic 
            ? pricingForTour.find(tp => tp.demographicId === selectedDemographic)
            : pricingForTour[0];
        
        if (!selectedPricing) {
            return cart.length > 0 ? (cart.find(item => item.id === tourId)?.price || 0) : 0;
        }
        if (selectedPricing.pricingType === 'flat') {
            return selectedPricing.basePrice;
        }
        if (selectedPricing.tierEntries && selectedPricing.tierEntries.length > 0) {
            const sortedTiers = [...selectedPricing.tierEntries].sort((a, b) => b.quantity - a.quantity);
            
            for (const tier of sortedTiers) {
                if (quantity >= tier.quantity) {
                    return tier.price;
                }
            }
        }

        return selectedPricing.basePrice;
    }, [tierPricing, selectedDemographic, cart]);
    useEffect(() => {
        const fetchTierPricingForAllItems = async () => {
            if (cart.length === 0) return;
            const promises = cart.map(async (item) => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${item.id}`,{
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setTierPricing(prev => {
                            const filtered = prev.filter(tp => tp.tourId !== item.id);
                            return [...filtered, ...data];
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching tier pricing for tour ${item.id}:`, error);
                }
            });
            await Promise.all(promises);
        };
        
        fetchTierPricingForAllItems();
    }, [cart]);
    const basePrice = useMemo(() => {
        if (cart.length === 0 || selectedCartItemIndex >= cart.length) return 0;
        const currentTourId = cart[selectedCartItemIndex]?.id;
        return getPriceForQuantity(quantity, currentTourId);
    }, [cart, selectedCartItemIndex, quantity, getPriceForQuantity]);
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
        try {
            const [year, month, day] = dateStr.split("-").map(Number);
            let hour = 0;
            let minute = 0;
            
            if (!timeStr) {
                return new Date(Date.UTC(year, month - 1, day, 0, 0)).toISOString();
            }
            
            const amPmMatch = timeStr.match(/(AM|PM)$/i);
            
            if (amPmMatch) {
                const meridian = amPmMatch[1].toUpperCase();
                const timeWithoutAmPm = timeStr.replace(/(AM|PM)/i, '').trim();
                const [hStr, mStr] = timeWithoutAmPm.split(":");
                
                if (!hStr || !mStr) {
                    return new Date(Date.UTC(year, month - 1, day, 0, 0)).toISOString();
                }
                
                hour = parseInt(hStr, 10);
                minute = parseInt(mStr, 10);
                
                if (isNaN(hour) || isNaN(minute)) {
                    return new Date(Date.UTC(year, month - 1, day, 0, 0)).toISOString();
                }
                if (meridian === "PM" && hour < 12) {
                    hour += 12;
                } else if (meridian === "AM" && hour === 12) {
                    hour = 0;
                }
            } else {
                const [hStr, mStr] = timeStr.split(":");
                
                if (!hStr || !mStr) {
                    return new Date(Date.UTC(year, month - 1, day, 0, 0)).toISOString();
                }
                
                hour = parseInt(hStr, 10);
                minute = parseInt(mStr, 10);
                
                if (isNaN(hour) || isNaN(minute)) {
                    return new Date(Date.UTC(year, month - 1, day, 0, 0)).toISOString();
                }
            }
            hour = Math.min(Math.max(hour, 0), 23);
            minute = Math.min(Math.max(minute, 0), 59);
            
            const finalDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
            if (isNaN(finalDate.getTime())) {
                return new Date().toISOString();
            }
            return finalDate.toISOString();
        } catch (error) {
            console.error("Error combining date and time:", error);
            return new Date().toISOString();
        }
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
        if (selectedCartItemIndex >= 0 && selectedCartItemIndex < cart.length) {
            const currentItem = cart[selectedCartItemIndex];
            const itemKey = getItemKey(currentItem, selectedCartItemIndex);
            setFormDataMap(prev => ({
                ...prev,
                [itemKey]: {
                    ...prev[itemKey],
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
                    additionalInformation: additionalInformationResponses
                }
            }));
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        if (isPurchaseNoteRequired() && (!purchaseNote || purchaseNote.trim() === "")) {
            toast({
                title: "Purchase Note Required",
                description: `A purchase note is required when using ${paymentMethod} as the payment method.`,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (paymentMethod === 'cash' && paymentWorkflowType === 'now' && cashAmountReceived === 0) {
            setIsCashModalOpen(true);
            return;
        }

        setSubmitting(true);
        const formattedAttendees = [];
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
                credentials: 'include',
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
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({statusCheckout: "COMPLETED"}),
            });

            if (!updateUserResponse.ok) {
                throw new Error("Failed to update user status.");
            }

            cart.forEach((cartItem,) => {
                const tourFormData = formDataMap[getItemKey(cartItem, selectedCartItemIndex)];
                if (!tourFormData) return;
                const tourAttendees = tourFormData.attendees?.filter(a => a.name && a.name.trim() !== '') || [];
                tourAttendees.forEach(attendee => {
                    formattedAttendees.push({
                        name: attendee.name,
                        additionalInfo: attendee.info || '',
                    });
                });
            });
            const hasAddOns = Object.entries(formDataMap).some(([key, data]) => {
                return data?.selectedAddOns && data.selectedAddOns.some(addon => 
                    addon.checked || addon.quantity > 0
                );
            });
            const cartPayload = cart.map((cartItem, index) => {
                const itemKey = getItemKey(cartItem, index);
                let formData = formDataMap[itemKey];
                if (!formData) {
                    formData = formDataMap[cartItem.id];
                }

                if (!formData) {
                    const alternativeKey = Object.keys(formDataMap).find(key => key.startsWith(cartItem.id));
                    if (alternativeKey) {
                        formData = formDataMap[alternativeKey];
                    }
                }
                if (!formData) {
                    return {
                        tourId: cartItem.id,
                        reservationData: {
                            status: "ACCEPTED",
                            reservation_date: combineDateAndTime(date, time),
                            guestQuantity: quantity,
                            purchaseTags: purchaseTags || "",
                            purchaseNote: purchaseNote || "",
                            total_price: parseFloat((cartItem.price * quantity).toFixed(2)),
                        },
                        addons: [],
                        total_price: parseFloat((cartItem.price * quantity).toFixed(2)),
                        guestQuantity: quantity,
                        createdBy: "Back Office",
                        purchaseTags: purchaseTags || "",
                        purchaseNote: purchaseNote || "",
                        customLineItems: []
                    };
                }
                const mappedAddons = [];
                
                if (formData.selectedAddOns && formData.selectedAddOns.length > 0) {
                    formData.selectedAddOns.forEach(addonItem => {
                        
                        if (addonItem.checked) {
                            mappedAddons.push({
                                addonId: addonItem.addOnId,
                                value: "1",
                                quantity: 1
                            });
                        } else if (addonItem.quantity && addonItem.quantity > 0) {
                            mappedAddons.push({
                                addonId: addonItem.addOnId,
                                value: addonItem.quantity.toString(),
                                quantity: addonItem.quantity
                            });
                        }
                    });
                }
                const itemTotalPrice = calculateItemTotalPrice(cartItem, formData, index);
                return {
                    tourId: cartItem.id,
                    reservationData: {
                        status: "ACCEPTED",
                        reservation_date: combineDateAndTime(formData.date, formData.time),
                        guestQuantity: formData.quantity,
                        purchaseTags: formData.purchaseTags,
                        purchaseNote: formData.purchaseNote,
                        total_price: parseFloat(itemTotalPrice.toFixed(2)),
                    },
                    addons: mappedAddons,
                    total_price: parseFloat(itemTotalPrice.toFixed(2)),
                    guestQuantity: quantity,
                    createdBy: "Back Office",
                    purchaseTags,
                    purchaseNote,
                    customLineItems: customLineItems[getItemKey(cartItem, index)] || []
                };
            });

            const requestBody = {
                cart: cartPayload,
                userId: userId,
                createdBy: "Back Office",
                paymentMethod: paymentMethod,
                cashReceived: paymentMethod === 'cash' ? cashAmountReceived : undefined,
                changeDue: paymentMethod === 'cash' ? (cashAmountReceived - totalWithDiscount) : undefined,
            };

            const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestBody),
            });

            if (!reservationResponse.ok) {
                throw new Error("Failed to create reservation.");
            }

            const reservationResults = await reservationResponse.json();

            for (const reservation of reservationResults) {
                const reservationId = reservation.id;

                if (purchaseNote && purchaseNote.trim() !== '') {
                    try {
                        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/purchase-notes`, {
                            reservationId,
                            description: purchaseNote,
                        },
                            {
                                withCredentials: true,
                            });
                    } catch (noteError) {
                        console.error("Error saving purchase note:", noteError);
                    }
                }

                const customLineItemsKey = Object.keys(customLineItems).find(key => key.startsWith(reservation.tourId + '_'));
                
                if (isCustomLineItemsEnabled && customLineItemsKey && customLineItems[customLineItemsKey] && customLineItems[customLineItemsKey].length > 0) {
                    const customItemsPayload = customLineItems[customLineItemsKey].map(item => ({
                        tenantId: tenantId,
                        tourId: reservation.tourId,
                        label: item.name,
                        description: item.type,
                        amount: item.amount,
                        quantity: item.quantity,
                    }));

                    const customItemsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-items`, {
                        method: "POST",
                        credentials: 'include',
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({items: customItemsPayload, reservationId}),
                    });

                    if (!customItemsResponse.ok) {
                        throw new Error("Failed to create custom items.");
                    }
                }

                if (emailEnabled && organizerEmail && organizerEmail.trim() !== "") {
                    try {
                        const currentTour = cart[selectedCartItemIndex];
                        
                        const emailTotals = [
                            { 
                                label: `${currentTour.name} (${quantity} guests)`, 
                                amount: `$${((currentTour.valuePerGuest || currentTour.price) * quantity).toFixed(2)}` 
                            }
                        ];
                        
                        if (combinedAddons.length > 0) {
                            emailTotals.push({
                                label: 'Add-ons',
                                amount: `$${addonsTotalPrice.toFixed(2)}`
                            });
                        }

                        if (isCustomLineItemsEnabled) {
                            const currentItem = cart[selectedCartItemIndex];
                            const itemKey = getItemKey(currentItem, selectedCartItemIndex);
                            
                            if (customLineItems[itemKey] && customLineItems[itemKey].length > 0) {
                                customLineItems[itemKey].forEach(item => {
                                    const itemTotal = item.amount * item.quantity;
                                    emailTotals.push({
                                        label: `${item.name || 'Custom item'} (${item.quantity}x)`,
                                        amount: `${item.type === 'Discount' ? '-' : ''}$${itemTotal.toFixed(2)}`
                                    });
                                });
                            }
                        }
                        
                        if (voucherDiscount > 0) {
                            emailTotals.push({
                                label: 'Discount',
                                amount: `-$${voucherDiscount.toFixed(2)}`
                            });
                        }
                        
                        emailTotals.push({
                            label: 'Total',
                            amount: `$${totalWithDiscount.toFixed(2)}`
                        });

                        const emailData = {
                            title: "Reservation Confirmed",
                            status: "approved",
                            description: "Your reservation has been confirmed!",
                            name: organizerName,
                            email: organizerEmail,
                            phone: phoneEnabled ? organizerPhone : "",
                            date: combineDateAndTime(date, time),
                            time: time,
                            duration: "2 hours",
                            quantity: quantity,
                            totals: emailTotals,
                            tourTitle: currentTour.name,
                            reservationImageUrl: currentTour.imageUrl,
                        };

                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/send-reservation-email`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                toEmail: organizerEmail,
                                emailData: {
                                    ...emailData,
                                    reservationId: reservationId,
                                    status: 'pending'
                                }
                            }),
                        });
                        
                        console.log('Confirmation email sent successfully');
                    } catch (emailError) {
                        console.error('Error sending confirmation email:', emailError);
                    }
                }

                if (paymentMethod === 'cash') {
                    const cashPaymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            amount: finalCartTotal,
                            payment_method: 'cash',
                            payment_status: 'paid',
                            payment_details: {
                                cash_received: cashAmountReceived,
                                change_due: cashAmountReceived - totalWithDiscount
                            },
                            reference_number: `CASH-${Date.now()}`,
                            is_split_payment: false,
                            created_by: "Back Office",
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            tenant: {
                                connect: {
                                    id: tenantId
                                }
                            },
                            reservation: {
                                connect: {
                                    id: reservationId
                                }
                            }
                        }),
                    });

                    if (!cashPaymentResponse.ok) {
                        throw new Error("Failed to record cash payment.");
                    }
                } else if (paymentMethod === 'check' || paymentMethod === 'invoice' || paymentMethod === 'other') {
                    const paymentDetails: Record<string, string | number> = {
                        paymentNote: purchaseNote
                    };
                    if (paymentMethod === 'invoice') {
                        paymentDetails.invoiceMessage = invoiceData.message;
                        let dueDateToUse = invoiceData.dueDate;
                        if (!dueDateToUse && date) {
                            const eventDate = new Date(combineDateAndTime(date, time));
                            if (invoiceData.daysBeforeEvent > 0) {
                                eventDate.setDate(eventDate.getDate() - invoiceData.daysBeforeEvent);
                            }
                            dueDateToUse = eventDate.toISOString().split('T')[0];
                        }

                        const paymentTransactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                amount: finalCartTotal, 
                                payment_method: 'invoice',
                                payment_status: 'pending',
                                payment_details: {
                                    note: purchaseNote,
                                    invoice_message: invoiceData.message
                                },
                                reference_number: `INV-${Date.now()}`,
                                is_split_payment: false,
                                due_date: dueDateToUse ? new Date(dueDateToUse).toISOString() : new Date(combineDateAndTime(date, time)).toISOString(),
                                invoice_message: invoiceData.message,
                                days_before_event: invoiceData.daysBeforeEvent,
                                created_by: "Back Office",
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                tenant: {
                                    connect: {
                                        id: tenantId
                                    }
                                },
                                reservation: {
                                    connect: {
                                        id: reservationId
                                    }
                                }
                            }),
                        });

                        if (!paymentTransactionResponse.ok) {
                            throw new Error("Failed to create invoice.");
                        }
                    } else {
                        const paymentTransactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                amount: finalCartTotal,
                                payment_method: paymentMethod,
                                payment_status: 'paid',
                                payment_details: {
                                    note: purchaseNote,
                                    payment_type: paymentMethod
                                },
                                reference_number: `${paymentMethod.toUpperCase()}-${Date.now()}`,
                                is_split_payment: false,
                                created_by: "Back Office",
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                tenant: {
                                    connect: {
                                        id: tenantId
                                    }
                                },
                                reservation: {
                                    connect: {
                                        id: reservationId
                                    }
                                }
                            }),
                        });
                        if (!paymentTransactionResponse.ok) {
                            throw new Error(`Failed to record ${paymentMethod} payment transaction.`);
                        }
                    }
                } else if (paymentMethod === 'credit_card') {

                    const paymentTransactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            amount: finalCartTotal,
                            payment_method: 'credit_card',
                            payment_status: 'pending',
                            payment_details: {
                                note: purchaseNote,
                                payment_type: paymentMethod
                            },
                            reference_number: `CC-${Date.now()}`,
                            is_split_payment: false,
                            created_by: "Back Office",
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            tenant: {
                                connect: {
                                    id: tenantId
                                }
                            },
                            reservation: {
                                connect: {
                                    id: reservationId
                                }
                            }
                        }),
                    });
                    
                    if (!paymentTransactionResponse.ok) {
                        throw new Error("Failed to create payment transaction for credit card.");
                    }

                    const data = await paymentTransactionResponse.json();

                    const transactionId = data.id;

                    const setupIntentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-setup-intent-for-transaction`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({transactionId}),
                    });

                    if (!setupIntentRes.ok) {
                        throw new Error("Failed to create SetupIntent.");
                    }

                    const {clientSecret} = await setupIntentRes.json();

                    let cardElement;
                    
                    if (isMobileView) {
                        cardElement = elements.getElement(CardNumberElement);
                        if (!cardElement) {
                            throw new Error("CardNumberElement is not available on mobile.");
                        }
                    } else {
                        cardElement = elements.getElement(CardElement);
                        if (!cardElement) {
                            throw new Error("CardElement is not available.");
                        }
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

                    const savePMRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/save-payment-method-for-transaction`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({paymentMethodId, transactionId}),
                    });

                    if (!savePMRes.ok) {
                        throw new Error("Failed to save PaymentMethod.");
                    }

                    const processPaymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/process-transaction-payment`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({transactionId}),
                    });

                    if (!processPaymentRes.ok) {
                        throw new Error("Failed to process payment.");
                    }

                    const processPaymentResult = await processPaymentRes.json();
                    
                    if (!processPaymentResult.success) {
                        throw new Error(`Payment failed with status: ${processPaymentResult.status}`);
                    }

                    const paymentTransactionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-transactions`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            amount: finalCartTotal,
                            payment_method: 'credit_card',
                            payment_status: 'paid',
                            payment_details: {
                                card_number: cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : "****",
                                cardholder_name: organizerName || "Guest Organizer",
                                stripe_payment_method_id: paymentMethodId
                            },
                            reference_number: `CC-${Date.now()}`,
                            stripe_payment_id: paymentMethodId,
                            is_split_payment: false,
                            created_by: "Back Office",
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            tenant: {
                                connect: {
                                    id: tenantId
                                }
                            },
                            reservation: {
                                connect: {
                                    id: reservationId
                                }
                            }
                        }),
                    });
                    
                    if (!paymentTransactionRes.ok) {
                        throw new Error("Failed to record credit card payment transaction.");
                    }

                    if (voucherValid && appliedVoucherCode) {
                        const redeemResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/redeem`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                code: appliedVoucherCode,
                                reservationId,
                            }),
                        });

                        if (!redeemResponse.ok) {
                            throw new Error('Failed to redeem voucher');
                        }
                        toast({
                            title: 'Voucher Redeemed',
                            description: 'The voucher has been successfully redeemed.',
                            status: 'success',
                            duration: 4000,
                            isClosable: true,
                        });
                        setAppliedVoucherCode("");
                    }
                }

                if (additionalInformationQuestions.length > 0) {
                    await Promise.all(
                        Object.entries(additionalInformationResponses).map(([additionalInformationId, value]) =>
                            fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer-additional-information`, {
                                method: "POST",
                                credentials: 'include',
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    additionalInformationId,
                                    reservationId,
                                    value,
                                }),
                            })
                        )
                    );
                }
            }

            toast({
                title: "Reservation Complete!",
                description: "Your reservation and payment were successful.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            clearCart();
            setTimeout(() => {
                router.push("/dashboard/purchases");
            }, 1000);
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
        clearCart();
        router.push('/dashboard/reservation');
    };

    const handleValidateVoucher = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/validate`, {
                method: 'POST',
                credentials: 'include',
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
                : typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
            const shouldFetchAddons =
                !formDataMap[currentTourId]?.selectedAddOns ||
                formDataMap[currentTourId]?.selectedAddOns.length === 0;
            if (currentTourId && shouldFetchAddons) {
                await fetchAddOnsForTour(currentTourId);
            }
        };
        fetchInitialAddOns();
    }, [fetchAddOnsForTour, id, cart, selectedCartItemIndex, formDataMap]);

    useEffect(() => {
        const fetchAdditionalInfo = async () => {
            if (cart.length === 0) return;

            const currentTourId = cart.length > 0 && selectedCartItemIndex < cart.length
                ? cart[selectedCartItemIndex].id
                : typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;

            if (!currentTourId) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/additional-information/tour/${currentTourId}`,
                    {
                        credentials: 'include',
                    });
                const data = await response.json();
                setAdditionalInformationQuestions(data);

                const initialValues = data.reduce(
                    (acc, input) => ({...acc, [input.id]: ""}),
                    {}
                );
                setAdditionalInformationResponses(initialValues);
            } catch (error) {
                console.error("Failed to fetch additional information questions:", error);
            }
        };

        fetchAdditionalInfo();
    }, [id, cart, selectedCartItemIndex]);

    const areAllAdditionalInfoFieldsFilled = () => {
        if (additionalInformationQuestions.length === 0) return true;

        return additionalInformationQuestions.every(question =>
            additionalInformationResponses[question.id] &&
            additionalInformationResponses[question.id].trim() !== ""
        );
    };
    const isPurchaseNoteRequired = () => {
        return ['check', 'invoice', 'other'].includes(paymentMethod.toLowerCase());
    };
    const areAllFieldsValid = () => {
        const additionalInfoValid = areAllAdditionalInfoFieldsFilled();
        const purchaseNoteValid = !isPurchaseNoteRequired() ||
            (internalNotesEnabled && purchaseNote && purchaseNote.trim() !== "");

        if (isPurchaseNoteRequired() && !internalNotesEnabled) {
            return false;
        }
        return additionalInfoValid && purchaseNoteValid;
    };

    const handleAdditionalInfoChange = (id: string, value: string) => {
        setAdditionalInformationResponses(prev => ({...prev, [id]: value}));
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return '';
        
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        
        const date = new Date(year, month - 1, day);

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return date.toLocaleDateString('en-US', options);
    };

    const handlePaymentWorkflowTypeChange = (type: string) => {
        setPaymentWorkflowType(type);
        if (type === 'later') {
            setDoNotCharge(true);
            setPaymentMethod('none');
        } else if (type !== 'now') {
            setDoNotCharge(true);
        }
        if (type !== 'now') {
            setIsCashModalOpen(false);
        }
    };

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
        if (method === 'credit_card') {
            setDoNotCharge(false);
        } else {
            setDoNotCharge(true);
        }
        if (['check', 'invoice', 'other'].includes(method.toLowerCase()) && !internalNotesEnabled) {
            setInternalNotesEnabled(true);
        }

        if (method !== 'cash') {
            setIsCashModalOpen(false);
        }
    };

    const handleCashPaymentComplete = (cashAmount: number) => {
        setCashAmountReceived(cashAmount);
        setIsCashModalOpen(false);
    };
    const getFormattedEventDate = (): string => {
        if (!date) return '';
        return combineDateAndTime(date, time);
    };

    const handleTimeSelect = (selectedTime: string) => {
        setNewSelectedTime(selectedTime);
    };
    const handleAddNewTime = () => {
        if (newSelectedTime && selectedCartItemIndex >= 0 && selectedCartItemIndex < cart.length) {
            const currentTourId = cart[selectedCartItemIndex].id;
            const currentSchedules = schedulesMap[currentTourId] || [];
            const formattedSchedules = [...currentSchedules, {
                value: convertTimeFormat(newSelectedTime),
                label: newSelectedTime
            }];

            const sortedSchedules = sortTimeSlots(formattedSchedules);
            setSchedulesMap(prev => ({
                ...prev,
                [currentTourId]: sortedSchedules
            }));
            setTime(convertTimeFormat(newSelectedTime));
            setIsTimeslotModalOpen(false);
            setNewSelectedTime('');
        }
    };
    const convertTimeFormat = (timeString: string) => {
        if (!timeString) return '';
        try {
            const timeParts = timeString.split(' ');
            if (timeParts.length !== 2) {
                return timeString;
            }
            
            const [time, period] = timeParts;
            const [hoursStr, minutesStr] = time.split(':');
            
            if (!hoursStr || !minutesStr) {
                return timeString;
            }
            
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            
            if (isNaN(hours) || isNaN(minutes)) {
                return timeString;
            }
            
            let formattedHours = hours;
            
            if (period === 'PM' && hours < 12) {
                formattedHours = hours + 12;
            } else if (period === 'AM' && hours === 12) {
                formattedHours = 0;
            }
            return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error("Error converting time format:", error);
            return timeString;
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
            let updatedAddons;

            if (existingAddonIndex >= 0) {
                updatedAddons = [...prev];
                updatedAddons[existingAddonIndex] = {
                    ...updatedAddons[existingAddonIndex],
                    quantity: (updatedAddons[existingAddonIndex].quantity || 0) + 1
                };
            } else {
                updatedAddons = [...prev, {
                    addOnId: addonId,
                    quantity: 1,
                    checked: false
                }];
            }
            if (cart.length > 0 && selectedCartItemIndex < cart.length) {
                const currentItem = cart[selectedCartItemIndex];
                const itemKey = getItemKey(currentItem, selectedCartItemIndex);
                setFormDataMap(prevMap => ({
                    ...prevMap,
                    [itemKey]: {
                        ...prevMap[itemKey],
                        selectedAddOns: updatedAddons
                    }
                }));
            }
            return updatedAddons;
        });
    };

    const handleDecrement = (addonId) => {
        setSelectedAddOns((prev) => {
            const existingAddonIndex = prev.findIndex(addon => addon.addOnId === addonId);
            let updatedAddons = [...prev];

            if (existingAddonIndex >= 0) {
                const newQuantity = Math.max((updatedAddons[existingAddonIndex].quantity || 0) - 1, 0);

                if (newQuantity === 0) {
                    updatedAddons = prev.filter(addon => addon.addOnId !== addonId);
                } else {
                    updatedAddons[existingAddonIndex] = {
                        ...updatedAddons[existingAddonIndex],
                        quantity: newQuantity
                    };
                }
                if (cart.length > 0 && selectedCartItemIndex < cart.length) {
                    const currentItem = cart[selectedCartItemIndex];
                    const itemKey = getItemKey(currentItem, selectedCartItemIndex);
                    setFormDataMap(prevMap => ({
                        ...prevMap,
                        [itemKey]: {
                            ...prevMap[itemKey],
                            selectedAddOns: updatedAddons
                        }
                    }));
                }
            }
            return updatedAddons;
        });
    };

    const handleCheckboxChange = (addonId) => {
        setSelectedAddOns((prev) => {
            const existingAddonIndex = prev.findIndex(addon => addon.addOnId === addonId);
            let updatedAddons;

            if (existingAddonIndex >= 0) {
                const newChecked = !prev[existingAddonIndex].checked;

                if (!newChecked) {
                    updatedAddons = prev.filter(addon => addon.addOnId !== addonId);
                } else {
                    updatedAddons = [...prev];
                    updatedAddons[existingAddonIndex] = {
                        ...updatedAddons[existingAddonIndex],
                        checked: newChecked
                    };
                }
            } else {
                updatedAddons = [...prev, {
                    addOnId: addonId,
                    quantity: 0,
                    checked: true
                }];
            }
            if (cart.length > 0 && selectedCartItemIndex < cart.length) {
                const currentItem = cart[selectedCartItemIndex];
                const itemKey = getItemKey(currentItem, selectedCartItemIndex);
                setFormDataMap(prevMap => ({
                    ...prevMap,
                    [itemKey]: {
                        ...prevMap[itemKey],
                        selectedAddOns: updatedAddons
                    }
                }));
            }
            return updatedAddons;
        });
    };

    const handleOpenLineItemModal = () => {
        if (selectedCartItemIndex >= 0 && selectedCartItemIndex < cart.length) {
            const currentItem = cart[selectedCartItemIndex];
            const itemKey = getItemKey(currentItem, selectedCartItemIndex);
            
            if (customLineItems[itemKey]) {
                setItems(customLineItems[itemKey]);
            } else {
                setItems([{id: 1, type: "Charge", amount: 0, quantity: 1, name: ""}]);
            }
        }
        setIsLineItemModalOpen(true);
    };

    const calculateCustomLineItemsTotal = (tourId: string, index: number) => {
        const itemKey = getItemKey({id: tourId}, index);
        
        if (!isCustomLineItemsEnabled || !customLineItems[itemKey]) return 0;
        
        return customLineItems[itemKey].reduce((acc, item) => {
            const totalItem = item.amount * item.quantity;
            return item.type === "Discount" ? acc - totalItem : acc + totalItem;
        }, 0);
    };

    const calculateTotalCartValue = () => {
        if (cart.length === 0) return 0;
        
        return cart.reduce((total, item, index) => {
            const itemKey = getItemKey(item, index);
            const itemFormData = formDataMap[itemKey] || {
                quantity: 1,
                selectedAddOns: []
            };
            const itemQuantity = itemFormData.quantity;
            const itemPrice = getPriceForQuantity(itemQuantity, item.id);
            const baseTotal = itemPrice * itemQuantity;

            let itemAddonTotal = 0;
            if (itemFormData.selectedAddOns) {
                for (const addon of itemFormData.selectedAddOns) {
                    const addonInfo = addonsMap[itemKey]?.find(a => a.id === addon.addOnId);
                    if (!addonInfo) continue;
                    
                    if (addonInfo.type === 'CHECKBOX' && addon.checked) {
                        itemAddonTotal += addonInfo.price;
                    } else if (addonInfo.type === 'SELECT' && addon.quantity > 0) {
                        itemAddonTotal += addonInfo.price * addon.quantity;
                    }
                }
            }
            
            const customLineItemsTotal = calculateCustomLineItemsTotal(item.id, index);
            return total + baseTotal + itemAddonTotal + customLineItemsTotal;
        }, 0);
    };
    const finalCartTotal = Math.max(calculateTotalCartValue() - voucherDiscount, 0);

    const calculateItemTotalPrice = (cartItem, formData, index) => {
        if (!cartItem || !formData) return 0;

        const itemPrice = getPriceForQuantity(formData.quantity, cartItem.id);
        const baseTotal = itemPrice * formData.quantity;
        const itemKey = getItemKey(cartItem, index);

        let itemAddonsTotal = 0;
        if (formData.selectedAddOns) {
            for (const addon of formData.selectedAddOns) {
                const addonInfo = addonsMap[itemKey]?.find(a => a.id === addon.addOnId);
                if (!addonInfo) continue;
                
                if (addonInfo.type === 'CHECKBOX' && addon.checked) {
                    itemAddonsTotal += addonInfo.price;
                } else if (addonInfo.type === 'SELECT' && addon.quantity > 0) {
                    itemAddonsTotal += addonInfo.price * addon.quantity;
                }
            }
        }

        const customItemsTotal = isCustomLineItemsEnabled && customLineItems[itemKey] 
            ? customLineItems[itemKey].reduce((sum, item) => {
                const itemAmount = item.amount * item.quantity;
                return item.type === "Discount" ? sum - itemAmount : sum + itemAmount;
            }, 0)
            : 0;

        const itemTotal = baseTotal + itemAddonsTotal + customItemsTotal;

        let itemDiscount = 0;
        if (voucherDiscount > 0) {
            const cartTotal = calculateTotalCartValue();
            if (cartTotal > 0) {
                const proportion = itemTotal / cartTotal;
                itemDiscount = voucherDiscount * proportion;
            }
        }
        return Math.max(itemTotal - itemDiscount, 0);
    }

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

                        <FormControl mb={4} w={{base: "100%", md: "300px"}}>
                            <FormLabel>Date</FormLabel>
                            <InputGroup>
                                <Input
                                    placeholder="Select date"
                                    value={formatDateDisplay(date)}
                                    onClick={onDatePickerOpen}
                                    readOnly
                                    cursor="pointer"
                                />
                                <InputRightElement>
                                    <CalendarIcon color="gray.500" onClick={onDatePickerOpen} cursor="pointer"/>
                                </InputRightElement>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    position="absolute"
                                    opacity="0"
                                    top="0"
                                    left="0"
                                    width="100%"
                                    height="100%"
                                    cursor="pointer"
                                    zIndex="-1"
                                />
                            </InputGroup>
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Time</FormLabel>
                            {loadingSchedules ? (
                                <Spinner size="sm"/>
                            ) : cart.length > 0 && schedulesMap[cart[selectedCartItemIndex]?.id]?.length > 0 ? (
                                <Select
                                    placeholder="Select time"
                                    value={time}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setTime(e.target.value);
                                        }
                                    }}
                                    isDisabled={!schedulesMap[cart[selectedCartItemIndex]?.id] || schedulesMap[cart[selectedCartItemIndex]?.id].length === 0}
                                >
                                    {(schedulesMap[cart[selectedCartItemIndex]?.id] || []).map((s, i) => (
                                        <option key={i} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </Select>
                            ) : (
                                <Input 
                                    value="No times available" 
                                    readOnly 
                                    disabled 
                                    bg="gray.100"
                                    _hover={{ cursor: "not-allowed" }}
                                />
                            )}
                        </FormControl>
                        <Button
                            variant="link"
                            size="xs"
                            onClick={() => setIsTimeslotModalOpen(true)}
                            color="black"
                            fontWeight={"bold"}
                        >
                            <CiSquarePlus size={"17px"}/>
                            Add a new time
                        </Button>

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
                            <Button onClick={handleOpenLineItemModal}>+ Line Item</Button>
                        )}

                        {additionalInformationQuestions.length > 0 && (
                            <>
                                <Heading size="md" mt={6} mb={4}>Questionnaire</Heading>
                                <Text fontSize="sm" color="gray.600" mb={4}>
                                    All fields are required. Please provide the requested information.
                                </Text>
                                <VStack spacing={4} align="stretch">
                                    {additionalInformationQuestions.map((question) => (
                                        <FormControl key={question.id} isRequired>
                                            <FormLabel fontWeight="bold">{question.title}</FormLabel>
                                            <Box position="relative">
                                                <Textarea
                                                    placeholder={`Enter ${question.title}`}
                                                    value={additionalInformationResponses[question.id] || ""}
                                                    onChange={(e) => handleAdditionalInfoChange(question.id, e.target.value)}
                                                    resize="none"
                                                    minHeight="6em"
                                                    maxHeight="12em"
                                                    maxLength={500}
                                                    _focus={{borderColor: "blue.400"}}
                                                    pr="30px"
                                                />
                                                {(!additionalInformationResponses[question.id] || additionalInformationResponses[question.id].trim() === "") && (
                                                    <Box
                                                        position="absolute"
                                                        top="10px"
                                                        right="10px"
                                                        w="8px"
                                                        h="8px"
                                                        borderRadius="50%"
                                                        bg="red.500"
                                                    />
                                                )}
                                            </Box>
                                        </FormControl>
                                    ))}
                                </VStack>
                            </>
                        )}

                        <Modal isOpen={isLineItemModalOpen} onClose={() => setIsLineItemModalOpen(false)} size={isMobileView ? "full" : "2xl"}>
                            <ModalOverlay/>
                            <ModalContent h={isMobileView ? "100%" : "500px"} maxH={isMobileView ? "100vh" : "80vh"}>
                                <ModalHeader>Custom Line Items</ModalHeader>
                                <ModalCloseButton/>

                                <ModalBody>
                                    <Flex direction={isMobileView ? "column" : "row"} gap={4}>
                                        <Box 
                                            flex="2" 
                                            maxH={isMobileView ? "none" : "300px"} 
                                            overflowY={isMobileView ? "visible" : "auto"} 
                                            pr={2} 
                                            maxW={isMobileView ? "100%" : "350px"}
                                            mb={isMobileView ? 4 : 0}
                                        >
                                            {items.map((item) => (
                                                <Box key={item.id} borderBottom="1px solid" borderColor="gray.200"
                                                     pb={3} mb={3}>
                                                    <HStack>
                                                        <Input
                                                            placeholder="Item"
                                                            value={item.name}
                                                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                                            w={isMobileView ? "85%" : "auto"}
                                                        />
                                                        <IconButton
                                                            icon={<DeleteIcon/>}
                                                            colorScheme="gray"
                                                            size="sm"
                                                            onClick={() => removeItem(item.id)} aria-label={'delete'}/>
                                                    </HStack>

                                                    <Flex 
                                                        mt={2} 
                                                        alignItems="center" 
                                                        justifyContent="space-between" 
                                                        flexWrap={isMobileView ? "wrap" : "nowrap"}
                                                        direction={isMobileView ? "column" : "row"}
                                                    >
                                                        <Select
                                                            value={item.type}
                                                            onChange={(e) => updateItem(item.id, "type", e.target.value)}
                                                            width={isMobileView ? "100%" : "110px"}
                                                            mr={isMobileView ? 0 : 2}
                                                            mb={isMobileView ? 2 : 0}
                                                            size="md"
                                                        >
                                                            <option value="Charge">Charge</option>
                                                            <option value="Discount">Discount</option>
                                                        </Select>
                                                        
                                                        <Flex 
                                                            w={isMobileView ? "100%" : "auto"} 
                                                            justify="space-between"
                                                            align="center"
                                                        >
                                                            <InputGroup size="md" width={isMobileView ? "48%" : "100px"} mr={2}>
                                                                <InputLeftElement pointerEvents="none">
                                                                    <Text color="gray.500">$</Text>
                                                                </InputLeftElement>
                                                                <Input
                                                                    type="number"
                                                                    paddingLeft="30px"
                                                                    placeholder="0.00"
                                                                    value={item.amount === 0 ? '' : item.amount}
                                                                    onChange={(e) => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                                                                />
                                                            </InputGroup>

                                                            <Flex alignItems="center" justifyContent="space-between" width={isMobileView ? "48%" : "auto"}>
                                                                <IconButton
                                                                    icon={<MinusIcon/>}
                                                                    size="sm"
                                                                    onClick={() => updateItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                                                                    aria-label={'Decrease quantity'}
                                                                    mr={1}
                                                                />
                                                                <Text mx={2} minWidth="20px" textAlign="center">{item.quantity}</Text>
                                                                <IconButton
                                                                    icon={<AddIcon/>}
                                                                    size="sm"
                                                                    onClick={() => updateItem(item.id, "quantity", item.quantity + 1)}
                                                                    aria-label={'Increase quantity'}
                                                                    ml={1}
                                                                />
                                                            </Flex>
                                                        </Flex>
                                                    </Flex>
                                                </Box>
                                            ))}
                                        </Box>

                                        <Box 
                                            flex="1" 
                                            bg="gray.100" 
                                            p={4} 
                                            borderRadius="md" 
                                            h={isMobileView ? "auto" : "300px"} 
                                            minH={isMobileView ? "200px" : "300px"}
                                            display="flex"
                                            flexDirection="column" 
                                            justifyContent="space-between"
                                        >
                                            <Text fontWeight="bold">Purchase Summary</Text>
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

                                <ModalFooter flexDirection={isMobileView ? "column" : "row"}>
                                    <Button 
                                        variant="outline" 
                                        onClick={addItem} 
                                        leftIcon={<AddIcon/>}
                                        w={isMobileView ? "100%" : "auto"}
                                        mb={isMobileView ? 2 : 0}
                                    >
                                        Add Line Item
                                    </Button>
                                    <Button 
                                        colorScheme="blue" 
                                        ml={isMobileView ? 0 : 3} 
                                        onClick={handleSaveLineItems}
                                        w={isMobileView ? "100%" : "auto"}
                                    >
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
                                    placeholder="Phone Number"
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

                        <Box 
                            mb={6}
                            bg="white" 
                            p={4}
                            borderRadius="md"
                            boxShadow="xs"
                            width="100%"
                        >
                            <PaymentWorkflow
                                onWorkflowTypeChange={handlePaymentWorkflowTypeChange}
                                onPaymentMethodChange={handlePaymentMethodChange}
                                cardNumber={cardNumber}
                                onCardNumberChange={(value) => setCardNumber(value)}
                                doNotCharge={doNotCharge}
                                onDoNotChargeChange={(value) => setDoNotCharge(value)}
                                errorMessage={errorMessage}
                                totalAmount={totalWithDiscount}
                                reservationDate={getFormattedEventDate()}
                                onInvoiceDataChange={(data) => setInvoiceData(data)}
                            />
                        </Box>
                        
                        {isPurchaseNoteRequired() && (
                            <Box mt={4} mb={2} p={3} bg="red.50" borderRadius="md" borderLeft="4px solid"
                                 borderColor="red.500">
                                <Text color="red.700" fontWeight="medium">
                                    Attention: The &quot;Purchase Note&quot; field is required when the payment method is {paymentMethod}.
                                </Text>
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
                                <FormControl isRequired={isPurchaseNoteRequired()}>
                                    <HStack justify="space-between">
                                        <FormLabel>
                                            Purchase Note
                                        </FormLabel>
                                        {isPurchaseNoteRequired() && purchaseNote.trim() === "" && (
                                            <Text color="red.500" fontSize="sm" fontWeight="bold">Required
                                                for {paymentMethod}</Text>
                                        )}
                                    </HStack>
                                    <Textarea
                                        value={purchaseNote}
                                        onChange={(e) => setPurchaseNote(e.target.value)}
                                        placeholder={isPurchaseNoteRequired() ? `Required for ${paymentMethod} payment` : "Enter Notes"}
                                        borderColor={isPurchaseNoteRequired() && purchaseNote.trim() === "" ? "red.300" : undefined}
                                        _hover={{borderColor: isPurchaseNoteRequired() && purchaseNote.trim() === "" ? "red.400" : undefined}}
                                        _focus={{borderColor: isPurchaseNoteRequired() && purchaseNote.trim() === "" ? "red.400" : "blue.400"}}
                                    />
                                    {isPurchaseNoteRequired() && purchaseNote.trim() === "" && (
                                        <Text color="red.500" fontSize="sm" mt={1}>
                                            This field is required when paying with {paymentMethod}
                                        </Text>
                                    )}
                                </FormControl>
                            </VStack>
                        )}

                        <Divider my={6}/>

                        <Flex 
                            direction={{base: "column", md: "row"}} 
                            justify={{base: "center", md: "space-between"}}
                            align="stretch"
                            w="100%"
                        >
                            <Button 
                                variant="outline" 
                                onClick={handleCancel}
                                mb={{base: 3, md: 0}}
                                w={{base: "100%", md: "auto"}}
                            >
                                Cancel
                            </Button>
                            
                            <Flex 
                                direction={{base: "column", md: "row"}}
                                gap={{base: 3, md: 4}}
                                w={{base: "100%", md: "auto"}}
                            >
                                <Button 
                                    variant="outline" 
                                    onClick={handleNavigateToProducts}
                                    w={{base: "100%", md: "auto"}}
                                    mb={{base: 3, md: 0}}
                                >
                                    Add Another Product
                                </Button>
                                <Button
                                    colorScheme="green"
                                    onClick={handleCreateReservationAndPay}
                                    loadingText="Processing Payment"
                                    isLoading={submitting}
                                    isDisabled={submitting || !areAllFieldsValid()}
                                    w={{base: "100%", md: "auto"}}
                                >
                                    Pay US${finalCartTotal.toFixed(2)}
                                </Button>
                            </Flex>
                        </Flex>
                    </Box>

                    <Box w={{base: "100%", md: "400px"}} bg="white" p={6} borderRadius="md">
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
                            addonsMap={addonsMap}
                            getPriceForQuantity={getPriceForQuantity}
                        />
                    </Box>
                </Flex>
            </Box>
            <CashPaymentModal
                isOpen={isCashModalOpen}
                onClose={() => setIsCashModalOpen(false)}
                totalAmount={finalCartTotal}
                onComplete={handleCashPaymentComplete}
            />
            <Modal isOpen={isDatePickerOpen} onClose={onDatePickerClose} size="xl">
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Select a Date</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <DatePicker
                            prices={getPricesForDatePicker()}
                            onDateSelect={handleDateSelect}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={isTimeslotModalOpen} onClose={() => setIsTimeslotModalOpen(false)} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Select a Time</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <TimeSlotPicker onTimeSelect={handleTimeSelect} />
                        {newSelectedTime && (
                            <Text mt={4} fontWeight="medium">Selected time: {newSelectedTime}</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="outline" mr={3} onClick={() => setIsTimeslotModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="blue" 
                            onClick={handleAddNewTime}
                            isDisabled={!newSelectedTime}
                        >
                            Add Time
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/*{tierPricing.length > 0 && (*/}
            {/*    <FormControl mb={4}>*/}
            {/*        <FormLabel>Demographic</FormLabel>*/}
            {/*        <Select */}
            {/*            value={selectedDemographic} */}
            {/*            onChange={(e) => setSelectedDemographic(e.target.value)}*/}
            {/*        >*/}
            {/*            {tierPricing.map(tp => (*/}
            {/*                <option key={tp.demographicId} value={tp.demographicId}>*/}
            {/*                    {tp.demographic?.name || 'Unknown Demographic'}*/}
            {/*                </option>*/}
            {/*            ))}*/}
            {/*        </Select>*/}
            {/*    </FormControl>*/}
            {/*)}*/}
        </DashboardLayout>
    )
}

export default PurchasePage