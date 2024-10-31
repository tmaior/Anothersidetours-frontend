import { Input, Text, VStack } from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useGuest } from "./GuestContext";

const FormInfo = forwardRef((props, ref) => {
    const { name, setName, email, setEmail } = useGuest();
    const [errors, setErrors] = useState({ name: "", email: "" });

    const validateForm = () => {
        let valid = true;
        const newErrors = { name: "", email: "" };

        if (name.trim().length === 0) {
            newErrors.name = "Name is required";
            valid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            newErrors.email = "Invalid email address";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    useImperativeHandle(ref, () => ({
        validateForm
    }));

    return (
        <VStack w={"full"}>
            <Text w={"full"} color={"blue.300"}>CONTACT INFO</Text>
            <VStack w={"full"} mt={"15px"} alignItems="flex-start">
                <Text w={"full"}>Name</Text>
                <Input
                    borderRadius={"0px"}
                    placeholder={"Full name"}
                    maxWidth="600px"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    isInvalid={!!errors.name}
                    errorBorderColor="red.500"
                />
                {errors.name && <Text color="red.500" fontSize="sm">{errors.name}</Text>}
            </VStack>
            <VStack w={"full"} alignItems="flex-start">
                <Text w={"full"}>Email</Text>
                <Input
                    borderRadius={"0px"}
                    placeholder={"Email address"}
                    maxWidth="600px"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={!!errors.email}
                    errorBorderColor="red.500"
                />
                {errors.email && <Text color="red.500" fontSize="sm">{errors.email}</Text>}
            </VStack>
            <VStack w={"full"} alignItems="flex-start">
                <Text w={"full"}>Phone</Text>
                <Input
                    borderRadius={"0px"}
                    placeholder={"Phone Number"}
                    maxWidth="600px"
                />
            </VStack>
        </VStack>
    );
});

FormInfo.displayName = "FormInfo";

export default FormInfo;
