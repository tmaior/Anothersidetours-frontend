import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {useDisclosure,} from "@chakra-ui/react";
import BookingDetails from "../../components/BookingDetails";
import CheckoutModal from "../../components/CheckoutModal";
import {useGuest} from "../../contexts/GuestContext";
import ModalPageLayout from "../../components/ModalPageLayout";

export default function BookingDetailsPage({reservationData}) {
    const router = useRouter();
    const {tourId} = router.query;
    const {setTourId, setImageUrl} = useGuest();
    const tourIdAsString = reservationData ? reservationData.tourId : (Array.isArray(tourId) ? tourId[0] : (tourId || ""));

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

    const [tourData, setTourData] = useState(reservationData || null);
    const [loadingStatus, setLoadingStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {


        const tourIdToFetch = reservationData?.tourId || tourId;

        if (router.isReady && tourIdToFetch) {
            const id = Array.isArray(tourIdToFetch) ? tourIdToFetch[0] : tourIdToFetch;
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
    }, [reservationData, router.isReady, tourId, setImageUrl, setTourId, openBooking]);

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
                    minGuests={tourData.minPerEventLimit}
                    description={tourData.description}
                    originalPrice={tourData.price}
                    addons={tourData.addons}
                    name={reservationData?.name || ""}
                    email={reservationData?.email || ""}
                    phone={reservationData?.phone || ""}
                    selectedDate={reservationData?.date || ""}
                    selectedTime={reservationData?.time || ""}
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