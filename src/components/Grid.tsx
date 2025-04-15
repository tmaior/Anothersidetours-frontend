import { SimpleGrid, VStack, Text, Box } from "@chakra-ui/react";
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
    minGuest:number;
    totalPrice: string
}

const Grid: React.FC<GridProps> = ({
                                       formInfoRef,
                                       selectedDate,
                                       setSelectedDate,
                                       selectedTime,
                                       setSelectedTime,
                                       errorMessage,
                                       originalPrice,
                                       title,
                                       minGuest
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
        <Box w="full" px={{ base: 0, md: 2 }} overflowX="hidden">
            <SimpleGrid 
                columns={{ base: 1, md: 2, lg: 2 }} 
                spacing={{ base: 2, sm: 4, md: 10, lg: 40 }} 
                p={{ base: 2, md: 3, lg: 4 }} 
                h={{ base: "auto", md: "auto" }}
                alignItems="flex-start"
                justifyItems="center"
                mb={{ base: "80px", md: 0 }}
            >
                <VStack 
                    align="start" 
                    spacing={5} 
                    w={{ base: "full", md: "90%" }}
                    maxW="500px"
                >
                    <Quantity minGuest={minGuest} />
                    <FormInfo ref={formInfoRef} />
                </VStack>

                <VStack 
                    align={{ base: "center", md: "start" }} 
                    spacing={4} 
                    w={{ base: "full", md: "90%" }}
                    maxW="500px"
                    pb={{ base: 10, md: 0 }}
                >
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
        </Box>
    );
};

export default Grid;