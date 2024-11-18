import React from "react";
import { VStack, Text, Textarea } from "@chakra-ui/react";

interface InputData {
    id: string;
    title: string;
}

interface AdditionalInformationProps {
    inputs: InputData[];
    updatedValues: { [key: string]: string };
    onInputChange: (id: string, value: string) => void;
}

export default function AdditionalInformation({
                                                  inputs,
                                                  updatedValues,
                                                  onInputChange,
                                              }: AdditionalInformationProps) {
    return (
        <VStack spacing={4} align="start" width="100%">
            {inputs.map((input) => (
                <div key={input.id}>
                    <Text fontWeight="bold" mb={2}>
                        {input.title}
                    </Text>
                    <Textarea
                        placeholder={`Enter ${input.title}`}
                        value={updatedValues[input.id] || ""}
                        onChange={(e) => onInputChange(input.id, e.target.value)}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                        resize="none"
                        rows={1}
                        minHeight="6em"
                        maxHeight="12em"
                        maxLength={500}
                        _focus={{ borderColor: "blue.400" }}
                        sx={{
                            overflow: "hidden",
                            wordWrap: "break-word",
                            lineHeight: "1.5em",
                            height: "auto",
                            maxHeight: "9em",
                        }}
                    />
                </div>
            ))}
        </VStack>
    );
}
