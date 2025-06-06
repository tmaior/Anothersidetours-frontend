import React, {useState, forwardRef, useImperativeHandle, ForwardedRef, useEffect} from "react";
import {Badge, Box, Button, HStack, IconButton, Input, Text, VStack} from "@chakra-ui/react";
import {AddIcon, DeleteIcon} from "@chakra-ui/icons";
import {FaUser} from "react-icons/fa";

export interface QuestionnaireRef {
    getQuestions: () => Array<{id: string, label: string, required: boolean}>;
    resetQuestions: () => void;
    getDeletedQuestions: () => Array<string>;
}

interface CustomerQuestionnaireProps {
    isEditing?: boolean;
    tourId?: string;
}

const CustomerQuestionnaire = forwardRef((props: CustomerQuestionnaireProps, ref: ForwardedRef<QuestionnaireRef>) => {
    const { isEditing = false, tourId } = props;
    const [questions, setQuestions] = useState<Array<{id: string, label: string, required: boolean}>>([]);
    const [deletedQuestions, setDeletedQuestions] = useState<Array<string>>([]);

    useEffect(() => {
        if (isEditing && tourId) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/additional-information/tour/${tourId}`, {
                credentials: "include"
            })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const formattedQuestions = data.map(item => ({
                        id: item.id,
                        label: item.title,
                        required: false
                    }));
                    setQuestions(formattedQuestions);
                }
            })
            .catch(error => {
                console.error("Error loading questions:", error);
            });
        }
    }, [isEditing, tourId]);

    useImperativeHandle(ref, () => ({
        getQuestions: () => questions,
        resetQuestions: () => {
            setQuestions([]);
            setDeletedQuestions([]);
        },
        getDeletedQuestions: () => deletedQuestions
    }));

    const handleAddQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: `temp-${Date.now()}`,
                label: "",
                required: false
            }
        ]);
    };

    const handleRemoveQuestion = (id) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        if (isEditing && !id.startsWith('temp-')) {
            setDeletedQuestions(prev => [...prev, id]);
        }
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