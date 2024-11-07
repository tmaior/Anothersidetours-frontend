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
    const [tenantId, setTenantId] = useState("429dd7a6-6b0c-4808-b210-01f500228360");
    const [tourId, setTourId] = useState("");
    const [userId, setUserId] = useState("");
    const [detailedAddons, setDetailedAddons] = useState([]);

    const resetGuestQuantity = () => {
        setGuestQuantity(2);
        setName("");
        setEmail("");
        setTitle("");
        // setTenantId("");
        // setTourId("");
        setUserId("");
        setPhone("");
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
            }}
        >
            {children}
        </GuestContext.Provider>
    );
}