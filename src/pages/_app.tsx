import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import {ModalProvider} from "../components/ModalContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
        <ModalProvider>
      <Component {...pageProps} />
        </ModalProvider>
    </ChakraProvider>
  );
}
