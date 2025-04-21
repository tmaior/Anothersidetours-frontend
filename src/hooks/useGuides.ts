import {useEffect, useState} from "react";
import axios from "axios";

interface Guide {
    id: string;
    name: string;
    email: string;
    phone?: string;
    imageUrl?: string;
    bio?: string;
    available: boolean;
    isActive?: boolean;
    status?: string;
}

export function useGuides() {
    const [guidesList, setGuidesList] = useState<Guide[]>([]);
    const [loadingGuides, setLoadingGuides] = useState(true);

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/guides`,
                {
                    withCredentials: true,
                })
            .then((response) => {
                const guidesData = response.data.map(guide => ({
                    id: guide.id,
                    name: guide.name,
                    email: guide.email,
                    phone: guide.phone || "",
                    imageUrl: guide.imageUrl || "",
                    bio: guide.bio || "",
                    status: guide.status || "Active",
                    isActive: guide.isActive !== false,
                    available: guide.isActive !== false
                }));
                setGuidesList(guidesData);
            })
            .catch((error) => {
                console.error("Failed to fetch guides", error);
            })
            .finally(() => setLoadingGuides(false));
    }, []);

    return {guidesList, loadingGuides};
}