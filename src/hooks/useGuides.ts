import {useEffect, useState} from "react";
import axios from "axios";

interface Guide {
    id: string;
    name: string;
}

export function useGuides() {
    const [guidesList, setGuidesList] = useState<Guide[]>([]);
    const [loadingGuides, setLoadingGuides] = useState(true);

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/guides`)
            .then((response) => {
                const guides = response.data.map((guide) => ({
                    id: guide.id,
                    name: guide.name,
                }));
                setGuidesList(guides);
            })
            .catch((error) => {
                console.error("Failed to fetch guides", error);
            })
            .finally(() => setLoadingGuides(false));
    }, []);

    return {guidesList, loadingGuides};
}