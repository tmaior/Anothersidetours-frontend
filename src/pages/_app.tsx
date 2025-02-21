import type {AppProps} from "next/app";
import {ChakraProvider} from "@chakra-ui/react";
import {GuestProvider} from "../contexts/GuestContext";
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import {DemographicsProvider} from "../contexts/DemographicsContext";
import theme from "../utils/theme";

const stripePromise = loadStripe("pk_test_51QE4KYKc0WzdjQx65NTl5uBMLpZQZPSw4CluGm7Qff9INcWRMDRJmnE1yUph5jHrvBzgVo17xnRVMzDxXOtZznWy00ov8IFsJD");

export default function App({Component, pageProps}: AppProps) {
    return (
        <GuestProvider>
            <DemographicsProvider>
                <ChakraProvider theme={theme}>
                    <Elements stripe={stripePromise}>
                        <Component {...pageProps} />
                    </Elements>
                </ChakraProvider>
            </DemographicsProvider>
        </GuestProvider>
    );
}
