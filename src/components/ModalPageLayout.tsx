import { Box, Container } from "@chakra-ui/react";
import React from "react";

interface ModalPageLayoutProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}

export default function ModalPageLayout({ isOpen, onClose, children }: ModalPageLayoutProps) {
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
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bg="rgba(0, 0, 0, 0.5)"
            onClick={handleBackgroundClick}
        >
            <Container
                maxW="6xl"
                bg="white"
                p={6}
                borderRadius="md"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </Container>
        </Box>
    );
}