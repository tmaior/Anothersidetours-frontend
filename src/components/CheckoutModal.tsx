import {useGuest} from "../contexts/GuestContext";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Input,
    Input as ChakraInput,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Text,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import CheckoutFooter from "./CheckoutFooter";
import {ImUsers} from "react-icons/im";
import {SlCalender} from "react-icons/sl";
import {MdEmail, MdOutlineAccessTime} from "react-icons/md";
import {format} from "date-fns";
import InformationAdditionalModal from "./InformationAditionalModal";
import {FaPhoneAlt} from "react-icons/fa";
import InputMask from "react-input-mask";
import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {string} from "prop-types";
import React, {useEffect, useState} from "react";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    onBack?: () => void;
    valuePrice: number;
}

export default function CheckoutModal({isOpen, onClose, onBack, title, valuePrice}: CheckoutModalProps) {
    const {isOpen: isCodeModalOpen, onOpen: openCodeModal, onClose: closeCodeModal} = useDisclosure();
    const {
        tourId,
        guestQuantity,
        userId,
        name,
        email,
        phone,
        selectedDate,
        selectedTime,
        detailedAddons
    } = useGuest();
    const {isOpen: isAdditionalOpen, onOpen: openAdditionalModal, onClose: closeAdditionalModal} = useDisclosure();

    const pricePerGuest = valuePrice || 0;
    const guestTotal = guestQuantity * pricePerGuest;
    const addonsTotal = detailedAddons.reduce((acc, addon) => acc + addon.total, 0);
    const totalAmount = guestTotal + addonsTotal;
    const stripe = useStripe();
    const elements = useElements();
    let reservationId = string;
    const { setReservationId,imageUrl } = useGuest();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
        }
    }, [isOpen]);

    const handlePayAndOpenAdditional = async () => {

        try {
            if (!userId) {
                console.error("User ID is not available.");
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ statusCheckout: "COMPLETED" }),
            });

            if (!response.ok) throw new Error("Failed to update user status");

            const combineDateAndTime = (date: Date, time: string): string => {
                const datePart = date.toISOString().split('T')[0];
                const timeParts = time.match(/(\d{1,2}):(\d{2})\s?([AP]M)?/);

                if (!timeParts) throw new Error(`Invalid time format: ${time}`);

                const hoursMatch = timeParts[1];
                const minutesMatch = timeParts[2];
                const meridianMatch = timeParts[3];

                const hours = meridianMatch === "PM" && parseInt(hoursMatch) !== 12
                    ? (parseInt(hoursMatch) + 12).toString()
                    : meridianMatch === "AM" && parseInt(hoursMatch) === 12
                        ? "00"
                        : hoursMatch;

                const formattedTime = `${hours.padStart(2, '0')}:${minutesMatch.padStart(2, '0')}:00`;
                const combinedDateTime = `${datePart}T${formattedTime}.000Z`;

                return new Date(combinedDateTime).toISOString();
            };

            const reservationDateTime = selectedDate && selectedTime
                ? combineDateAndTime(selectedDate, selectedTime)
                : new Date().toISOString().replace('T', ' ').split('.')[0] + '.000';

            const reservationData = {
                tourId,
                userId,
                reservation_date: reservationDateTime,
                addons: detailedAddons.map(addon => ({
                    addonId: addon.id,
                    quantity: addon.quantity
                })),
                total_price: totalAmount,
                guestQuantity,
                status: "PENDING",
                createdBy:"Client"
            };

            const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });

            if (reservationResponse.ok) {
                const reservationResult = await reservationResponse.json();
                reservationId = reservationResult.id;
                setReservationId(reservationResult.id);
            } else {
                console.error('Failed to create reservation');
            }
        } catch (error) {
            console.error('Error in the checkout process:', error);
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            alert("Card element is not available.");
            return;
        }

        try {
            const setupIntentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-setup-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({reservationId: reservationId}),
            });

            if (!setupIntentResponse.ok) {
                throw new Error("Failed to create setup intent");
            }

            const {clientSecret} = await setupIntentResponse.json();

            const paymentMethodResponse = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: name,
                        email: email,
                    },
                },
            });

            if (paymentMethodResponse.error) {
                setErrorMessage(`Payment failed: ${paymentMethodResponse.error.message}`);
                return;
            }

            if (paymentMethodResponse.error) {
                console.error('Erro ao confirmar o SetupIntent:', paymentMethodResponse.error.message);
            }
            const paymentMethodId = paymentMethodResponse.setupIntent.payment_method;

            const savePaymentMethodResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/save-payment-method`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId,
                    reservationId: reservationId,
                }),
            });

            if (!savePaymentMethodResponse.ok) {
                setErrorMessage("Failed to save payment method.");
                return;
            }

            // const parsedDate = parse(selectedDate, 'MMM dd, yyyy', new Date());
            // const formattedDate = format(parsedDate, 'yyyy-MM-dd');

            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/send-reservation-email`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    toEmail: email,
                    emailData: {
                        userType: "customer",
                        title: "booking email",
                        status: "pending",
                        name: name,
                        email: email,
                        phone: phone,
                        date: selectedDate,
                        time: selectedTime,
                        duration: 2,
                        quantity: guestQuantity,
                        tourTitle: title,
                        description: "your reservation is pending",
                        totals: [
                            {label: "total", amount: `$${totalAmount.toFixed(2)}`},
                            {label: "paid", amount: `$${totalAmount.toFixed(2)}`}
                        ]
                    }
                }),
            });

            if (!emailResponse.ok) throw new Error("Failed to send email");

            onClose();
            openAdditionalModal();
        } catch (error) {
            console.error("Error during payment setup:", error.message || error);
            setErrorMessage(`An error occurred: ${error.message || "Unexpected error"}`);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
                <ModalOverlay/>
                <Flex
                    justifyContent="center"
                    alignItems="center"
                    maxH="100vh"
                    overflowY="auto"
                >
                    <ModalContent
                        w="full"
                        maxW="1200px"
                        minH="700px"
                        bg="white"
                    >
                        <ModalHeader marginLeft={"500"} alignContent={"center"}>{"CHECKOUT"}</ModalHeader>
                        <Divider color={"gray.400"}/>
                        {/*<ModalCloseButton onClick={onClose}/>*/}
                        <ModalBody
                            minH="auto"
                            maxH="80vh"
                        >
                            <HStack>
                                <HStack w="500px">
                                    <HStack>
                                        <Flex w="40%" h="40%">
                                            <Box
                                                bgImage={imageUrl}
                                                bgPosition="center"
                                                bgSize="cover"
                                                boxSize="150px"
                                            />
                                        </Flex>
                                        <Flex direction="column" align="flex-start" w="400px" ml="-10">
                                            <Text fontSize="lg" fontWeight="bold">{title}</Text>
                                            <VStack align="flex-start" spacing={0} h={"80px"} marginLeft={1}>
                                                <Text>{name}</Text>
                                                <HStack spacing={6} marginTop={"-3"}>
                                                    <HStack spacing={2}>
                                                        <ImUsers/>
                                                        <Text>{guestQuantity} Reserved</Text>
                                                    </HStack>
                                                    <Spacer/>
                                                    <VStack align="flex-start" spacing={1}>
                                                        <HStack spacing={2}>
                                                            <MdEmail/>
                                                            <Text>{email}</Text>
                                                        </HStack>
                                                        <HStack spacing={2}>
                                                            <FaPhoneAlt/>
                                                            <Text>
                                                                {phone ? (
                                                                    <InputMask
                                                                        mask="(999) 999-9999"
                                                                        value={phone}
                                                                        disabled
                                                                        render={(inputProps) => (
                                                                            <ChakraInput {...inputProps} isDisabled
                                                                                         variant="unstyled"
                                                                                         border="none"
                                                                                         width="auto"/>
                                                                        )}
                                                                    />
                                                                ) : (
                                                                    "None informed"
                                                                )}
                                                            </Text>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                                <HStack marginTop={"-3"}>
                                                    <SlCalender/>
                                                    <Text>{selectedDate ? format(selectedDate, 'dd MMM yyyy') : "No Date Selected"}</Text>
                                                </HStack>
                                                <HStack>
                                                    <MdOutlineAccessTime/>
                                                    <Text> {selectedTime} PST</Text>
                                                </HStack>
                                            </VStack>
                                            <Flex w="full" mt={4} p={1} justify="flex-end">
                                                <Link color="blue.500" textAlign="right" marginRight={5}
                                                      fontSize="smaller">Modify</Link>
                                            </Flex>
                                        </Flex>
                                    </HStack>
                                </HStack>

                                <Spacer/>
                                <VStack w="full" p={4} spacing={4} align="stretch">
                                    {guestQuantity && pricePerGuest !== undefined ? (
                                        <HStack w="full">
                                            <Text>{`Guests (${guestQuantity} × $${pricePerGuest.toFixed(2)})`}</Text>
                                            <Spacer />
                                            <Text>${guestTotal.toFixed(2)}</Text>
                                        </HStack>
                                    ) : (
                                        <Text>No pricing information available.</Text>
                                    )}
                                    {detailedAddons.map((addon) => (
                                        <HStack w="full" key={addon.id}>
                                            <Text>{`${addon.label} (${addon.quantity} × $${addon.price.toFixed(2)})`}</Text>
                                            <Spacer/>
                                            <Text>${addon.total.toFixed(2)}</Text>
                                        </HStack>
                                    ))}
                                    <Link color="blue.500" onClick={openCodeModal} fontSize="sm">
                                        Have a code?
                                    </Link>
                                    <HStack w="full" marginTop={"-4"}>
                                        <Text>Total</Text>
                                        <Spacer/>
                                        <Text>${totalAmount.toFixed(2)}</Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                            <Divider color={"gray.400"} marginTop={"10px"} marginBottom={"150px"}/>
                            <div style={{
                                borderBottom: '1px solid #9E9E9E',
                                borderTop: '1px solid #9E9E9E',
                                borderLeft: '1px solid #9E9E9E',
                                borderRight: '1px solid #9E9E9E',
                                paddingBottom: '8px',
                                marginBottom: '16px',
                                padding: '4px 8px',
                                width: '400px'
                            }}>
                                <CardElement
                                    options={{
                                        hidePostalCode: true,
                                        style: {
                                            base: {
                                                iconColor: '#0c0e0e',
                                                color: '#000',
                                                fontWeight: '500',
                                                fontFamily: 'Arial, sans-serif',
                                                fontSize: '16px',
                                                fontSmoothing: 'antialiased',
                                                '::placeholder': {
                                                    color: '#aab7c4',
                                                },
                                            },
                                            invalid: {
                                                color: '#9e2146',
                                                iconColor: '#fa755a',
                                            },
                                        },
                                    }}
                                />
                            </div>
                            {errorMessage && (
                                <Box mt={4} w={"470px"}>
                                    <Alert status="error">
                                        <AlertIcon/>
                                        <Text>{errorMessage}</Text>
                                    </Alert>
                                </Box>
                            )}
                        </ModalBody>
                        <CheckoutFooter totalAmount={totalAmount} onCheckout={onBack}
                                        onPayment={handlePayAndOpenAdditional}/>
                    </ModalContent>

                </Flex>
            </Modal>
            <InformationAdditionalModal isOpen={isAdditionalOpen} onClose={closeAdditionalModal}/>

            <Modal isOpen={isCodeModalOpen} onClose={closeCodeModal} isCentered>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Add a code to this booking</ModalHeader>
                    <ModalCloseButton/>
                    <Divider/>
                    <ModalBody>
                        <HStack><Input placeholder="Enter code"/></HStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={closeCodeModal}>Cancel</Button>
                        <Button colorScheme="green" ml={3}>Apply Code</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
        ;
}
