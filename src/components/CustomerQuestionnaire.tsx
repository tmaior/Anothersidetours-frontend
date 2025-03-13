import React, {useState, forwardRef, useImperativeHandle, ForwardedRef} from "react";
import {Badge, Box, Button, HStack, IconButton, Input, Text, VStack} from "@chakra-ui/react";
import {AddIcon, DeleteIcon} from "@chakra-ui/icons";
import {FaUser} from "react-icons/fa";

export interface QuestionnaireRef {
    getQuestions: () => Array<{id: number, label: string, required: boolean}>;
    resetQuestions: () => void;
}

const CustomerQuestionnaire = forwardRef((props, ref: ForwardedRef<QuestionnaireRef>) => {
    const [questions, setQuestions] = useState<Array<{id: number, label: string, required: boolean}>>([]);

    useImperativeHandle(ref, () => ({
        getQuestions: () => questions,
        resetQuestions: () => setQuestions([])
    }));

    const handleAddQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: Date.now(),
                label: "",
                required: false
            }
        ]);
    };

    const handleRemoveQuestion = (id) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const handleLabelChange = (id, newLabel) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === id
                    ? {...q, label: newLabel}
                    : q
            )
        );
    };

    return (
        <Box p={4}>
            <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="bold">
                    Customer Questions
                </Text>
                <Button
                    leftIcon={<AddIcon/>}
                    onClick={handleAddQuestion}
                    size="sm"
                    variant="outline"
                >
                    Add New Question
                </Button>
            </HStack>

            <VStack spacing={3} align="stretch">
                {questions.map((question) => (
                    <Box
                        key={question.id}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        bg="white"
                        boxShadow="sm"
                    >
                        <Box mr={3} color="gray.500">
                            <FaUser/>
                        </Box>

                        <Input
                            variant="unstyled"
                            fontWeight="bold"
                            placeholder="Type your question..."
                            value={question.label}
                            onChange={(e) => handleLabelChange(question.id, e.target.value)}
                        />

                        {question.required && (
                            <Badge colorScheme="red" ml={2} fontSize="xs">
                                Required
                            </Badge>
                        )}

                        <IconButton
                            ml="auto"
                            icon={<DeleteIcon/>}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            aria-label="Remove question"
                            onClick={() => handleRemoveQuestion(question.id)}
                        />
                    </Box>
                ))}
            </VStack>
        </Box>
    );
});
CustomerQuestionnaire.displayName = "CustomerQuestionnaire";
export default CustomerQuestionnaire;