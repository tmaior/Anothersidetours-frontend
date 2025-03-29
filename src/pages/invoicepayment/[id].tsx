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
  const { setTourId, setImageUrl, setReservationId, setName, setEmail, setPhone, setGuestQuantity, setSelectedDate, setSelectedTime, setPrice } = useGuest();

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
  const [finalPrice, setFinalPrice] = useState(0);
  const [loadingStatus,] = useState("Loading reservation...");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!router.isReady || !id) return;
    
    const fetchData = async () => {
      try {
        const reservationRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${id}`);
        if (!reservationRes.ok) {
          throw new Error(`Error fetching reservation: ${reservationRes.status}`);
        }
        
        const reservationData = await reservationRes.json();
        const guestQuantity = reservationData.guestQuantity || 1;
        setReservation(reservationData);
        setReservationId(reservationData.id);
        setGuestQuantity(guestQuantity);
        
        if (reservationData.user) {
          setName(reservationData.user.name || "");
          setEmail(reservationData.user.email || "");
          setPhone(reservationData.user.phone || "");
        }

        if (reservationData.reservation_date) {
          const reservationDate = new Date(reservationData.reservation_date);
          setSelectedDate(reservationDate);
          const hours = reservationDate.getUTCHours();
          const minutes = reservationDate.getUTCMinutes();
          const period = hours >= 12 ? "PM" : "AM";
          const hours12 = hours % 12 || 12;
          const timeString = `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
          setSelectedTime(timeString);
        }
        const tourRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${reservationData.tourId}`);
        if (!tourRes.ok) {
          throw new Error(`Error fetching tour: ${tourRes.status}`);
        }
        
        const tourData = await tourRes.json();
        setTourData(tourData);
        setTourId(tourData.id);
        setImageUrl(tourData.imageUrl || "");
        const tierPricingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${tourData.id}`);
        if (!tierPricingRes.ok) {
          throw new Error(`Error fetching tier pricing: ${tierPricingRes.status}`);
        }
        
        const tierPricingData = await tierPricingRes.json();

        let pricePerGuest = 0;
        
        if (Array.isArray(tierPricingData) && tierPricingData.length > 0) {
          const pricing = tierPricingData[0];
          pricePerGuest = pricing.basePrice || 0;
          
          if (pricing.pricingType === 'tiered' && Array.isArray(pricing.tierEntries)) {
            const applicableTiers = pricing.tierEntries
              .filter(tier => tier.quantity <= guestQuantity)
              .sort((a, b) => b.quantity - a.quantity);
            
            if (applicableTiers.length > 0) {
              pricePerGuest = applicableTiers[0].price;
            }
          }
        }
        setPrice(pricePerGuest);

        const totalPrice = pricePerGuest * guestQuantity;
        setFinalPrice(pricePerGuest);

        openCheckout();
      } catch (error) {
        console.error("Error in data fetching:", error);
        setErrorMessage(error.message);
      }
    };
    
    fetchData();
  }, [router.isReady, id]);

  const handleContinueToCheckout = () => {
    closeBooking();
    openCheckout();
  };

  const handleBackToBooking = () => {
    closeCheckout();
    openBooking();
  };

  const formatReservationDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const extractTimeFromDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

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

  return (
    <>
      <ModalPageLayout isOpen={isBookingOpen}>
        <BookingDetails
          tourId={tourData.id}
          title={tourData.name}
          minGuests={tourData.minPerEventLimit}
          description={tourData.description}
          originalPrice={finalPrice.toString()}
          addons={tourData.addons || []}
          name={reservation.user?.name || ""}
          email={reservation.user?.email || ""}
          phone={reservation.user?.phone || ""}
          selectedDate={formatReservationDate(reservation.reservation_date)}
          selectedTime={extractTimeFromDate(reservation.reservation_date)}
          onContinue={handleContinueToCheckout}
        />
      </ModalPageLayout>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        title={tourData.name}
        valuePrice={finalPrice}
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