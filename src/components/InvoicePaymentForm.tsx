import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Textarea,
  Divider,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface InvoicePaymentFormProps {
  totalAmount: number;
  reservationDate: string;
  onFormChange: (data: InvoiceFormData) => void;
}

export interface InvoiceFormData {
  daysBeforeEvent: number;
  dueDate: string;
  message: string;
}

const InvoicePaymentForm: React.FC<InvoicePaymentFormProps> = ({
  totalAmount,
  reservationDate,
  onFormChange,
}) => {
  const [daysBeforeEvent, setDaysBeforeEvent] = useState<number>(0);
  const [isCustomDays, setIsCustomDays] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [customDaysInput, setCustomDaysInput] = useState<number>(0);
  const [isDueDateInPast, setIsDueDateInPast] = useState<boolean>(false);
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const popoverRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const buttonBgColor = useColorModeValue('white', 'gray.700');
  const buttonBorderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (reservationDate) {
      const reservationDateObj = new Date(reservationDate);
      setDueDate(reservationDateObj.toISOString().split('T')[0]);
    }
  }, [reservationDate]);

  useEffect(() => {
    if (reservationDate) {
      const eventDate = new Date(reservationDate);
      const year = eventDate.getFullYear();
      const month = eventDate.getMonth();
      const day = eventDate.getDate();
      
      if (daysBeforeEvent > 0) {
        const calculatedDueDate = new Date(year, month, day - daysBeforeEvent + 1);
        setDueDate(calculatedDueDate.toISOString().split('T')[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setIsDueDateInPast(calculatedDueDate < today);
      } else {
        const sameDate = new Date(year, month, day);
        setDueDate(sameDate.toISOString().split('T')[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setIsDueDateInPast(sameDate < today);
      }
    }
    onFormChange({
      daysBeforeEvent,
      dueDate,
      message,
    });
  }, [daysBeforeEvent, reservationDate, message, onFormChange,dueDate]);
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDueDate = e.target.value;
    setDueDate(newDueDate);
    if (reservationDate) {
      const eventDate = new Date(reservationDate);
      const eventYear = eventDate.getFullYear();
      const eventMonth = eventDate.getMonth();
      const eventDay = eventDate.getDate();
      const eventDateClean = new Date(eventYear, eventMonth, eventDay);
      
      const newDueDateObj = new Date(newDueDate);
      const dueYear = newDueDateObj.getFullYear();
      const dueMonth = newDueDateObj.getMonth();
      const dueDay = newDueDateObj.getDate();
      const dueDateClean = new Date(dueYear, dueMonth, dueDay);
      const timeDiff = eventDateClean.getTime() - dueDateClean.getTime();
      const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));
      
      setDaysBeforeEvent(daysDiff > 0 ? daysDiff : 0);
      setCustomDaysInput(daysDiff > 0 ? daysDiff : 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setIsDueDateInPast(dueDateClean < today);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "custom") {
      setIsCustomDays(true);
      setIsPopoverOpen(true);
    } else {
      setIsCustomDays(false);
      setDaysBeforeEvent(parseInt(value));
      setCustomDaysInput(parseInt(value));
    }
  };

  const handleCustomDaysChange = (valueAsString: string, valueAsNumber: number) => {
    setCustomDaysInput(valueAsNumber);
  };

  const applyCustomDays = () => {
    setDaysBeforeEvent(customDaysInput);
    setIsPopoverOpen(false);
  };

  const openDaysPopover = () => {
    setCustomDaysInput(daysBeforeEvent);
    setIsPopoverOpen(true);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getDaysText = () => {
    if (isCustomDays) {
      return `${daysBeforeEvent} day(s)`;
    } else {
      return daysBeforeEvent === 0 ? "0 day(s)" : `${daysBeforeEvent} day(s)`;
    }
  };

  return (
    <VStack spacing={4} align="stretch" w="100%">
      {isDueDateInPast && (
        <Alert status="error" borderRadius="md" mb={2}>
          <AlertIcon />
          <Text color={errorColor}>Payment Due date cannot be in the past</Text>
        </Alert>
      )}

      <FormControl mb={4}>
        <FormLabel fontWeight="medium">Payment Due</FormLabel>
        <HStack align="center" spacing={2}>
          <Text fontSize="md" fontWeight="medium">
            US$ {totalAmount.toFixed(2)} due
          </Text>
          <Box width="120px" position="relative">
            <Popover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
              placement="bottom"
              closeOnBlur={false}
              initialFocusRef={popoverRef}
            >
              <PopoverTrigger>
                <Button
                  onClick={openDaysPopover}
                  variant="outline"
                  rightIcon={<ChevronDownIcon />}
                  justifyContent="space-between"
                  width="full"
                  height="40px"
                  bg={buttonBgColor}
                  borderColor={buttonBorderColor}
                  fontWeight="bold"
                >
                  {daysBeforeEvent}
                </Button>
              </PopoverTrigger>
              <PopoverContent width="200px" p={2}>
                <PopoverBody>
                  <VStack spacing={3}>
                    <NumberInput 
                      value={customDaysInput} 
                      onChange={handleCustomDaysChange}
                      min={0}
                      max={365}
                      ref={popoverRef}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Button size="sm" colorScheme="blue" onClick={applyCustomDays} width="100%">
                      Apply
                    </Button>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>
          <Text>day(s) before event (due on <Text as="span" fontWeight="medium">{formatDate(dueDate)}</Text>)</Text>
        </HStack>
      </FormControl>
      <Box p={4} bg={bgColor} borderRadius="md" mb={4}>
        <Text fontWeight="bold" fontSize="md" mb={2}>
          Payment Timeline Summary
        </Text>
        <Text>
          Total payment due <Text as="span" fontWeight="medium">{formatDate(dueDate)}</Text>
        </Text>
      </Box>
      <FormControl display="none">
        <FormLabel>Due Date</FormLabel>
        <Input
          type="date"
          value={dueDate}
          onChange={handleDueDateChange}
        />
      </FormControl>

      <Divider my={3} />
      <FormControl>
        <FormLabel>Message</FormLabel>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional message to include in invoice"
          rows={4}
        />
      </FormControl>
    </VStack>
  );
};

export default InvoicePaymentForm; 