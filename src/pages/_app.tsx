import type {AppProps} from "next/app";
import {ChakraProvider} from "@chakra-ui/react";
import {GuestProvider} from "../components/GuestContext";
import {loadStripe} from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_XKUpwPvvEnNxMsSzoLm8H3i8");

export default function App({Component, pageProps}: AppProps) {
    return (
        <GuestProvider>
            <ChakraProvider>
                <Elements stripe={stripePromise}>
                    <Component {...pageProps} />
                </Elements>
            </ChakraProvider>
        </GuestProvider>
    );
}
