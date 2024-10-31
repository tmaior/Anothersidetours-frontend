import React, {useRef, useState} from "react";
import FooterBar from "./Footer";
import Navbar from "./Navbar";
import Grid from "./Grid";
import AddOns from "./Add-Ons";
import {useGuest} from "./GuestContext";

interface BookingDetailsProps {
    onContinue?: () => void;
}

export default function BookingDetails({onContinue}: BookingDetailsProps) {
    const formInfoRef = useRef<HTMLFormElement>(null);
    const [localSelectedDate, setLocalSelectedDate] = useState<Date | null>(null);
    const [localSelectedTime, setLocalSelectedTime] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const {setSelectedDate, setSelectedTime} = useGuest();
    const handleValidation = () => {
        const isFormValid = formInfoRef.current?.validateForm();
        const isDateSelected = localSelectedDate !== null;
        const isTimeSelected = localSelectedTime !== null;

        if (isFormValid && isDateSelected && isTimeSelected) {
            setErrorMessage(null);
            setSelectedDate(localSelectedDate);
            setSelectedTime(localSelectedTime);
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
                selectedDate={localSelectedDate}
                setSelectedDate={setLocalSelectedDate}
                selectedTime={localSelectedTime}
                setSelectedTime={setLocalSelectedTime}
                errorMessage={errorMessage}
            />
            <AddOns/>
            <FooterBar onContinue={handleValidation}/>
        </>
    );
}