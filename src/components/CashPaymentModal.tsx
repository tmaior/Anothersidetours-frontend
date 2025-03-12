import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  InputGroup,
  InputLeftElement,
  Input,
  Box,
  Text,
  ModalCloseButton,
} from '@chakra-ui/react';

interface CashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onComplete: (cashAmount: number) => void;
}

const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onComplete,
}) => {
  const [cashAmount, setCashAmount] = useState<string>('');
  const [changeDue, setChangeDue] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [buttonLabel, setButtonLabel] = useState<string>('Exact Cash Tendered');

  useEffect(() => {
    if (isOpen) {
      setCashAmount('');
      setChangeDue(0);
      setIsValid(false);
      setButtonLabel('Exact Cash Tendered');
    }
  }, [isOpen]);

  useEffect(() => {
    const numericAmount = parseFloat(cashAmount) || 0;
    const change = numericAmount - totalAmount;
    setChangeDue(change > 0 ? change : 0);

    if (numericAmount < totalAmount) {
      setIsValid(false);
      setButtonLabel(`Minimum US$ ${totalAmount.toFixed(2)}`);
    } else if (numericAmount >= totalAmount) {
      setIsValid(true);
      setButtonLabel('Done');
    } else {
      setIsValid(true);
      setButtonLabel('Exact Cash Tendered');
    }
  }, [cashAmount, totalAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCashAmount(value);
    }
  };

  const handleComplete = () => {
    if (isValid) {
      onComplete(parseFloat(cashAmount));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">Enter Cash Tendered</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="gray.600">
                $
              </InputLeftElement>
              <Input
                placeholder="0.00"
                value={cashAmount}
                onChange={handleInputChange}
                autoFocus
                type="text"
                inputMode="decimal"
              />
            </InputGroup>
          </FormControl>

          <Box mt={6}>
            <Text fontWeight="bold" display="flex" justifyContent="space-between">
              <span>Change Due</span>
              <span>US$ {changeDue.toFixed(2)}</span>
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme={parseFloat(cashAmount) < totalAmount ? "gray" : "blue"} 
            isDisabled={!isValid}
            onClick={handleComplete}
          >
            {buttonLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CashPaymentModal; 