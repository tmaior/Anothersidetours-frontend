import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IndexPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/reservation");
    }, [router]);

    return null;
}