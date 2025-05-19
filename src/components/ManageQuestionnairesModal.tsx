import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    FormControl,
    FormLabel,
    Textarea,
    Text,
    useToast,
    Box,
    Divider,
} from '@chakra-ui/react';
import axios from 'axios';

interface ManageQuestionnairesModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourId: string;
    reservationId: string;
}

interface Question {
    id: string;
    title: string;
}

interface Answer {
    id: string;
    additionalInformationId: string;
    value: string;
    additionalInformation?: {
        title: string;
    };
}

const ManageQuestionnairesModal: React.FC<ManageQuestionnairesModalProps> = ({
    isOpen,
    onClose,
    tourId,
    reservationId,
}) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [existingAnswers, setExistingAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            if (!tourId || !reservationId) return;
            
            setIsLoading(true);
            try {
                const [questionsResponse, answersResponse] = await Promise.all([
                    axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/additional-information/tour/${tourId}`,
                        { withCredentials: true }
                    ),
                    axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/customer-additional-information?reservationId=${reservationId}`,
                        { withCredentials: true }
                    )
                ]);

                setQuestions(questionsResponse.data);
                setExistingAnswers(answersResponse.data);

                const answerMap = {};
                answersResponse.data.forEach((answer: Answer) => {
                    answerMap[answer.additionalInformationId] = answer.value;
                });
                setAnswers(answerMap);
            } catch (error) {
                console.error('Error fetching questionnaire data:', error);
                toast({
                    title: 'Error loading questionnaire',
                    description: 'Failed to load questions and answers',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, tourId, reservationId, toast]);

    const handleSave = async () => {
        if (!reservationId) return;

        setIsSaving(true);
        try {
            for (const question of questions) {
                const answer = answers[question.id];
                const existingAnswer = existingAnswers.find(
                    (a) => a.additionalInformationId === question.id
                );

                if (existingAnswer) {
                    if (answer !== undefined && answer !== existingAnswer.value) {
                        await axios.put(
                            `${process.env.NEXT_PUBLIC_API_URL}/customer-additional-information/${existingAnswer.id}`,
                            { value: answer },
                            { withCredentials: true }
                        );
                    }
                } else if (answer) {
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/customer-additional-information`,
                        {
                            additionalInformationId: question.id,
                            reservationId: reservationId,
                            value: answer,
                        },
                        { withCredentials: true }
                    );
                }
            }

            toast({
                title: 'Success',
                description: 'Questionnaire responses saved successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onClose();
        } catch (error) {
            console.error('Error saving questionnaire responses:', error);
            toast({
                title: 'Error',
                description: 'Failed to save questionnaire responses',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="800px">
                <ModalHeader>Manage Questionnaire</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {isLoading ? (
                        <Text>Loading questionnaire...</Text>
                    ) : questions.length === 0 ? (
                        <Text>No questions available for this tour.</Text>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            {questions.map((question) => (
                                <Box key={question.id}>
                                    <FormControl>
                                        <FormLabel fontWeight="bold">{question.title}</FormLabel>
                                        <Textarea
                                            value={answers[question.id] || ''}
                                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                                            placeholder="Enter your response here..."
                                            size="md"
                                            minH="120px"
                                            resize="vertical"
                                            borderRadius="md"
                                            p={3}
                                            _focus={{
                                                borderColor: "blue.500",
                                                boxShadow: "0 0 0 1px #3182ce"
                                            }}
                                        />
                                    </FormControl>
                                    <Divider mt={4} />
                                </Box>
                            ))}
                        </VStack>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSave}
                        isLoading={isSaving}
                        isDisabled={isLoading}
                    >
                        Save Responses
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ManageQuestionnairesModal; 