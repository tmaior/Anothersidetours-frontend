import React, {useEffect, useRef, useState} from "react";
import FooterBar from "./Footer";
import Navbar from "./Navbar";
import Grid from "./Grid";
import AddOns from "./Add-Ons";
import {useGuest} from "../contexts/GuestContext";
import debounce from 'lodash.debounce';

interface BookingDetailsProps {
    onContinue?: () => void;
    tourId?: string;
    title: string;
    description: string;
    originalPrice: string;
    addons: Array<{ id: string; label: string; type: string; description: string; price: number }>;
    minGuests?:number;
    name?: string;
    email?: string;
    phone?: string;
    selectedDate?: string;
    selectedTime?: string;
}

export default function BookingDetails({
                                           onContinue,
                                           tourId,
                                           title,
                                           description,
                                           originalPrice,
                                           addons,
                                           minGuests,
                                       }: BookingDetailsProps) {
    const formInfoRef = useRef<HTMLFormElement>(null);
    const [localSelectedDate, setLocalSelectedDate] = useState<Date | null>(null);
    const [localSelectedTime, setLocalSelectedTime] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const {setSelectedDate, setSelectedTime, setTitle, name, email, phone, guestQuantity, setUserId} = useGuest();
    const normalizedEmail = email?.trim().toLowerCase();

    useEffect(() => {
        setTitle(title);
    }, [title, setTitle]);


    function combineDateAndTime(date, time) {
        if (!date || !time) return null;

        const datePart = date.toISOString().split("T")[0];
        const [timeValue, modifier] = time.split(" ");

        let [hours] = timeValue.split(":").map(Number);
        const [, minutes] = timeValue.split(":").map(Number);

        if (modifier.toUpperCase() === "PM" && hours < 12) {
            hours += 12;
        }
        if (modifier.toUpperCase() === "AM" && hours === 12) {
            hours = 0;
        }
        const hoursString = hours.toString().padStart(2, "0");
        const minutesString = minutes.toString().padStart(2, "0");
        const combinedISO = `${datePart}T${hoursString}:${minutesString}:00.000Z`;
        return new Date(combinedISO);
    }


    useEffect(() => {
        const debouncedUpsert = debounce(() => {
            if (normalizedEmail && normalizedEmail.includes("@") && localSelectedDate && localSelectedTime) {
                const combinedDateTime = combineDateAndTime(localSelectedDate, localSelectedTime);
                const payload = {
                    tourId,
                    name,
                    email: normalizedEmail,
                    phone,
                    guestQuantity,
                    selectedDate: combinedDateTime ? combinedDateTime.toISOString() : null,
                    statusCheckout: "INCOMPLETE",
                };

                fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/incomplete`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                }).catch(console.error);
            }
        }, 1000);
        debouncedUpsert();
        return () => {
            debouncedUpsert.cancel();
        };
    }, [normalizedEmail, tourId, email, name, phone, guestQuantity, localSelectedDate, localSelectedTime]);


    const handleValidation = async () => {
        const isFormValid = formInfoRef.current?.validateForm();
        const isDateSelected = localSelectedDate !== null;
        const isTimeSelected = localSelectedTime !== null;

        if (isFormValid && isDateSelected && isTimeSelected) {
            setErrorMessage(null);
            setSelectedDate(localSelectedDate);
            setSelectedTime(localSelectedTime);

            try {
                const formattedDate = new Date(localSelectedDate!).toISOString().split("T")[0];

                let extractedTime = localSelectedTime;
                if (localSelectedTime.includes("(")) {
                    const match = localSelectedTime.match(/^(\d{1,2}:\d{2}\s[AP]M)/);
                    if (!match || !match[1]) {
                        throw new Error(`Invalid time format: ${localSelectedTime}`);
                    }
                    extractedTime = match[1];
                }

                const combinedDateTime = new Date(`${formattedDate} ${extractedTime}`);

                if (isNaN(combinedDateTime.getTime())) {
                    throw new Error(
                        `Invalid date or time format. Date: ${formattedDate}, Time: ${extractedTime}`
                    );
                }

                const formattedDateTime = combinedDateTime.toISOString();

                const payload = {
                    name,
                    email,
                    phone,
                    selectedDate: formattedDateTime,
                    selectedTime: extractedTime,
                    guestQuantity,
                    statusCheckout: "PENDING",
                };

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorDetails = await response.text();
                    console.error("Erro do backend:", response.status, response.statusText, errorDetails);
                    throw new Error("Failed to create user");
                }

                const data = await response.json();
                setUserId(data.id);
                onContinue?.();
            } catch (error) {
                console.error("Error during validation:", error);
                if (error instanceof Error) {
                    setErrorMessage(error.message || "An error occurred during validation");
                } else {
                    setErrorMessage("An unknown error occurred during validation");
                }
            }
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
            <Navbar title={title} description={description}/>
            <Grid
                originalPrice={originalPrice}
                formInfoRef={formInfoRef}
                minGuest={minGuests}
                selectedDate={localSelectedDate}
                setSelectedDate={setLocalSelectedDate}
                selectedTime={localSelectedTime}
                setSelectedTime={setLocalSelectedTime}
                errorMessage={errorMessage}
                title={title}
            />
            <AddOns addons={addons}/>
            <FooterBar onContinue={handleValidation} continueText={"CONTINUE"}/>
        </>
    );
}