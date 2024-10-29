import { createContext, useContext, useState, ReactNode } from "react";

type ModalContextType = {
    isCheckoutOpen: boolean;
    isDetailsOpen: boolean;
    openCheckout: () => void;
    closeCheckout: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);

    const openCheckout = () => {
        setIsCheckoutOpen(true);
        setIsDetailsOpen(false);
    };

    const closeCheckout = () => {
        setIsCheckoutOpen(false);
        setIsDetailsOpen(true);
    };

    return (
        <ModalContext.Provider value={{ isCheckoutOpen, isDetailsOpen, openCheckout, closeCheckout }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModalContext() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("Error");
    }
    return context;
}