import axios from "axios";
import {useState} from "react";

export function useGuideAssignment() {
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const assignGuides = async (reservationId: string, guideIds: string[]) => {
        setIsAssigning(true);
        setError(null);
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/guides/assign-guides/${reservationId}`,
                {guideIds}
            );
            return response.data;
        } catch (err) {
            console.error("Failed to assign guides:", err);
            setError(err.response?.data?.message || "Failed to assign guides");
        } finally {
            setIsAssigning(false);
        }
    };

    const removeGuides = async (reservationId: string, guideIds: string[]) => {
        setIsAssigning(true);
        setError(null);
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/guides/remove-tour/${reservationId}`,
                {data: {guideIds}}
            );
            return response.data;
        } catch (err) {
            console.error("Failed to remove guides:", err);
            setError(err.response?.data?.message || "Failed to remove guides");
        } finally {
            setIsAssigning(false);
        }
    };

    return {
        assignGuides,
        removeGuides,
        isAssigning,
        error,
    };
}