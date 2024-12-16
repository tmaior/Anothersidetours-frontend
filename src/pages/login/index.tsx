import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage,
    VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const router = useRouter();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: false, password: false });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {
            email: !formData.email.includes("@"),
            password: formData.password.length < 6,
        };
        setErrors(newErrors);

        if (!newErrors.email && !newErrors.password) {
            router.push("/");
        }
    };

    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.50">
            <Box
                bg="white"
                p={8}
                boxShadow="md"
                borderRadius="md"
                w={{ base: "90%", sm: "400px" }}
            >
                <Heading mb={6} textAlign="center" size="lg" color="blue.600">
                    Login
                </Heading>

                <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="stretch">
                        <FormControl isInvalid={errors.email}>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <FormErrorMessage>Invalid email.</FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl isInvalid={errors.password}>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && (
                                <FormErrorMessage>
                                    The password must be at least 6 characters long.
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <Button colorScheme="blue" type="submit" width="full" mt={4}>
                            Login
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
}
