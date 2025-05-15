import axios from "axios";
import {useState} from "react";
import { syncAfterGuideAssignment } from "../utils/calendarSync";

export function useGuideAssignment() {
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const assignGuides = async (reservationId: string, guideIds: string[]) => {
        if (!reservationId) {
            console.error("No reservation ID provided");
            setError("No reservation ID provided");
            return;
        }
        setIsAssigning(true);
        setError(null);
        
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/guides/assign-guides/${reservationId}`,
                {guideIds},
                {
                    withCredentials: true
                }
            );
            try {
                await syncAfterGuideAssignment(reservationId, guideIds, []);
            } catch (syncError) {
                console.error('Error syncing calendar after guide assignment:', syncError);
            }
            return response.data;
        } catch (err) {
            console.error("Failed to assign guides:", err);
            const errorMessage = err.response?.data?.message || "Failed to assign guides";
            console.error("Error message:", errorMessage);
            setError(errorMessage);
            throw err;
        } finally {
            setIsAssigning(false);
        }
    };

    const removeGuides = async (reservationId: string, guideIds: string[]) => {
        if (!reservationId) {
            console.error("No reservation ID provided");
            setError("No reservation ID provided");
            return;
        }
        setIsAssigning(true);
        setError(null);
        
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/guides/remove-tour/${reservationId}`,
                {guideIds},
                {
                    withCredentials: true
                }
            );
            try {
                await syncAfterGuideAssignment(reservationId, [], guideIds);
            } catch (syncError) {
                console.error('Error syncing calendar after guide removal:', syncError);
            }
            return response.data;
        } catch (err) {
            console.error("Failed to remove guides:", err);
            const errorMessage = err.response?.data?.message || "Failed to remove guides";
            console.error("Error message:", errorMessage);
            setError(errorMessage);
            throw err;
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