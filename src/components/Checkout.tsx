import { Box, Button, Divider, Flex, HStack, Image, Input, Spacer, Text, VStack, Checkbox } from "@chakra-ui/react";
import { FaCreditCard } from "react-icons/fa";

export default function Checkout() {
    return (
        <Flex direction="column" p={6} maxWidth="800px" mx="auto" boxShadow="lg" bg="white" borderRadius="md">
            <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">CHECKOUT</Text>

            <HStack spacing={4} mb={6}>
                <Image src="https://via.placeholder.com/100" alt="Tour Image" borderRadius="md" boxSize="100px" />
                <VStack align="start" spacing={0}>
                    <Text fontSize="lg" fontWeight="bold">THE PLUNGE E-BIKE TOUR IN LA JOLLA</Text>
                    <Text fontWeight="bold">KENNETH C. LIPPMAN</Text>
                    <Text>1 Reserved</Text>
                    <Text>Oct 10, 2024</Text>
                    <Text>9:00 AM PDT</Text>
                </VStack>
                <Spacer />
                <Button size="sm" variant="link" colorScheme="blue">Modify</Button>
            </HStack>

            <Divider mb={6} />

            <Box mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>Guests (1 x $169.00)</Text>
                <Flex justifyContent="space-between">
                    <Text>Guests (1 x $169.00)</Text>
                    <Text>$169.00</Text>
                </Flex>
                <Flex justifyContent="space-between">
                    <Text>Upgrade to a Private Tour for $50 per guest? (1 x $50.00)</Text>
                    <Text>$50.00</Text>
                </Flex>
                <Flex justifyContent="space-between" mb={2}>
                    <Text>Tour Protection</Text>
                    <Text>$16.90</Text>
                </Flex>
                <Flex justifyContent="space-between" fontWeight="bold">
                    <Text>Total</Text>
                    <Text>$235.90</Text>
                </Flex>
            </Box>

            <Divider mb={6} />

            <Box mb={6}>
                <Text fontSize="lg" fontWeight="bold" color="blue.500" mb={2}>CREDIT CARD DETAILS</Text>
                <HStack>
                    <Input placeholder="Card number" />
                    <Button leftIcon={<FaCreditCard />} colorScheme="blue">Link</Button>
                </HStack>
            </Box>

            <Divider mb={6} />

            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.500">TOTAL</Text>
                    <Text fontSize="xl" fontWeight="bold">$235.90</Text>
                </VStack>
                <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.500">DUE NOW</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="green.500">$235.90</Text>
                </VStack>
            </Flex>

            <Checkbox colorScheme="blue" mb={4}>
                I agree to the <Text as="span" color="blue.500" cursor="pointer">Terms and Conditions</Text>
            </Checkbox>

            <Button w="full" colorScheme="green" size="lg" fontSize="xl">
                PAY $235.90
            </Button>

            <Flex justifyContent="space-between" alignItems="center" mt={6}>
                <Button variant="link" colorScheme="gray">Back</Button>
                <HStack spacing={2}>
                    <Text fontSize="xs" color="gray.500">POWERED BY</Text>
                    <Image src="https://checkout.xola.app/images/xola-logo.png" alt="Xola logo" h="20px" />
                </HStack>
                <Image src="https://checkout.xola.app/images/ssl-secure-encryption.svg" alt="SSL Secure Encryption" h="20px" />
            </Flex>
        </Flex>
    );
}