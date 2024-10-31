import PickupSpinner from "./PickupSpinner";
import {useGuest} from "./GuestContext";

export default function Quantity() {
    const { guestQuantity, setGuestQuantity } = useGuest();

    return (
        <PickupSpinner
            title="QUANTITY"
            description="Guests"
            minValue={2}
            value={guestQuantity}
            onChange={setGuestQuantity}
        />
    );
}