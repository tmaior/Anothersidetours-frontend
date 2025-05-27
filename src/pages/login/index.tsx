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
import axios from "axios";

axios.defaults.withCredentials = true;
export default function Login() {
    const router = useRouter();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: false, password: false });
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError("");

        const newErrors = {
            email: !formData.email.includes("@"),
            password: formData.password.length < 6,
        };
        setErrors(newErrors);

        if (!newErrors.email && !newErrors.password) {
            try {
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`, 
                    formData,
                    { 
                        withCredentials: true,
                    }
                );
                if (res.data && res.data.employee) {
                    // localStorage.setItem("user", JSON.stringify(res.data.employee));

                    try {
                        await axios.get(
                            `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
                            { withCredentials: true }
                        );
                    } catch (profileErr) {
                        console.error("Error getting profile:", profileErr);
                    }
                    router.push("/select-city");
                } else {
                    console.error("Invalid response:", res.data);
                    setApiError("User data not found  response");
                }
            } catch (error) {
                console.error("Login Error", error);
                const message = error.response?.data?.message || "Failed to connect to the server";
                setApiError(message);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
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

                        <Button 
                            colorScheme="blue" 
                            type="submit" 
                            width="full" 
                            mt={4} 
                            isLoading={loading}
                            loadingText="Logging in"
                        >
                            Login
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
}