import React, { createContext, useState, useContext, ReactNode } from "react";

interface GuestContextType {
    guestQuantity: number;
    setGuestQuantity: React.Dispatch<React.SetStateAction<number>>;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const useGuest = () => {
    const context = useContext(GuestContext);
    if (!context) {
        throw new Error("useGuest must be used within a GuestProvider");
    }
    return context;
};

export function GuestProvider({ children }: { children: ReactNode }) {
    const [guestQuantity, setGuestQuantity] = useState(2);

    return (
        <GuestContext.Provider value={{ guestQuantity, setGuestQuantity }}>
            {children}
        </GuestContext.Provider>
    );
}