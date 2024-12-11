import React, {createContext, ReactNode, useContext, useState} from "react";

interface GuestContextType {
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
    bringItems: string[];
    setBringItems: React.Dispatch<React.SetStateAction<string[]>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    operationProcedures: string;
    setOperationProcedures: React.Dispatch<React.SetStateAction<string>>;
    schedule: { startTime: string | null; startPeriod: string; endTime: string | null; endPeriod: string }[];
    setSchedule: React.Dispatch<
        React.SetStateAction<
            { startTime: string | null; startPeriod: string; endTime: string | null; endPeriod: string }[]
        >
    >;
    eventDuration: number;
    setEventDuration: React.Dispatch<React.SetStateAction<number>>;
    guestLimit: number;
    setGuestLimit: React.Dispatch<React.SetStateAction<number>>;
    earlyArrival: boolean;
    setEarlyArrival: React.Dispatch<React.SetStateAction<boolean>>;
    imageFile: File | null;
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
    imagePreview: string | null;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    price: number;
    setPrice: React.Dispatch<React.SetStateAction<number>>;
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
    const [guestQuantity, setGuestQuantity] = useState(2);
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState("68b9cae6-3ef2-47d9-9af0-1afb23e2be2f");
    const [tourId, setTourId] = useState("");
    const [userId, setUserId] = useState("");
    const [detailedAddons, setDetailedAddons] = useState([]);
    const [reservationId, setReservationId] = useState("");
    const [includedItems, setIncludedItems] = useState<string[]>([]);
    const [bringItems, setBringItems] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [operationProcedures, setOperationProcedures] = useState("");
    const [schedule, setSchedule] = useState<
        { startTime: string | null; startPeriod: string; endTime: string | null; endPeriod: string }[]
    >([]);
    const [eventDuration, setEventDuration] = useState(1);
    const [guestLimit, setGuestLimit] = useState(8);
    const [earlyArrival, setEarlyArrival] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [price, setPrice] = useState<number>(0);

    const resetGuestQuantity = () => {
        setGuestQuantity(2);
        setName("");
        setEmail("");
        setTitle("");
        setTenantId("");
        // setTourId("");
        setUserId("");
        setPhone("");
        setReservationId("");
        setIncludedItems([]);
        setBringItems([]);
        setDescription("");
        setOperationProcedures("");
        setSchedule([]);
        setEventDuration(1);
        setGuestLimit(8);
        setEarlyArrival(false);
        setImageFile(null);
        setImagePreview(null);
        setPrice(0)
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
            }}
        >
            {children}
        </GuestContext.Provider>
    );
}