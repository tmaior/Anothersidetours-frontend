import Navbar from "../Navbar";
import Grid from "../Grid";
import AddOns from "../Add-Ons";
import FooterBar from "../Footer";


export default function PrincipalComponent({onContinue}) {
    return (
        <>
            <Navbar/>
            <Grid/>
            <AddOns/>
            <FooterBar onContinue={onContinue}/>
        </>
    )
}