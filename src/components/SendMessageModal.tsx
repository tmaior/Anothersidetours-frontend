import React, {useState} from "react";
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Switch,
    Text,
    Textarea,
    useToast,
    VStack,
} from "@chakra-ui/react";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import axios from "axios";

const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
});

const SendMessageModal = ({isOpen, onClose, eventDetails}) => {
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [smsMessage, setSmsMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const toast = useToast();

    const handleSend = async () => {
        if (emailEnabled && (!emailSubject || !emailBody)) {
            toast({
                title: "Email Error",
                description: "Please fill out the subject and body for the email.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (smsEnabled && smsMessage.length > 160) {
            toast({
                title: "SMS Error",
                description: "SMS message cannot exceed 160 characters.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSending(true);

        try {
            if (emailEnabled) {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/send`, {
                    to: eventDetails.email,
                    subject: emailSubject,
                    text: emailBody.replace(/<[^>]*>/g, ''),
                    html: emailBody,
                },
                    {
                        withCredentials: true,
                    });
            }

            // if (smsEnabled) {
            //
            // }

            toast({
                title: "Success",
                description: "Message sent successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSending(false);
        }
    };

    const formatDateTime = (isoDateTime: string): string => {
        if (!isoDateTime) {
            throw new Error("Invalid ISO date/time format");
        }

        const originalDate = new Date(isoDateTime);

        const year = originalDate.getUTCFullYear();
        const month = originalDate.toLocaleString("en-US", {month: "short", timeZone: "UTC"});
        const day = originalDate.getUTCDate().toString().padStart(2, "0");
        const hours = originalDate.getUTCHours();
        const minutes = originalDate.getUTCMinutes().toString().padStart(2, "0");

        const period = hours >= 12 ? "PM" : "AM";
        const formattedHour = hours % 12 || 12;

        return `${month} ${day}, ${year}, ${formattedHour}:${minutes} ${period}`;
    };

    const formattedDateTime =
        !eventDetails.date && !eventDetails.time
            ? formatDateTime(eventDetails.dateTime)
            : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader textAlign={"center"}>Send Group Message</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <HStack bg="gray.100" p={4} borderRadius="md">
                            <Image
                                src={eventDetails.image}
                                boxSize="40px"
                                borderRadius="md"
                                alt="Tour Icon"
                                objectFit="fill"
                            />
                            <VStack align="start" spacing={0} w="100%">
                                <Text fontWeight="bold">{eventDetails.title}</Text>
                                <Text color="gray.600">
                                    {eventDetails.date && eventDetails.time
                                        ? `${eventDetails.date} at ${eventDetails.time}`
                                        : formattedDateTime}
                                </Text>
                                {eventDetails.email && (
                                    <Text color="gray.600" fontSize="sm">
                                        Recipient: {eventDetails.email}
                                    </Text>
                                )}
                            </VStack>
                        </HStack>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="email-switch" mb="0">
                                Email
                            </FormLabel>
                            <Switch
                                id="email-switch"
                                isChecked={emailEnabled}
                                onChange={() => setEmailEnabled(!emailEnabled)}
                            />
                        </FormControl>
                        {emailEnabled && (
                            <>
                                <FormControl isRequired>
                                    <FormLabel>Subject</FormLabel>
                                    <Input
                                        placeholder="Subject"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                    />
                                </FormControl>
                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Body
                                    </Text>
                                    <Box
                                        border="1px solid #E2E8F0"
                                        borderRadius="md"
                                        overflow="hidden"
                                        w="100%"
                                        h="200px"
                                    >
                                        <ReactQuill
                                            theme="snow"
                                            value={emailBody}
                                            onChange={setEmailBody}
                                            placeholder="Compose your email here..."
                                            modules={{
                                                toolbar: [
                                                    [{header: [1, 2, false]}],
                                                    ["bold", "italic", "underline", "strike"],
                                                    [{list: "ordered"}, {list: "bullet"}],
                                                    ["link", "blockquote", "code-block"],
                                                    ["clean"],
                                                ],
                                            }}
                                            style={{
                                                height: "100%",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </Box>
                                </Box>

                            </>
                        )}

                        <Divider/>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="sms-switch" mb="0">
                                SMS
                            </FormLabel>
                            <Switch
                                id="sms-switch"
                                isChecked={smsEnabled}
                                onChange={() => setSmsEnabled(!smsEnabled)}
                            />
                        </FormControl>
                        {smsEnabled && (
                            <FormControl>
                                <FormLabel>Message</FormLabel>
                                <Textarea
                                    placeholder="SMS Message (max 160 characters)"
                                    value={smsMessage}
                                    onChange={(e) => setSmsMessage(e.target.value)}
                                    maxLength={160}
                                />
                                <Text fontSize="sm" color="gray.500">
                                    {smsMessage.length}/160
                                </Text>
                            </FormControl>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        colorScheme="blue" 
                        onClick={handleSend} 
                        isLoading={isSending}
                        loadingText="Sending"
                    >
                        Send
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SendMessageModal;