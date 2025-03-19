import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import BookingDetails from "../../components/BookingDetails";
import CheckoutModal from "../../components/CheckoutModal";
import { useGuest } from "../../contexts/GuestContext";
import ModalPageLayout from "../../components/ModalPageLayout";

export default function InvoicePaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const { setTourId, setImageUrl, setReservationId, setName, setEmail, setPhone, setGuestQuantity } = useGuest();

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

  const [reservation, setReservation] = useState(null);
  const [tourData, setTourData] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("Loading reservation...");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (router.isReady && id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${id}`)
        .then(async (res) => {
          setLoadingStatus(`${res.status}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setReservation(data);
          setReservationId(data.id);
          if (data.user) {
            setName(data.user.name);
            setEmail(data.user.email);
            setPhone(data.user.phone);
          }

          setGuestQuantity(data.guestQuantity);
          return fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${data.tourId}`);
        })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Error: ${res.status}`);
          }
          return res.json();
        })
        .then((tourData) => {
          setTourData(tourData);
          setTourId(tourData.id);
          setImageUrl(tourData.imageUrl);
          openCheckout();
        })
        .catch((err) => {
          setErrorMessage(err.message);
          console.error("Error fetching data:", err);
        });
    }
  }, [router.isReady, id, setTourId, setImageUrl, setReservationId, setName, setEmail, setPhone, setGuestQuantity, openBooking, openCheckout]);

  if (!tourData || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {errorMessage ? (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg shadow">
            <h2 className="text-xl font-semibold">Error Loading Reservation</h2>
            <p>{errorMessage}</p>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-lg">{loadingStatus}</p>
            <div className="mt-4 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
          </div>
        )}
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
    router.push('/');
  };

  const formatReservationDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <ModalPageLayout isOpen={isBookingOpen}>
        <BookingDetails
          tourId={tourData.id}
          title={tourData.name}
          minGuests={tourData.minPerEventLimit}
          description={tourData.description}
          originalPrice={tourData.price.toString()}
          addons={tourData.addons || []}
          name={reservation.user?.name || ""}
          email={reservation.user?.email || ""}
          phone={reservation.user?.phone || ""}
          selectedDate={formatReservationDate(reservation.reservation_date)}
          selectedTime={reservation.time || "12:00 PM"}
          onContinue={handleContinueToCheckout}
        />
      </ModalPageLayout>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        title={tourData.name}
        valuePrice={tourData.price.toString()}
        onClose={() => {
          closeCheckout();
          router.push(`/payment-success?reservation=${reservation.id}`);
        }}
        onBack={handleBackToBooking}
        reservationId={reservation.id}
        isInvoicePayment={true}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {},
  };
} 