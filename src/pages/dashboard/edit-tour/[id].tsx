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
        setNotIncludedItems,
        setBringItems
    } = useGuest();

    const [isLoading, setIsLoading] = useState(true);
    const [pricingData, setPricingData] = useState(null);

    const [originalIncludedItems, setOriginalIncludedItems] = useState([]);
    const [originalNotIncludedItems, setOriginalNotIncludedItems] = useState([]);
    const [originalBringItems, setOriginalBringItems] = useState([]);

    useEffect(() => {
        if (!id) return;

        async function fetchTourData() {
            try {
                const tourRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`,{
                    credentials: "include",
                });
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
                    const whatsIncludedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/whats-included/${id}`,{
                        credentials: "include",
                    });
                    if (whatsIncludedRes.ok) {
                        const whatsIncludedData = await whatsIncludedRes.json();
                        if (Array.isArray(whatsIncludedData)) {
                            const items = whatsIncludedData.map(item => item.item || "");
                            setIncludedItems(items);
                            setOriginalIncludedItems(items);
                        }
                    } else {
                        console.error("Failed to fetch What's Included:", whatsIncludedRes.status);
                    }
                } catch (includedItemsError) {
                    console.error("Error fetching included items:", includedItemsError);
                }

                try {
                    const whatsNotIncludedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whats-not-included/${id}`,{
                        credentials: "include",
                    });
                    if (whatsNotIncludedRes.ok) {
                        const whatsNotIncludedData = await whatsNotIncludedRes.json();
                        if (Array.isArray(whatsNotIncludedData)) {
                            const items = whatsNotIncludedData.map(item => item.item || "");
                            setNotIncludedItems(items);
                            setOriginalNotIncludedItems(items);
                        }
                    } else {
                        console.error("Failed to fetch What's Not Included:", whatsNotIncludedRes.status);
                    }
                } catch (notIncludedItemsError) {
                    console.error("Error fetching not included items:", notIncludedItemsError);
                }

                try {
                    const whatToBringRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/what-to-bring/${id}`,{
                        credentials: "include",
                    });
                    if (whatToBringRes.ok) {
                        const whatToBringData = await whatToBringRes.json();
                        if (Array.isArray(whatToBringData)) {
                            const items = whatToBringData.map(item => item.item || "");
                            setBringItems(items);
                            setOriginalBringItems(items);
                        }
                    } else {
                        console.error("Failed to fetch What to Bring:", whatToBringRes.status);
                    }
                } catch (bringItemsError) {
                    console.error("Error fetching bring items:", bringItemsError);
                }
                try {
                    const additionalInfoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/additional-information/tour/${id}`,{
                        credentials: "include",
                    });
                    if (additionalInfoRes.ok) {
                        await additionalInfoRes.json();
                    }
                } catch (additionalInfoError) {
                    console.error("Error fetching additional information:", additionalInfoError);
                }

                try {
                    const pricingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tier-pricing/tour/${id}`,{
                        credentials: "include",
                    });
                    if (pricingRes.ok) {
                        const pricingData = await pricingRes.json();
                        setPricingData(pricingData);
                    }
                } catch (pricingError) {
                    console.error("Error fetching pricing data:", pricingError);
                }

                try {
                    const schedulesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tour-schedules/schedules/${id}`,{
                        credentials: "include",
                    });
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
    }, [id, setDescription, setImagePreview, setOperationProcedures, setPrice, setTitle, setTourId, setCancellationPolicy, setConsiderations, setSchedule, setIncludedItems, setNotIncludedItems, setBringItems]);

    if (isLoading) {
        return <div>Carregando dados...</div>;
    }

    return <CreateToursPage 
        isEditing 
        pricingData={pricingData} 
        tourId={id as string}
        originalItems={{
            includedItems: originalIncludedItems,
            notIncludedItems: originalNotIncludedItems,
            bringItems: originalBringItems
        }}
    />;
}

export default EditTourPage;