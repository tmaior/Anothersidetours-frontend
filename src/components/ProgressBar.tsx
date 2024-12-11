import React from "react";
import { Box, HStack, Text, Progress } from "@chakra-ui/react";

interface ProgressBarProps {
    steps: string[];
    currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
    const totalSteps = steps.length;
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
        <Box mb={6}>
            <HStack justify="space-between" mb={2}>
                {steps.map((step, index) => (
                    <Text
                        key={index}
                        fontWeight={index <= currentStep ? "bold" : "normal"}
                        color={index <= currentStep ? "blue.500" : "gray.500"}
                    >
                        {step}
                    </Text>
                ))}
            </HStack>
            <Progress value={progressPercentage} colorScheme="blue" size="sm" />
        </Box>
    );
};

export default ProgressBar;
