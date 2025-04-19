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
        setSchedule,
        setIncludedItems,
        setBringItems
    } = useGuest();

    const [isLoading, setIsLoading] = useState(true);
    const [pricingData, setPricingData] = useState(null);

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
                    const whatsIncludedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/whats-included/${id}`);
                    if (whatsIncludedRes.ok) {
                        const whatsIncludedData = await whatsIncludedRes.json();
                        if (Array.isArray(whatsIncludedData)) {
                            const items = whatsIncludedData.map(item => item.item || "");
                            setIncludedItems(items);
                        }
                    } else {
                        console.error("Failed to fetch What's Included:", whatsIncludedRes.status);
                    }
                } catch (includedItemsError) {
                    console.error("Error fetching included items:", includedItemsError);
                }
                try {
                    const whatToBringRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/what-to-bring/${id}`);
                    if (whatToBringRes.ok) {
                        const whatToBringData = await whatToBringRes.json();
                        if (Array.isArray(whatToBringData)) {
                            const items = whatToBringData.map(item => item.item || "");
                            setBringItems(items);
                        }
                    } else {
                        console.error("Failed to fetch What to Bring:", whatToBringRes.status);
                    }
                } catch (bringItemsError) {
                    console.error("Error fetching bring items:", bringItemsError);
                }
                try {
                    const additionalInfoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/additional-information/${id}`);
                    if (additionalInfoRes.ok) {
                        const additionalInfoData = await additionalInfoRes.json();
                        if (Array.isArray(additionalInfoData) && additionalInfoData.length > 0) {
                            const formattedQuestions = additionalInfoData.map(question => ({
                                id: Date.now() + Math.floor(Math.random() * 10000),
                                label: question.title,
                                required: false
                            }));
                            window.localStorage.setItem('tourQuestions', JSON.stringify(formattedQuestions));
                        }
                    }
                } catch (additionalInfoError) {
                    console.error("Error fetching additional information:", additionalInfoError);
                }

                try {
                    const pricingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${id}`);
                    if (pricingRes.ok) {
                        const pricingData = await pricingRes.json();
                        setPricingData(pricingData);
                    }
                } catch (pricingError) {
                    console.error("Error fetching pricing data:", pricingError);
                }

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
    }, [id, setDescription, setImagePreview, setOperationProcedures, setPrice, setTitle, setTourId, setCancellationPolicy, setConsiderations, setSchedule, setIncludedItems, setBringItems]);

    if (isLoading) {
        return <div>Carregando dados...</div>;
    }

    return <CreateToursPage isEditing pricingData={pricingData}/>;
}

export default EditTourPage;