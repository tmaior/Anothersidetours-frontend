import { Box, Container } from "@chakra-ui/react";
import React from "react";

export interface ModalPageLayoutProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    isCheckout?: boolean;
    width?: string | { base: string; md: string; lg: string };
    height?: string | { base: string; md: string; lg: string };
    minHeight?: string | { base: string; md: string };
}

export default function ModalPageLayout({ 
    isOpen, 
    onClose, 
    children, 
    isCheckout = false,
    width,
    height,
    minHeight
}: ModalPageLayoutProps) {
    if (!isOpen) {
        return null;
    }

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onClose && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <Box
            marginTop={isCheckout ? "0px" : "-30px"}
            paddingTop={isCheckout ? { base: "20px", md: "80px" } : "0px"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            maxWidth="100vw"
            bg="white"
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex="9999"
            onClick={handleBackgroundClick}
            overflowY={{ base: "auto", md: "auto" }}
            overflowX="hidden"
        >
            <Container
                maxW={width || { base: "100%", md: "95%", lg: "6xl" }}
                h={height || { base: "100%", md: "auto" }}
                minH={minHeight || { base: "100vh", md: "750px" }}
                bg="white"
                p={0}
                borderRadius="md"
                onClick={(e) => e.stopPropagation()}
                overflowY={{ base: "auto", md: "auto" }}
                overflowX="hidden"
            >
                {children}
            </Container>
        </Box>
    );
}