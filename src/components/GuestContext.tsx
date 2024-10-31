import React, { createContext, useState, useContext, ReactNode } from "react";

interface GuestContextType {
    guestQuantity: number;
    setGuestQuantity: React.Dispatch<React.SetStateAction<number>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    selectedDate: Date | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
    selectedTime: string | null;
    setSelectedTime: React.Dispatch<React.SetStateAction<string | null>>;
    resetGuestQuantity: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const useGuest = (): GuestContextType => {
    const context = useContext(GuestContext);
    if (!context) {
        throw new Error("useGuest must be used within a GuestProvider");
    }
    return context;
}

export function GuestProvider({ children }: { children: ReactNode }) {
    const [guestQuantity, setGuestQuantity] = useState(2);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const resetGuestQuantity = () => {
        setGuestQuantity(2);
    };

    return (
        <GuestContext.Provider
            value={{
                guestQuantity,
                setGuestQuantity,
                name,
                setName,
                email,
                setEmail,
                selectedDate,
                setSelectedDate,
                selectedTime,
                setSelectedTime,
                resetGuestQuantity,
            }}
        >
            {children}
        </GuestContext.Provider>
    );
}