import type {AppProps} from "next/app";
import {ChakraProvider} from "@chakra-ui/react";
import {GuestProvider} from "../contexts/GuestContext";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import {DemographicsProvider} from "../contexts/DemographicsContext";
import theme from "../utils/theme";
import {AddTourProvider} from "../contexts/AddTourContext";
import { CartProvider } from "../contexts/CartContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const stripePromise = loadStripe("pk_test_51QE4KYKc0WzdjQx65NTl5uBMLpZQZPSw4CluGm7Qff9INcWRMDRJmnE1yUph5jHrvBzgVo17xnRVMzDxXOtZznWy00ov8IFsJD");

export default function App({Component, pageProps}: AppProps) {
    const router = useRouter();
    const [pathKey, setPathKey] = useState("");
    
    useEffect(() => {
        setPathKey(router.asPath);
    }, [router.asPath]);
    
    return (
        <CartProvider>
            <GuestProvider>
                <AddTourProvider>
                    <DemographicsProvider>
                        <ChakraProvider theme={theme}>
                            <Elements stripe={stripePromise}>
                                <Component {...pageProps} key={pathKey} />
                            </Elements>
                        </ChakraProvider>
                    </DemographicsProvider>
                </AddTourProvider>
            </GuestProvider>
        </CartProvider>
    );
}
