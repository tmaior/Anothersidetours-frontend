import {
    Box,
    Button,
    Flex,
    Image,
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage,
    VStack,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const router = useRouter();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: false, password: false });
    const [apiError, setApiError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {
            email: !formData.email.includes("@"),
            password: formData.password.length < 6,
        };
        setErrors(newErrors);

        if (!newErrors.email && !newErrors.password) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("user", JSON.stringify(data.employee));
                    router.push("/select-city");
                } else {
                    setApiError(data.message || "Invalid credentials");
                }
            } catch {
                setApiError("Failed to connect to the server");
            }
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
                <Flex justify="center" mb={6}>
                    <Image
                        src="/assets/logo.png"
                        alt="Logo"
                        w={"800px"}
                    />
                </Flex>

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

                        {apiError && (
                            <Text color="red.500" fontSize="sm" mt={2}>
                                {apiError}
                            </Text>
                        )}

                        <Button colorScheme="blue" type="submit" width="full" mt={4}>
                            Login
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
}