import FooterBar from "./Footer";
import Navbar from "./Navbar";
import Grid from "./Grid";
import AddOns from "./Add-Ons";

export default function BookingDetails({ onContinue }) {
    return (
        <>
            <Navbar />
            <Grid />
            <AddOns />
            <FooterBar onContinue={onContinue} />
        </>
    );
}