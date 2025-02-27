import {useEffect} from "react";
import {useRouter} from "next/router";

const withAuth = (WrappedComponent) => {
    const AuthenticatedComponent = (props) => {
        const router = useRouter();

        useEffect(() => {
            const user = localStorage.getItem("user");
            if (!user) {
                router.push("/login");
            }
        }, [router]);

        return <WrappedComponent {...props} />;
    };

    AuthenticatedComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
    return AuthenticatedComponent;
};

export default withAuth;
