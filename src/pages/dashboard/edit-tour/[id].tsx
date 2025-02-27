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
        setOperationProcedures
    } = useGuest();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchTour() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tours/${id}`);
                if (!res.ok) {
                    throw new Error("Error when searching for tour");
                }
                const data = await res.json();

                setTitle(data.name || "");
                setDescription(data.description || "");
                setPrice(data.price || 0);
                setImagePreview(data.imageUrl || null);
                setOperationProcedures(data.StandardOperation || "");
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            }
        }

        fetchTour();
    }, [id,setDescription ,setImagePreview ,setOperationProcedures ,setPrice ,setTitle]);

    if (isLoading) {
        return <div>Carregando dados...</div>;
    }

    return <CreateToursPage isEditing/>;
}

export default EditTourPage;