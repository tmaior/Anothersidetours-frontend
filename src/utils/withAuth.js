import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

const withAuth = (WrappedComponent) => {
    const AuthenticatedComponent = (props) => {
        const router = useRouter();
        const [loading, setLoading] = useState(true);
        const [userData, setUserData] = useState(null);

        useEffect(() => {
            const checkAuth = async () => {
                try {
                    const response = await axios.get(`${API_URL}/auth/profile`, {
                        withCredentials: true,
                    });
                    
                    if (response.data) {
                        setUserData(response.data);
                        // localStorage.setItem("user", JSON.stringify(response.data));
                    } else {
                        throw new Error("No user data");
                    }
                } catch (error) {
                    console.error("Authentication error:", error);
                    // localStorage.removeItem("user");
                    router.push("/login");
                } finally {
                    setLoading(false);
                }
            };

            checkAuth();
        }, [router]);

        if (loading) {
            return <div>Loading...</div>;
        }

        return <WrappedComponent {...props} user={userData} />;
    };

    AuthenticatedComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
    return AuthenticatedComponent;
};

export default withAuth;
