import React from "react";
import {
    VStack, 
    Text, 
    Textarea, 
    Box, 
    Flex,
    Divider,
    Collapse,
    useDisclosure
} from "@chakra-ui/react";

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
        <VStack spacing={6} align="start" width="100%">
            {inputs.length === 0 ? (
                <Text color="gray.500">No additional information required.</Text>
            ) : (
                inputs.map((input) => (
                    <Box 
                        key={input.id} 
                        width="100%" 
                        borderRadius="md"
                        boxShadow="sm"
                        overflow="hidden"
                    >
                        <InputItem
                            input={input}
                            value={updatedValues[input.id] || ""}
                            onChange={(value) => onInputChange(input.id, value)}
                        />
                    </Box>
                ))
            )}
        </VStack>
    );
}

function InputItem({ input, value, onChange }) {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
    
    return (
        <>
            <Flex 
                p={4}
                bg="gray.50"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={onToggle}
                borderBottomWidth={isOpen ? "1px" : "0"}
                borderBottomColor="gray.200"
            >
                <Text fontWeight="bold">
                    {input.title}
                </Text>
                <Text color="blue.500" fontSize="sm">
                    {isOpen ? "Hide" : "Answer"}
                </Text>
            </Flex>
            
            <Collapse in={isOpen} animateOpacity>
                <Box p={4} bg="white">
                    <Textarea
                        placeholder="Type the answer here..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                        resize="vertical"
                        rows={3}
                        minHeight="6em"
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
                </Box>
            </Collapse>
        </>
    );
}
