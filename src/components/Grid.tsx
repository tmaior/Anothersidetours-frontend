import { SimpleGrid, VStack, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Quantity from "./Quantity";
import FormInfo from "./FormInfo";
import DatePicker from "./Datepicker";

interface GridProps {
    formInfoRef?: React.RefObject<HTMLFormElement>;
    selectedDate?: Date | null;
    setSelectedDate?: React.Dispatch<React.SetStateAction<Date | null>>;
    selectedTime?: string | null;
    setSelectedTime?: React.Dispatch<React.SetStateAction<string | null>>;
    errorMessage?: string | null;
    originalPrice?: string;
    title?: string;
}

const Grid: React.FC<GridProps> = ({
                                       formInfoRef,
                                       selectedDate,
                                       setSelectedDate,
                                       selectedTime,
                                       setSelectedTime,
                                       errorMessage,
                                       originalPrice,
                                       title
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [dayData, setDayData] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const today = new Date();
        const updatedDayData = {};

        const fixedValue = originalPrice;

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
            updatedDayData[formattedDate] = fixedValue;
        }

        setDayData(updatedDayData);
    }, [originalPrice]);

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={150} p={"25px"}>
            <VStack align="start" spacing={6}>
                <Quantity />
                <FormInfo ref={formInfoRef} />
            </VStack>

            <VStack align="start" spacing={4}>
                <DatePicker
                    title={title}
                    originalPrice={originalPrice}
                    selectedDate={selectedDate}
                    onChange={setSelectedDate}
                    selectedTime={selectedTime}
                    onTimeChange={setSelectedTime}
                />
                {errorMessage && (
                    <Text color="red.500" fontSize="sm">
                        {errorMessage}
                    </Text>
                )}
            </VStack>
        </SimpleGrid>
    );
};

export default Grid;