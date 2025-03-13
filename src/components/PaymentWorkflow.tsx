import React, {useEffect, useState} from 'react';
import {Alert, AlertIcon, Box, Button, HStack, Stack, Switch, Text,} from '@chakra-ui/react';
import {FaClock, FaCreditCard, FaHandHoldingUsd, FaMoneyBill, FaMoneyCheckAlt} from 'react-icons/fa';
import {CardElement} from "@stripe/react-stripe-js";
import {AiOutlineDollar} from 'react-icons/ai';
import {MdOutlineCallSplit} from "react-icons/md";
import {PiInvoice} from "react-icons/pi";
import InvoicePaymentForm, { InvoiceFormData } from './InvoicePaymentForm';

interface PaymentWorkflowProps {
    onPaymentMethodChange?: (method: string) => void;
    onWorkflowTypeChange?: (type: string) => void;
    cardNumber?: string;
    onCardNumberChange?: (value: string) => void;
    doNotCharge?: boolean;
    onDoNotChargeChange?: (value: boolean) => void;
    errorMessage?: string | null;
    totalAmount?: number;
    reservationDate?: string;
    onInvoiceDataChange?: (data: InvoiceFormData) => void;
}

const PaymentWorkflow: React.FC<PaymentWorkflowProps> = ({
                                                             onPaymentMethodChange,
                                                             onWorkflowTypeChange,
                                                             // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                             cardNumber = '',
                                                             onCardNumberChange,
                                                             doNotCharge = false,
                                                             onDoNotChargeChange,
                                                             errorMessage,
                                                             totalAmount = 0,
                                                             reservationDate = '',
                                                             onInvoiceDataChange,
                                                         }) => {
    const [workflowType, setWorkflowType] = useState<string>('now');
    const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
        daysBeforeEvent: 0,
        dueDate: '',
        message: ''
    });

    useEffect(() => {
        if (onWorkflowTypeChange) {
            onWorkflowTypeChange('now');
        }
    }, [onWorkflowTypeChange]);

    const handleWorkflowTypeChange = (type: string) => {
        setWorkflowType(type);
        if (onWorkflowTypeChange) {
            onWorkflowTypeChange(type);
        }
    };

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
        if (onPaymentMethodChange) {
            onPaymentMethodChange(method);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onCardNumberChange) {
            onCardNumberChange(e.target.value);
        }
    };

    const handleDoNotChargeChange = () => {
        if (onDoNotChargeChange) {
            onDoNotChargeChange(!doNotCharge);
        }
    };

    const handleInvoiceFormChange = (data: InvoiceFormData) => {
        setInvoiceData(data);
        if (onInvoiceDataChange) {
            onInvoiceDataChange(data);
        }
    };

    return (
        <Box>
            <Box mb={4}>
                <Text fontSize="sm" mb={2}>Payment Workflow</Text>
                <HStack spacing={2}>
                    <Button
                        leftIcon={<AiOutlineDollar size="1.2em"/>}
                        size="md"
                        variant={workflowType === 'now' ? 'solid' : 'outline'}
                        colorScheme={workflowType === 'now' ? 'blue' : 'gray'}
                        onClick={() => handleWorkflowTypeChange('now')}
                        aria-label="Now"
                        borderRadius="md"
                        px={4}
                        py={2}
                        border="1px solid"
                        borderColor={workflowType === 'now' ? 'blue.500' : 'gray.200'}
                        bg={workflowType === 'now' ? 'blue.500' : 'white'}
                        color={workflowType === 'now' ? 'white' : 'black'}
                    >
                        <Text>Now</Text>
                    </Button>

                    <Button
                        leftIcon={<FaClock size="1.2em"/>}
                        size="md"
                        variant={workflowType === 'later' ? 'solid' : 'outline'}
                        colorScheme={workflowType === 'later' ? 'blue' : 'gray'}
                        onClick={() => handleWorkflowTypeChange('later')}
                        aria-label="Later"
                        borderRadius="md"
                        px={4}
                        py={2}
                        border="1px solid"
                        borderColor={workflowType === 'later' ? 'blue.500' : 'gray.200'}
                        bg={workflowType === 'later' ? 'blue.500' : 'white'}
                        color={workflowType === 'later' ? 'white' : 'black'}
                    >
                        <Text>Later</Text>
                    </Button>

                    <Button
                        leftIcon={<FaHandHoldingUsd size="1.2em"/>}
                        size="md"
                        variant={workflowType === 'deposit' ? 'solid' : 'outline'}
                        colorScheme={workflowType === 'deposit' ? 'blue' : 'gray'}
                        onClick={() => handleWorkflowTypeChange('deposit')}
                        aria-label="Deposit"
                        borderRadius="md"
                        px={4}
                        py={2}
                        border="1px solid"
                        borderColor={workflowType === 'deposit' ? 'blue.500' : 'gray.200'}
                        bg={workflowType === 'deposit' ? 'blue.500' : 'white'}
                        color={workflowType === 'deposit' ? 'white' : 'black'}
                    >
                        <Text>Deposit</Text>
                    </Button>

                    <Button
                        leftIcon={<MdOutlineCallSplit size="1.2em"/>}
                        size="md"
                        variant={workflowType === 'split_pay' ? 'solid' : 'outline'}
                        colorScheme={workflowType === 'split_pay' ? 'blue' : 'gray'}
                        onClick={() => handleWorkflowTypeChange('split_pay')}
                        aria-label="Split Pay"
                        borderRadius="md"
                        px={4}
                        py={2}
                        border="1px solid"
                        borderColor={workflowType === 'split_pay' ? 'blue.500' : 'gray.200'}
                        bg={workflowType === 'split_pay' ? 'blue.500' : 'white'}
                        color={workflowType === 'split_pay' ? 'white' : 'black'}
                    >
                        <Text>Split Pay</Text>
                    </Button>
                </HStack>
            </Box>

            {workflowType !== 'later' && (
                <>
                    <Box mb={4}>
                        <Text fontSize="sm" mb={2}>Payment Method</Text>
                        <HStack spacing={2}>
                            <Button
                                leftIcon={<FaCreditCard size="1.2em"/>}
                                size="md"
                                variant={paymentMethod === 'credit_card' ? 'solid' : 'outline'}
                                colorScheme={paymentMethod === 'credit_card' ? 'blue' : 'gray'}
                                onClick={() => handlePaymentMethodChange('credit_card')}
                                aria-label="Credit Card"
                                borderRadius="md"
                                px={4}
                                py={2}
                                border="1px solid"
                                borderColor={paymentMethod === 'credit_card' ? 'blue.500' : 'gray.200'}
                                bg={paymentMethod === 'credit_card' ? 'blue.500' : 'white'}
                                color={paymentMethod === 'credit_card' ? 'white' : 'black'}
                            >
                                <Text>Credit Card</Text>
                            </Button>

                            <Button
                                leftIcon={<FaMoneyBill size="1.2em"/>}
                                size="md"
                                variant={paymentMethod === 'cash' ? 'solid' : 'outline'}
                                colorScheme={paymentMethod === 'cash' ? 'blue' : 'gray'}
                                onClick={() => handlePaymentMethodChange('cash')}
                                aria-label="Cash"
                                borderRadius="md"
                                px={4}
                                py={2}
                                border="1px solid"
                                borderColor={paymentMethod === 'cash' ? 'blue.500' : 'gray.200'}
                                bg={paymentMethod === 'cash' ? 'blue.500' : 'white'}
                                color={paymentMethod === 'cash' ? 'white' : 'black'}
                            >
                                <Text>Cash</Text>
                            </Button>

                            <Button
                                leftIcon={<FaMoneyCheckAlt size="1.2em"/>}
                                size="md"
                                variant={paymentMethod === 'check' ? 'solid' : 'outline'}
                                colorScheme={paymentMethod === 'check' ? 'blue' : 'gray'}
                                onClick={() => handlePaymentMethodChange('check')}
                                aria-label="Check"
                                borderRadius="md"
                                px={4}
                                py={2}
                                border="1px solid"
                                borderColor={paymentMethod === 'check' ? 'blue.500' : 'gray.200'}
                                bg={paymentMethod === 'check' ? 'blue.500' : 'white'}
                                color={paymentMethod === 'check' ? 'white' : 'black'}
                            >
                                <Text>Check</Text>
                            </Button>

                            <Button
                                leftIcon={<PiInvoice size="1.2em"/>}
                                size="md"
                                variant={paymentMethod === 'invoice' ? 'solid' : 'outline'}
                                colorScheme={paymentMethod === 'invoice' ? 'blue' : 'gray'}
                                onClick={() => handlePaymentMethodChange('invoice')}
                                aria-label="Invoice"
                                borderRadius="md"
                                px={4}
                                py={2}
                                border="1px solid"
                                borderColor={paymentMethod === 'invoice' ? 'blue.500' : 'gray.200'}
                                bg={paymentMethod === 'invoice' ? 'blue.500' : 'white'}
                                color={paymentMethod === 'invoice' ? 'white' : 'black'}
                            >
                                <Text>Invoice</Text>
                            </Button>

                            <Button
                                size="md"
                                variant={paymentMethod === 'other' ? 'solid' : 'outline'}
                                colorScheme={paymentMethod === 'other' ? 'blue' : 'gray'}
                                onClick={() => handlePaymentMethodChange('other')}
                                aria-label="Other"
                                borderRadius="md"
                                px={4}
                                py={2}
                                border="1px solid"
                                borderColor={paymentMethod === 'other' ? 'blue.500' : 'gray.200'}
                                bg={paymentMethod === 'other' ? 'blue.500' : 'white'}
                                color={paymentMethod === 'other' ? 'white' : 'black'}
                            >
                                <Text>Other</Text>
                            </Button>
                        </HStack>
                    </Box>

                    {paymentMethod === 'credit_card' && (
                        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                            <Switch
                                id="doNotChargeCard"
                                isChecked={doNotCharge}
                                onChange={handleDoNotChargeChange}
                                size="sm"
                                colorScheme="blue"
                            />
                            <Text fontSize="sm" color="gray.600">Do Not Charge Card Now</Text>
                        </Stack>
                    )}

                    {paymentMethod === 'credit_card' && !doNotCharge && (
                        <Box mt={4} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                            <Text fontSize="sm" mb={4}>
                                Enter credit card details:
                            </Text>
                            <Box p={3} borderWidth="1px" borderRadius="md" borderColor="#e2e8f0">
                                <CardElement options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#424770',
                                            fontFamily: 'Arial, sans-serif',
                                        },
                                        invalid: {
                                            color: '#9e2146',
                                        },
                                    },
                                }}/>
                            </Box>
                        </Box>
                    )}

                    {paymentMethod === 'invoice' && (
                        <Box mt={4}>
                            <InvoicePaymentForm
                                totalAmount={totalAmount}
                                reservationDate={reservationDate}
                                onFormChange={handleInvoiceFormChange}
                            />
                        </Box>
                    )}

                    {errorMessage && (
                        <Alert status="error" mt={4} borderRadius="md">
                            <AlertIcon/>
                            {errorMessage}
                        </Alert>
                    )}
                </>
            )}
            {workflowType === 'later' && (
                <Box mt={4} mb={4} p={4} bg="blue.50" borderRadius="md">
                    <Text fontSize="sm" color="blue.700">
                        Payment will be collected later.
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default PaymentWorkflow; 