import { Box, Container } from "@chakra-ui/react";
import React from "react";

interface ModalPageLayoutProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    isCheckout?: boolean;
}

export default function ModalPageLayout({ isOpen, onClose, children, isCheckout = false }: ModalPageLayoutProps) {
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
            paddingTop={isCheckout ? "40px" : "0px"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bg="white"
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex="9999"
            onClick={handleBackgroundClick}
        >
            <Container
                maxW="6xl"
                h={"750px"}
                bg="white"
                p={0}
                borderRadius="md"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </Container>
        </Box>
    );
}