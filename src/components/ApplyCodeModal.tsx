import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Box,
  Text,
  Flex,
  HStack,
  Select,
  Divider,
  Checkbox,
  ModalFooter,
  SimpleGrid
} from '@chakra-ui/react';

interface PurchaseSummaryItem {
  name: string;
  price: number;
}

interface ApplyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  purchaseSummary: {
    items: PurchaseSummaryItem[];
    total: number;
  };
  paymentSummary: {
    last4?: string;
    date?: string;
    amount: number;
  };
}

const ApplyCodeModal: React.FC<ApplyCodeModalProps> = ({
  isOpen,
  onClose,
  onApply,
  purchaseSummary,
  paymentSummary
}) => {
  const [code, setCode] = React.useState('');
  const [notifyCustomer, setNotifyCustomer] = React.useState(true);

  const handleApply = () => {
    onApply(code);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="md">
        <ModalHeader borderBottomWidth="0" textAlign="center" fontWeight="medium">
          Apply Code
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={6} pb={6}>
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text mb={2}>Code</Text>
              <Select 
                placeholder="Choose a code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
              />
            </Box>
            <Box bg="gray.50" p={4} borderRadius="md">
              <Text fontWeight="bold" mb={3}>Purchase Summary</Text>
              
              {purchaseSummary.items.map((item, index) => (
                <Flex key={index} justify="space-between" mb={2}>
                  <Text>{item.name}</Text>
                  <Text>${item.price.toFixed(2)}</Text>
                </Flex>
              ))}
              
              <Flex justify="space-between" mt={2}>
                <Text fontWeight="bold">Total</Text>
                <Text fontWeight="bold">${purchaseSummary.total.toFixed(2)}</Text>
              </Flex>

              <Box mt={6}>
                <Text fontWeight="bold" mb={3}>Payment Summary</Text>
                
                {paymentSummary.last4 && (
                  <Flex justify="space-between" mb={2}>
                    <Text>Payment {paymentSummary.last4 && `*${paymentSummary.last4}`} {paymentSummary.date}</Text>
                    <Text>${paymentSummary.amount.toFixed(2)}</Text>
                  </Flex>
                )}
                
                <Flex justify="space-between">
                  <Text fontWeight="bold">Paid</Text>
                  <Text fontWeight="bold">${paymentSummary.amount.toFixed(2)}</Text>
                </Flex>
              </Box>
            </Box>
          </SimpleGrid>
        </ModalBody>

        <Divider />

        <ModalFooter justifyContent="space-between" pt={4} pb={4}>
          <Checkbox 
            isChecked={notifyCustomer} 
            onChange={(e) => setNotifyCustomer(e.target.checked)}
          >
            Notify Customer
          </Checkbox>
          
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="gray" onClick={handleApply}>
              Apply
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApplyCodeModal; 