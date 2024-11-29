import { Box, Container } from "@chakra-ui/react";

interface ModalPageLayoutProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}

export default function ModalPageLayout({ isOpen, onClose, children }: ModalPageLayoutProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bg="white"
        >
            <Container
                maxW="6xl"
                bg="white"
                p={6}
                borderRadius="md"
            >
                {children}
            </Container>
        </Box>
    );
}
