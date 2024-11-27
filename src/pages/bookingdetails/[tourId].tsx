import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
    useDisclosure,
} from "@chakra-ui/react";
import BookingDetails from "../../components/BookingDetails";
import CheckoutModal from "../../components/CheckoutModal";
import {useGuest} from "../../components/GuestContext";
import ModalPageLayout from "../../components/ModalPageLayout";

export default function BookingDetailsPage() {
    const router = useRouter();
    const { tourId } = router.query;
    const { setTourId } = useGuest();

    const {
        isOpen: isBookingOpen,
        onOpen: openBooking,
        onClose: closeBooking,
    } = useDisclosure();
    const {
        isOpen: isCheckoutOpen,
        onOpen: openCheckout,
        onClose: closeCheckout,
    } = useDisclosure();

    const [tourData, setTourData] = useState(null);

    useEffect(() => {
        if (router.isReady && tourId) {
            const id = Array.isArray(tourId) ? tourId[0] : tourId;
            openBooking();
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    setTourData(data);
                    setTourId(id);
                })
                .catch((err) => console.error(err));
        }
    }, [router.isReady, tourId, setTourId,openBooking]);

    if (!tourData) {
        return <div>Loading...</div>;
    }

    const handleContinueToCheckout = () => {
        closeBooking();
        openCheckout();
    };

    const handleBackToBooking = () => {
        closeCheckout();
        openBooking();
    };

    const handleCloseCheckout = () => {
        closeCheckout();
    };

    return (
        <>
            <ModalPageLayout isOpen={isBookingOpen}>
                <BookingDetails
                    title={tourData.name}
                    description={tourData.description}
                    originalPrice={tourData.price}
                    addons={tourData.addons}
                    onContinue={handleContinueToCheckout}
                />
            </ModalPageLayout>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                title={tourData.name}
                valuePrice={tourData.price}
                onClose={handleCloseCheckout}
                onBack={handleBackToBooking}
            />
        </>
    );
}