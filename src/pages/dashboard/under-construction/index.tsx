import {Box, Button, Flex, Heading, Image, Text} from "@chakra-ui/react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function Home() {
    return (
        <DashboardLayout>
            <Box
                minHeight="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                backgroundColor="#f7f7f7"
                textAlign="center"
            >
                <Heading as="h1" size="2xl" mb={4} color="orange.500">
                    Under Construction
                </Heading>
                <Text fontSize="xl" mb={6}>
                    We're building something amazing. Stay tuned!
                </Text>
                <Flex direction="column" alignItems="center" mb={6}>
                    <Image
                        src="/assets/under.jpg"
                        alt="Construction Image"
                        mb={4}
                    />
                    <Text fontSize="lg" color="gray.600">
                        Materials and equipment in use
                    </Text>
                </Flex>
                <Button colorScheme="orange" size="lg" onClick={() => alert('Stay Tuned!')}>
                    Notify Me
                </Button>
            </Box>
        </DashboardLayout>
    );
}
