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
        <VStack align="flex-start" spacing={2}>
            <Text fontWeight="normal">{title}</Text>
            <Flex align="center">
                <Checkbox
                    isChecked={isChecked}
                    onChange={handleCheckboxChange}
                    size="lg"
                />
                <Text ml={2} color="gray">{description}</Text>
            </Flex>
        </VStack>
    );
};

export default CustomCheckbox;