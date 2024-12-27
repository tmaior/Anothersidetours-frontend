import {Box, Flex, Heading, Image, Text} from "@chakra-ui/react";
import DashboardLayout from "../../../components/DashboardLayout";
import withAuth from "../../../utils/withAuth";

function Home() {
    return (
        <DashboardLayout>
            <Box
                marginTop={"-5"}
                overflowX="hidden"
                // minHeight="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
            >
                <Heading as="h1" size="2xl" mb={4} color="orange.500">
                    Under Construction
                </Heading>
                <Text fontSize="xl" mb={6} marginTop={"-5"}>
                    We&#39;re building something amazing. Stay tuned!
                </Text>
                <Flex direction="column" alignItems="center" mb={6} marginTop={"-5"}>
                    <Image
                        src="/assets/under.jpg"
                        alt="Construction Image"
                        mb={4}
                        objectFit="contain"
                        maxWidth="95%"
                        height="auto"
                    />
                </Flex>
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(Home);