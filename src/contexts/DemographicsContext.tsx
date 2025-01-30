import React, { createContext, useContext, useState } from "react";

interface Demographic {
    id: string;
    name: string;
}

interface DemographicsContextType {
    demographics: Demographic[];
    addDemographic: (demographic: Demographic) => void;
    removeDemographic: (id: string) => void;
    setInitialDemographics: (demographics: Demographic[]) => void;
}

const DemographicsContext = createContext<DemographicsContextType | undefined>(undefined);

export const DemographicsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [demographics, setDemographics] = useState<Demographic[]>([]);

    const addDemographic = (demographic: Demographic) => {
        setDemographics((prev) => [...prev, demographic]);
    };

    const removeDemographic = (id: string) => {
        setDemographics((prev) => prev.filter((d) => d.id !== id));
    };

    const setInitialDemographics = (initialData: Demographic[]) => {
        setDemographics(initialData);
    };

    return (
        <DemographicsContext.Provider value={{ demographics, addDemographic, removeDemographic, setInitialDemographics }}>
            {children}
        </DemographicsContext.Provider>
    );
};

export const useDemographics = () => {
    const context = useContext(DemographicsContext);
    if (!context) {
        throw new Error("useDemographics must be used within a DemographicsProvider");
    }
    return context;
};