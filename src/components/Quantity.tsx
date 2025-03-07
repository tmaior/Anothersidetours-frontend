import PickupSpinner from "./PickupSpinner";
import {useGuest} from "../contexts/GuestContext";
import {useEffect} from "react";

export default function Quantity({minGuest}) {
    const {guestQuantity, setGuestQuantity} = useGuest();

    useEffect(() => {
        if (guestQuantity === undefined || guestQuantity === 0) {
            setGuestQuantity(minGuest);
        }
    }, [minGuest, guestQuantity, setGuestQuantity]);

    return (
        <PickupSpinner
            title="QUANTITY"
            description="Guests"
            minValue={minGuest}
            value={guestQuantity ?? minGuest}
            onChange={setGuestQuantity}
        />
    );
}