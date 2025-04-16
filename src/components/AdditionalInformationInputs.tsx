import React from "react";
import {VStack, Text, Textarea} from "@chakra-ui/react";

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
                <div key={input.id} style={{width: "100%"}}>
                    <Text fontWeight="bold" mb={2}>
                        {input.title}
                    </Text>
                    <Textarea
                        placeholder={`Enter the the answer.`}
                        value={updatedValues[input.id] || ""}
                        onChange={(e) => onInputChange(input.id, e.target.value)}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                        resize="vertical"
                        rows={2}
                        minHeight="6em"
                        maxHeight="150px"
                        w="100%"
                        maxLength={500}
                        _focus={{borderColor: "blue.400"}}
                        sx={{
                            overflow: "hidden",
                            wordWrap: "break-word",
                            lineHeight: "1.5em",
                            height: "auto",
                            transition: "height 0.2s ease",
                        }}
                    />
                </div>
            ))}
        </VStack>
    );
}
