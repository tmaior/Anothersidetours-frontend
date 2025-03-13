import { createContext, useContext, ReactNode, useState } from 'react';

interface Tour {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    valuePerGuest?: number;
    description?: string;
}

type AddTourContextType = {
    addTour: (tour: Tour) => void;
};

const AddTourContext = createContext<AddTourContextType | undefined>(undefined);

export const AddTourProvider = ({ children }: { children: ReactNode }) => {
    const [, setSelectedTours] = useState<Tour[]>([]);

    const addTour = (newTour: Tour) => {
        setSelectedTours((prevTours) => [...prevTours, newTour]);
    };

    return (
        <AddTourContext.Provider value={{ addTour }}>
            {children}
        </AddTourContext.Provider>
    );
};

export const useAddTour = () => {
    const context = useContext(AddTourContext);
    if (!context) {
        throw new Error('useAddTour must be used within an AddTourProvider');
    }
    return context;
};