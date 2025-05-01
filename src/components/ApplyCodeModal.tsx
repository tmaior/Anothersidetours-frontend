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
  SimpleGrid,
  useMediaQuery
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
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const handleApply = () => {
    onApply(code);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={isMobile ? "full" : "md"}>
      <ModalOverlay />
      <ModalContent borderRadius={isMobile ? 0 : "md"} margin={isMobile ? 0 : "auto"}>
        <ModalHeader borderBottomWidth="0" textAlign="center" fontWeight="medium">
          Apply Code
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={isMobile ? 4 : 6} pb={isMobile ? 4 : 6}>
          <SimpleGrid columns={isMobile ? 1 : 2} spacing={4}>
            <Box>
              <Text mb={2} fontSize={isMobile ? "sm" : "md"}>Code</Text>
              <Select 
                placeholder="Choose a code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                size={isMobile ? "sm" : "md"}
              />
            </Box>
            <Box bg="gray.50" p={4} borderRadius="md" mt={isMobile ? 4 : 0}>
              <Text fontWeight="bold" mb={3} fontSize={isMobile ? "sm" : "md"}>Purchase Summary</Text>
              
              {purchaseSummary.items.map((item, index) => (
                <Flex key={index} justify="space-between" mb={2}>
                  <Text fontSize={isMobile ? "sm" : "md"}>{item.name}</Text>
                  <Text fontSize={isMobile ? "sm" : "md"}>${item.price.toFixed(2)}</Text>
                </Flex>
              ))}
              
              <Flex justify="space-between" mt={2}>
                <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>Total</Text>
                <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>${purchaseSummary.total.toFixed(2)}</Text>
              </Flex>

              <Box mt={6}>
                <Text fontWeight="bold" mb={3} fontSize={isMobile ? "sm" : "md"}>Payment Summary</Text>
                
                {paymentSummary.last4 && (
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize={isMobile ? "sm" : "md"}>
                      Payment {paymentSummary.last4 && `*${paymentSummary.last4}`} {paymentSummary.date}
                    </Text>
                    <Text fontSize={isMobile ? "sm" : "md"}>${paymentSummary.amount.toFixed(2)}</Text>
                  </Flex>
                )}
                
                <Flex justify="space-between">
                  <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>Paid</Text>
                  <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>${paymentSummary.amount.toFixed(2)}</Text>
                </Flex>
              </Box>
            </Box>
          </SimpleGrid>
        </ModalBody>

        <Divider />

        <ModalFooter 
          justifyContent="space-between" 
          pt={4} 
          pb={4}
          flexDirection={isMobile ? "column" : "row"}
          alignItems={isMobile ? "stretch" : "center"}
          gap={isMobile ? 3 : 0}
        >
          <Checkbox 
            isChecked={notifyCustomer} 
            onChange={(e) => setNotifyCustomer(e.target.checked)}
            mb={isMobile ? 2 : 0}
            size={isMobile ? "sm" : "md"}
          >
            <Text fontSize={isMobile ? "sm" : "md"}>Notify Customer</Text>
          </Checkbox>
          
          <HStack 
            spacing={3} 
            width={isMobile ? "100%" : "auto"}
            justifyContent={isMobile ? "stretch" : "flex-end"}
          >
            <Button 
              variant="outline" 
              onClick={onClose}
              flex={isMobile ? 1 : "auto"}
              size={isMobile ? "sm" : "md"}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="gray" 
              onClick={handleApply}
              flex={isMobile ? 1 : "auto"}
              size={isMobile ? "sm" : "md"}
            >
              Apply
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApplyCodeModal; 