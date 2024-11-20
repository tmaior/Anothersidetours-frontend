import React, {useEffect, useRef, useState} from "react";
import FooterBar from "./Footer";
import Navbar from "./Navbar";
import Grid from "./Grid";
import AddOns from "./Add-Ons";
import {useGuest} from "./GuestContext";

interface BookingDetailsProps {
    onContinue?: () => void;
    title: string;
    description: string;
    originalPrice: string;
    addons: Array<{ id: string; label: string; type: string; description: string ; price: number }>;
}

export default function BookingDetails({
                                           onContinue,
                                           title,
                                           description,
                                           originalPrice,
                                           addons
                                       }: BookingDetailsProps) {
    const formInfoRef = useRef<HTMLFormElement>(null);
    const [localSelectedDate, setLocalSelectedDate] = useState<Date | null>(null);
    const [localSelectedTime, setLocalSelectedTime] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { setSelectedDate, setSelectedTime, setTitle, name, email, phone, guestQuantity, setUserId , setTourId } = useGuest();

    useEffect(() => {
        setTitle(title);
    }, [title, setTitle]);

    const handleValidation = async () => {
        const isFormValid = formInfoRef.current?.validateForm();
        const isDateSelected = localSelectedDate !== null;
        const isTimeSelected = localSelectedTime !== null;

        if (isFormValid && isDateSelected && isTimeSelected) {
            setErrorMessage(null);
            setSelectedDate(localSelectedDate);
            setSelectedTime(localSelectedTime);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    selectedDate: localSelectedDate,
                    selectedTime: localSelectedTime,
                    guestQuantity,
                    statusCheckout: "PENDING",
                }),
            });
            if (!response.ok) throw new Error("Failed to create user");

            const data = await response.json();
            setUserId(data.id);
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
            <Navbar
                title={title}
                description={description}/>
            <Grid
                originalPrice={originalPrice}
                formInfoRef={formInfoRef}
                selectedDate={localSelectedDate}
                setSelectedDate={setLocalSelectedDate}
                selectedTime={localSelectedTime}
                setSelectedTime={setLocalSelectedTime}
                errorMessage={errorMessage}
                title={title}/>
            <AddOns addons={addons} />
            <FooterBar onContinue={handleValidation} continueText={"CONTINUE"}/>
        </>
    );
}