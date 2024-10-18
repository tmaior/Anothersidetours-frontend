import Navbar from "@/pages/components/Navbar";
import Grid from "@/pages/components/Grid";
import FooterBar from "@/pages/components/Footer";
import AddOns from "@/pages/components/Add-Ons";

export default function Home() {
  return (
    <>
      <Navbar />
      <Grid />
      <AddOns />
      <FooterBar />
    </>
  );
}
