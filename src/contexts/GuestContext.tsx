import React, {createContext, ReactNode, useContext, useState, useEffect} from "react";
import { parseCookies, setCookie } from "nookies";

export interface ScheduleItem {
    name: string;
    startTime: string | null;
    startPeriod: string;
    endTime: string | null;
    endPeriod: string;
    days?:  Record<string, boolean>
    timeSlots?: string[];
}

interface GuestContextType {
    schedule: ScheduleItem[];
    setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
    guestQuantity: number;
    setGuestQuantity: React.Dispatch<React.SetStateAction<number>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    phone: string;
    setPhone: React.Dispatch<React.SetStateAction<string>>;
    selectedDate: Date | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
    selectedTime: string | null;
    setSelectedTime: React.Dispatch<React.SetStateAction<string | null>>;
    resetGuestQuantity: () => void;
    detailedAddons: Array<{ id: string; label: string; type: string; quantity: number; price: number; total: number }>;
    setDetailedAddons: React.Dispatch<React.SetStateAction<Array<{
        id: string;
        label: string;
        type: string;
        quantity: number;
        price: number;
        total: number
    }>>>;
    tenantId: string;
    setTenantId: React.Dispatch<React.SetStateAction<string>>;
    tourId: string;
    setTourId: React.Dispatch<React.SetStateAction<string>>;
    userId: string;
    setUserId: React.Dispatch<React.SetStateAction<string>>;
    reservationId: string;
    setReservationId: React.Dispatch<React.SetStateAction<string>>;
    // cardNumber: string;
    // setCardNumber: React.Dispatch<React.SetStateAction<string>>;
    // expiryDate: string;
    // setExpiryDate: React.Dispatch<React.SetStateAction<string>>;
    // cvc: string;
    // setCvc: React.Dispatch<React.SetStateAction<string>>;
    includedItems: string[];
    setIncludedItems: React.Dispatch<React.SetStateAction<string[]>>;
    notIncludedItems: string[];
    setNotIncludedItems: React.Dispatch<React.SetStateAction<string[]>>;
    bringItems: string[];
    setBringItems: React.Dispatch<React.SetStateAction<string[]>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    operationProcedures: string;
    setOperationProcedures: React.Dispatch<React.SetStateAction<string>>;
    eventDuration: string;
    setEventDuration: React.Dispatch<React.SetStateAction<string>>;
    guestLimit: number;
    setGuestLimit: React.Dispatch<React.SetStateAction<number>>;
    earlyArrival: boolean;
    setEarlyArrival: React.Dispatch<React.SetStateAction<boolean>>;
    imageFile: File | null;
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
    imagePreview: string | null;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    imageUrl: string | null;
    setImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
    price: number;
    setPrice: (price: number) => void;
    cancellationPolicy: string;
    setCancellationPolicy: (value: string) => void;
    considerations: string;
    setConsiderations: (value: string) => void;
    minPerReservationLimit: number;
    setMinPerReservationLimit: React.Dispatch<React.SetStateAction<number>>;
    maxPerReservationLimit: number;
    setMaxPerReservationLimit: React.Dispatch<React.SetStateAction<number>>;
    minPerEventLimit: number;
    setMinPerEventLimit: React.Dispatch<React.SetStateAction<number>>;
    maxPerEventLimit: number;
    setMaxPerEventLimit: React.Dispatch<React.SetStateAction<number>>;
    notifyStaffValue: number;
    setNotifyStaffValue: React.Dispatch<React.SetStateAction<number>>;
    notifyStaffUnit: string;
    setNotifyStaffUnit: React.Dispatch<React.SetStateAction<string>>;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const useGuest = (): GuestContextType => {
    const context = useContext(GuestContext);
    if (!context) {
        throw new Error("useGuest must be used within a GuestProvider");
    }
    return context;
}

export function GuestProvider({children}: { children: ReactNode }) {
    const [guestQuantity, setGuestQuantity] = useState<number>(0);
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [tenantId, setTenantIdState] = useState<string | null>(null);
    const [tourId, setTourId] = useState("");
    const [userId, setUserId] = useState("");
    const [detailedAddons, setDetailedAddons] = useState([]);
    const [reservationId, setReservationId] = useState("");
    const [includedItems, setIncludedItems] = useState<string[]>([]);
    const [notIncludedItems, setNotIncludedItems] = useState<string[]>([]);
    const [bringItems, setBringItems] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [operationProcedures, setOperationProcedures] = useState("");
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [eventDuration, setEventDuration] = useState('');
    const [guestLimit, setGuestLimit] = useState(8);
    const [earlyArrival, setEarlyArrival] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [price, setPrice] = useState<number>(0);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [cancellationPolicy, setCancellationPolicy] = useState<string>("");
    const [considerations, setConsiderations] = useState<string>("");
    const [minPerReservationLimit, setMinPerReservationLimit] = useState<number>(1);
    const [maxPerReservationLimit, setMaxPerReservationLimit] = useState<number>(0);
    const [minPerEventLimit, setMinPerEventLimit] = useState<number>(1);
    const [maxPerEventLimit, setMaxPerEventLimit] = useState<number>(0);
    const [notifyStaffValue, setNotifyStaffValue] = useState<number>(1);
    const [notifyStaffUnit, setNotifyStaffUnit] = useState<string>("HOUR");

    useEffect(() => {
        const cookies = parseCookies();
        if (cookies.tenantId && !tenantId) {
            setTenantIdState(cookies.tenantId);
        }
    }, [tenantId]);

    const setTenantId = (id: string) => {
        setTenantIdState(id);
        setCookie(null, "tenantId", id, {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });
    };

    const resetGuestQuantity = () => {
        setGuestQuantity(0);
        setName("");
        setEmail("");
        setTitle("");
        setTenantIdState("");
        // setTourId("");
        setUserId("");
        setPhone("");
        setReservationId("");
        setIncludedItems([]);
        setNotIncludedItems([]);
        setBringItems([]);
        setDescription("");
        setOperationProcedures("");
        setSchedule([]);
        setEventDuration("");
        setGuestLimit(8);
        setEarlyArrival(false);
        setImageFile(null);
        setImagePreview(null);
        setPrice(0);
        setMinPerReservationLimit(1);
        setMaxPerReservationLimit(0);
        setMinPerEventLimit(1);
        setMaxPerEventLimit(0);
        setNotifyStaffValue(1);
        setNotifyStaffUnit("HOUR");
    };

    return (
        <GuestContext.Provider
            value={{
                guestQuantity,
                setGuestQuantity,
                name,
                setName,
                title,
                setTitle,
                email,
                setEmail,
                selectedDate,
                setSelectedDate,
                selectedTime,
                setSelectedTime,
                resetGuestQuantity,
                detailedAddons,
                setDetailedAddons,
                tenantId,
                setTenantId,
                tourId,
                setTourId,
                userId,
                setUserId,
                phone,
                setPhone,
                reservationId,
                setReservationId,
                includedItems,
                setIncludedItems,
                notIncludedItems,
                setNotIncludedItems,
                bringItems,
                setBringItems,
                description,
                setDescription,
                operationProcedures,
                setOperationProcedures,
                schedule,
                setSchedule,
                eventDuration,
                setEventDuration,
                guestLimit,
                setGuestLimit,
                earlyArrival,
                setEarlyArrival,
                imageFile,
                setImageFile,
                imagePreview,
                setImagePreview,
                price,
                setPrice,
                imageUrl,
                setImageUrl,
                cancellationPolicy,
                setCancellationPolicy,
                considerations,
                setConsiderations,
                minPerReservationLimit,
                setMinPerReservationLimit,
                maxPerReservationLimit,
                setMaxPerReservationLimit,
                minPerEventLimit,
                setMinPerEventLimit,
                maxPerEventLimit,
                setMaxPerEventLimit,
                notifyStaffValue,
                setNotifyStaffValue,
                notifyStaffUnit,
                setNotifyStaffUnit
            }}
        >
            {children}
        </GuestContext.Provider>
    );
}