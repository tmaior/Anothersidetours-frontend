import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {useDisclosure,} from "@chakra-ui/react";
import BookingDetails from "../../components/BookingDetails";
import CheckoutModal from "../../components/CheckoutModal";
import InformationAdditionalModal from "../../components/InformationAditionalModal";
import FinalModal from "../../components/FinalModal";
import ModalPageLayout from "../../components/ModalPageLayout";
import {useGuest} from "../../contexts/GuestContext";

export default function BookingDetailsPage({reservationData}) {
    const router = useRouter();
    const {tourId} = router.query;
    const {setTourId, setImageUrl, setPrice, guestQuantity,} = useGuest();
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
    const {
        isOpen: isAdditionalOpen,
        onOpen: openAdditionalModal,
        onClose: closeAdditionalModal,
    } = useDisclosure();
    const {
        isOpen: isFinalOpen,
        onOpen: openFinalModal,
        onClose: closeFinalModal,
    } = useDisclosure();

    const [tourData, setTourData] = useState(reservationData || null);
    const [loadingStatus, setLoadingStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [finalPrice, setFinalPrice] = useState(0);
    const [, setTierPricing] = useState(null);
    const [hasAdditionalFields, setHasAdditionalFields] = useState(false);
    const [tenantStripeAccountId, setTenantStripeAccountId] = useState(null);

    useEffect(() => {
        if (tourIdAsString) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/additional-information/tour/${tourIdAsString}`)
                .then(response => response.json())
                .then(data => {
                    setHasAdditionalFields(data.length > 0);
                })
                .catch(error => {
                    console.error("Error fetching additional fields:", error);
                    setHasAdditionalFields(false);
                });
        }
    }, [tourIdAsString]);

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

                    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${data.tenantId}`, {
                        credentials: 'include'
                    });
                })
                .then(async (tenantRes) => {
                    if (!tenantRes.ok) {
                        throw new Error(`Error fetching tenant: ${tenantRes.status}`);
                    }
                    const tenantData = await tenantRes.json();
                    setTenantStripeAccountId(tenantData.stripeAccountId);

                    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${id}`);
                })
                .then(async (tierRes) => {
                    if (!tierRes.ok) {
                        throw new Error(`Error fetching tier pricing: ${tierRes.status}`);
                    }
                    return tierRes.json();
                })
                .then((tierPricingData) => {
                    setTierPricing(tierPricingData);
                    calculatePrice(tierPricingData, guestQuantity || 1);
                })
                .catch((err) => {
                    setErrorMessage(err.message);
                });
        }
    }, [reservationData, router.isReady, tourId, setImageUrl, setTourId, openBooking, guestQuantity]);

    const calculatePrice = (tierPricingData, guests) => {
        let pricePerGuest = 0;

        if (Array.isArray(tierPricingData) && tierPricingData.length > 0) {
            const pricing = tierPricingData[0];
            pricePerGuest = pricing.basePrice || 0;

            if (pricing.pricingType === 'tiered' && Array.isArray(pricing.tierEntries)) {
                const applicableTiers = pricing.tierEntries
                    .filter(tier => tier.quantity <= guests)
                    .sort((a, b) => b.quantity - a.quantity);

                if (applicableTiers.length > 0) {
                    pricePerGuest = applicableTiers[0].price;
                }
            }
        } else if (tourData) {
            pricePerGuest = tourData.price || 0;
        }

        setPrice(pricePerGuest);
        setFinalPrice(pricePerGuest);
    };

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
        if (hasAdditionalFields) {
            openAdditionalModal();
        } else {
            openFinalModal();
        }
    };

    const handleAdditionalComplete = () => {
        closeAdditionalModal();
        openFinalModal();
    };

    return (
        <>
            <ModalPageLayout 
                isOpen={isBookingOpen} 
                width={{ base: "98%", md: "95%", lg: "1000px" }}
                minHeight={{ base: "auto", md: "700px" }}
                maxHeight={{ base: "none", md: "90vh" }}
                overflow="auto"
            >
                <BookingDetails
                    tourId={tourIdAsString}
                    title={tourData.name}
                    minGuests={tourData.minPerReservationLimit}
                    description={tourData.description}
                    originalPrice={finalPrice.toString()}
                    addons={tourData.addons}
                    name={reservationData?.name || ""}
                    email={reservationData?.email || ""}
                    phone={reservationData?.phone || ""}
                    selectedDate={reservationData?.date || ""}
                    selectedTime={reservationData?.time || ""}
                    onContinue={handleContinueToCheckout}
                    stripeAccountId={tenantStripeAccountId}
                />
            </ModalPageLayout>

            <ModalPageLayout 
                isOpen={isCheckoutOpen} 
                isCheckout={true}
                width={{ base: "98%", md: "95%", lg: "1000px" }}
                minHeight={{ base: "90vh", md: "700px" }}
            >
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    title={tourData.name}
                    valuePrice={finalPrice}
                    onClose={handleCloseCheckout}
                    onBack={handleBackToBooking}
                    stripeAccountId={tenantStripeAccountId}
                />
            </ModalPageLayout>

            <ModalPageLayout 
                isOpen={isAdditionalOpen}
                width={{ base: "98%", md: "95%", lg: "1000px" }}
                minHeight={{ base: "90vh", md: "700px" }}
            >
                <InformationAdditionalModal 
                    isOpen={isAdditionalOpen} 
                    onClose={handleAdditionalComplete}
                    name={tourData.name}
                    description={tourData.description}
                    imageUrl={tourData.imageUrl} 
                />
            </ModalPageLayout>
            
            <ModalPageLayout 
                isOpen={isFinalOpen}
                width={{ base: "98%", md: "95%", lg: "1000px" }}
                minHeight={{ base: "90vh", md: "700px" }}
            >
                <FinalModal 
                    isOpen={isFinalOpen} 
                    onClose={closeFinalModal} 
                />
            </ModalPageLayout>
        </>
    );
}