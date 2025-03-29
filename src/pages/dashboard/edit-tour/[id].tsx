import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {useGuest} from "../../../contexts/GuestContext";
import CreateToursPage from "../create-tours";

function EditTourPage() {
    const router = useRouter();
    const {id} = router.query;

    const {
        setTitle,
        setDescription,
        setPrice,
        setImagePreview,
        setOperationProcedures,
        setTourId,
        setCancellationPolicy,
        setConsiderations,
        setSchedule
    } = useGuest();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchTourData() {
            try {
                const tourRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`);
                if (!tourRes.ok) {
                    throw new Error("Error when searching for tour");
                }
                const tourData = await tourRes.json();

                setTitle(tourData.name || "");
                setDescription(tourData.description || "");
                setPrice(tourData.price || 0);
                setImagePreview(tourData.imageUrl || null);
                setOperationProcedures(tourData.StandardOperation || "");
                setCancellationPolicy(tourData.Cancellation_Policy || "");
                setConsiderations(tourData.Considerations || "");
                setTourId(id as string);

                try {
                    const schedulesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/schedules/${id}`);
                    if (schedulesRes.ok) {
                        const schedulesData = await schedulesRes.json();
                        const formattedSchedules = schedulesData.map(schedule => ({
                            id: schedule.id,
                            name: schedule.name || "",
                            days: Array.isArray(schedule.days) ? 
                                schedule.days.reduce((obj, day) => {
                                    obj[day] = true;
                                    return obj;
                                }, {Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false}) : 
                                {Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false},
                            timeSlots: Array.isArray(schedule.timeSlots) ? schedule.timeSlots : [],
                            startTime: "",
                            startPeriod: "",
                            endTime: "",
                            endPeriod: ""
                        }));
                        
                        setSchedule(formattedSchedules);
                    }
                } catch (scheduleError) {
                    console.error("Error fetching schedules:", scheduleError);
                }

                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        }

        fetchTourData();
    }, [id, setDescription, setImagePreview, setOperationProcedures, setPrice, setTitle, setTourId, setCancellationPolicy, setConsiderations, setSchedule]);

    if (isLoading) {
        return <div>Carregando dados...</div>;
    }

    return <CreateToursPage isEditing/>;
}

export default EditTourPage;