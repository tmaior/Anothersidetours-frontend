import {SimpleGrid, VStack} from "@chakra-ui/react";
import Quantity from "@/pages/components/Quantity";
import FormInfo from "@/pages/components/FormInfo";
import React, {useEffect, useState} from "react";
import DatePicker from "@/pages/components/Datepicker";

const Grid: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dayData, setDayData] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const today = new Date();
        const updatedDayData = {...dayData};

        const fixedValue = '$100';

        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        for (let i = 0; i < 30; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);
            const formattedDate = formatDate(futureDate);

            if (!updatedDayData[formattedDate]) {
                updatedDayData[formattedDate] = fixedValue;
            }
        }

        setDayData(updatedDayData);
    }, []);

    return (
        <SimpleGrid columns={{base: 1, md: 2, lg: 2}} spacing={150} p={"25px"}>
            <VStack align="start" spacing={6}>
                <Quantity/>
                <FormInfo/>
            </VStack>
            <DatePicker
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />
        </SimpleGrid>
    );
};

export default Grid;
