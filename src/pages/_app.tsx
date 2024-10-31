import type {AppProps} from "next/app";
import {ChakraProvider} from "@chakra-ui/react";
import {GuestProvider} from "../components/GuestContext";

export default function App({Component, pageProps}: AppProps) {
    return (
        <GuestProvider>
            <ChakraProvider>
                <Component {...pageProps} />
            </ChakraProvider>
        </GuestProvider>
    );
}
