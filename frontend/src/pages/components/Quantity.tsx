import {useState} from "react";
import PickupSpinner from "@/pages/components/PickupSpinner";

export default function Quantity() {

    const [guestQuantity, setGuestQuantity] = useState(2);

    return (
        <PickupSpinner
            title="QUANTITY"
            description="Guests"
            minValue={1}
            value={guestQuantity}
            onChange={setGuestQuantity}
        />
    );
}
