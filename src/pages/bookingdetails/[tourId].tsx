import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {useDisclosure,} from "@chakra-ui/react";
import BookingDetails from "../../components/BookingDetails";
import CheckoutModal from "../../components/CheckoutModal";
import {useGuest} from "../../contexts/GuestContext";
import ModalPageLayout from "../../components/ModalPageLayout";

export default function BookingDetailsPage() {
    const router = useRouter();
    const {tourId} = router.query;
    const {setTourId, setImageUrl} = useGuest();
    const tourIdAsString = Array.isArray(tourId) ? tourId[0] : (tourId || "");

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
    const [loadingStatus, setLoadingStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (router.isReady && tourId) {
            const id = Array.isArray(tourId) ? tourId[0] : tourId;
            openBooking();
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`)
                .then(async (res) => {
                    setLoadingStatus(res.status);
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || `Error: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    setTourData(data);
                    setTourId(id);
                    setImageUrl(data.imageUrl);
                })
                .catch((err) => {
                    setErrorMessage(err.message);
                });
        }
    }, [router.isReady, tourId,setImageUrl ,setTourId, openBooking]);

    if (!tourData) {
        return (
            <div>
                {errorMessage
                    ? `Error: ${errorMessage}`
                    : `Loading... Request status: ${loadingStatus || "Undefined"}`}
            </div>
        );
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
                    tourId={tourIdAsString}
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