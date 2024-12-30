import { useState, useEffect } from "react";
import axios from "axios";

export function useGuides() {
    const [guidesList, setGuidesList] = useState<string[]>([]);
    const [loadingGuides, setLoadingGuides] = useState(true);

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/guides`)
            .then((response) => {
                const guideNames = response.data.map((guide) => guide.name);
                setGuidesList(guideNames);
            })
            .catch((error) => {
                console.error("Failed to fetch guides", error);
            })
            .finally(() => setLoadingGuides(false));
    }, []);

    return { guidesList, loadingGuides };
}
