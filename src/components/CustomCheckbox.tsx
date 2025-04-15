import {Checkbox, Flex, Text, VStack} from "@chakra-ui/react";
import React from "react";

interface CustomCheckboxProps {
    title: string;
    description: string;
    isChecked: boolean;
    onChange: (isChecked: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
                                                           title,
                                                           description,
                                                           isChecked,
                                                           onChange,
                                                       }) => {
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    return (
        <VStack align="flex-start" spacing={2} w="full">
            <Text fontWeight="normal" fontSize={{ base: "sm", md: "md" }}>{title}</Text>
            <Flex 
                align="flex-start"
                direction={{ base: "column", sm: "row" }} 
                w="full"
            >
                <Checkbox
                    isChecked={isChecked}
                    onChange={handleCheckboxChange}
                    size="lg"
                />
                <Text 
                    ml={{ base: 0, sm: 2 }} 
                    mt={{ base: 1, sm: 0 }}
                    color="gray"
                    fontSize={{ base: "xs", md: "sm" }}
                >
                    {description}
                </Text>
            </Flex>
        </VStack>
    );
};

export default CustomCheckbox;