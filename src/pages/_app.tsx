import type {AppProps} from "next/app";
import {ChakraProvider} from "@chakra-ui/react";
import {GuestProvider} from "../contexts/GuestContext";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import {DemographicsProvider} from "../contexts/DemographicsContext";
import theme from "../utils/theme";
import {AddTourProvider} from "../contexts/AddTourContext";
import {CartProvider} from "../contexts/CartContext";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import DashboardLayout from "./dashboard/layout";
import {AuthProvider} from "../contexts/AuthContext";

const stripePromise = loadStripe("pk_test_51QE4KYKc0WzdjQx65NTl5uBMLpZQZPSw4CluGm7Qff9INcWRMDRJmnE1yUph5jHrvBzgVo17xnRVMzDxXOtZznWy00ov8IFsJD");

export default function App({Component, pageProps}: AppProps) {
    const router = useRouter();
    const [pathKey, setPathKey] = useState("");

    useEffect(() => {
        setPathKey(router.asPath);
    }, [router.asPath]);

    const isDashboard = router.pathname.startsWith('/dashboard');
    return (
        <CartProvider>
            <GuestProvider>
                <AddTourProvider>
                    <DemographicsProvider>
                        <AuthProvider>
                            <ChakraProvider theme={theme}>
                                <Elements stripe={stripePromise}>
                                    {isDashboard ? (
                                        <DashboardLayout>
                                            <Component {...pageProps} key={pathKey}/>
                                        </DashboardLayout>
                                    ) : (
                                        <Component {...pageProps} key={pathKey}/>
                                    )}
                                </Elements>
                            </ChakraProvider>
                        </AuthProvider>
                    </DemographicsProvider>
                </AddTourProvider>
            </GuestProvider>
        </CartProvider>
    );
}
