import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {useGuest} from "../../contexts/GuestContext";
import {Spinner} from "@chakra-ui/react";
import CheckoutModal from "../../components/CheckoutModal";
import {format, parseISO} from "date-fns";
import {toZonedTime} from "date-fns-tz";

export default function ReservationLoader() {
    const router = useRouter();
    const {id} = router.query;

    const {
        setTourId,
        setImageUrl,
        setGuestQuantity,
        setSelectedDate,
        setSelectedTime,
        setName,
        setEmail,
        setPhone
    } = useGuest();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [valuePrice, setValuePrice] = useState(null);
    const [Title, setTitle] = useState(null);

    useEffect(() => {
        if (router.isReady && id) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/incomplete/byId/${id}`)
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`Error: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    setTourId(data.tourId);
                    setImageUrl(data.tour.imageUrl);
                    setGuestQuantity(data.guestQuantity);
                    setSelectedDate(data.selectedDate);

                    if (data.selectedDate) {
                        const timeZone = "UTC";
                        const parsedDate = parseISO(data.selectedDate);
                        const zonedDate = toZonedTime(parsedDate, timeZone);

                        setSelectedTime(format(zonedDate, "HH:mm"));
                    } else {
                        setSelectedDate(null);
                        setSelectedTime(null);
                    }
                    setName(data.name);
                    setEmail(data.email);
                    setPhone(data.phone);

                    if (data.tour && data.tour.price) {
                        setValuePrice(data.tour.price);
                    } else {
                        setValuePrice(0);
                    }

                    if (data.tour && data.tour.name) {
                        setTitle(data.tour.name);
                    } else {
                        setTitle("Not Found");
                    }

                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [router.isReady, id, setTourId, setImageUrl, setGuestQuantity, setSelectedDate, setSelectedTime, setName, setEmail, setPhone]);

    if (loading) return <div style={{textAlign: "center", padding: "50px"}}><Spinner size="xl"/></div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <CheckoutModal
            isOpen={true}
            onClose={() => router.push("/")}
            title={Title}
            valuePrice={valuePrice}
        />
    );
}
