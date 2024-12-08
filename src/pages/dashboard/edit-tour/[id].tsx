import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TourForm from "../create-tours";

export default function EditTour() {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(true);
    const [tourData, setTourData] = useState(null);

    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`
                    );
                    const data = await response.json();
                    setTourData(data);
                } catch (error) {
                    console.error("Error fetching tour data:", error);
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [id]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!tourData) {
        return <p>Tour not found.</p>;
    }

    return (
        <TourForm
            isEditing={true}
            tourId={id}
            initialData={tourData}
        />
    );
}