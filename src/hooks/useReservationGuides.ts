import {useEffect, useState} from "react";
import axios from "axios";

export function useReservationGuides(reservationId: string) {
    const [guides, setGuides] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (reservationId) {
            setLoading(true);
            axios
                .get(`${process.env.NEXT_PUBLIC_API_URL}/guides/reservations/${reservationId}/guides`)
                .then((response) => {
                    setGuides(response.data.map((item) => item.guide));
                })
                .catch((err) => {
                    console.error("Failed to fetch guides:", err);
                    setError("Failed to fetch guides");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [reservationId]);

    return {guides, loading, error};
}