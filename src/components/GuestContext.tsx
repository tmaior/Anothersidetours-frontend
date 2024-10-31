import React, { createContext, useState, useContext, ReactNode } from "react";

interface GuestContextType {
    guestQuantity: number;
    setGuestQuantity: React.Dispatch<React.SetStateAction<number>>;
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

    const resetGuestQuantity = () => {
        setGuestQuantity(2);
    };

    return (
        <GuestContext.Provider value={{ guestQuantity, setGuestQuantity, resetGuestQuantity }}>
            {children}
        </GuestContext.Provider>
    );
}
