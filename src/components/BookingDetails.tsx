import React, {useRef, useState} from "react";
import FooterBar from "./Footer";
import Navbar from "./Navbar";
import Grid from "./Grid";
import AddOns from "./Add-Ons";

interface BookingDetailsProps {
    onContinue?: () => void;
}

export default function BookingDetails({onContinue}: BookingDetailsProps) {
    const formInfoRef = useRef<HTMLFormElement>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleValidation = () => {
        const isFormValid = formInfoRef.current?.validateForm();
        const isDateSelected = selectedDate !== null;
        const isTimeSelected = selectedTime !== null;

        if (isFormValid) {
            setErrorMessage(null);
        }
        if (isDateSelected) {
            setErrorMessage(null);
        }
        if (isTimeSelected) {
            setErrorMessage(null);
        }

        if (isFormValid && isDateSelected && isTimeSelected) {
            setErrorMessage(null);
            onContinue?.();
        } else {
            if (!isDateSelected) {
                setErrorMessage("Please select a date.");
            } else if (!isTimeSelected) {
                setErrorMessage("Please select a time.");
            }
        }
    };

    return (
        <>
            <Navbar/>
            <Grid
                formInfoRef={formInfoRef}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                errorMessage={errorMessage}
            />
            <AddOns/>
            <FooterBar onContinue={handleValidation}/>
        </>
    );
}