import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Badge,
  Divider,
  useToast
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

interface WaiverSignature {
  id: string;
  name: string;
  date: string;
  type: 'ADULT' | 'MINOR';
  guardianName?: string;
}

interface WaiverPopupProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  totalGuests: number;
}

const WaiverPopup: React.FC<WaiverPopupProps> = ({ 
  isOpen, 
  onClose, 
  reservationId,
  totalGuests 
}) => {
  const [signatures, setSignatures] = useState<WaiverSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (isOpen && reservationId) {
      //TODO mock data need to fetch from the api
      setLoading(true);
      setTimeout(() => {
        //TODO mock data just for developing need to fetch from the api
        const mockSignatures: WaiverSignature[] = [
          {
            id: '1',
            name: 'Mary Margaret Carnahan',
            date: new Date().toISOString(),
            type: 'ADULT'
          },
          {
            id: '2',
            name: 'Mark D Carnahan',
            date: new Date().toISOString(),
            type: 'ADULT'
          }
        ];
        
        setSignatures(mockSignatures);
        setLoading(false);
      }, 800);


      /*
      //TODO need to implement to fetch de data from the api
      const fetchWaivers = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/waivers/reservation/${reservationId}`, {
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch waivers');
          }
          
          const data = await response.json();
          setSignatures(data);
        } catch (error) {
          console.error('Error fetching waivers:', error);
          toast({
            title: 'Error',
            description: 'Failed to load waiver information',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchWaivers();
      */
    }
  }, [isOpen, reservationId, toast]);

  const handleAddWaiver = () => {
    router.push(`/waiver/${reservationId}`);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Waivers</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontWeight="bold">
              Signed: {signatures.length} / {totalGuests}
            </Text>
            <Button 
              colorScheme="green" 
              size="sm" 
              onClick={handleAddWaiver}
            >
              Add Waiver
            </Button>
          </Flex>
          
          <Divider mb={4} />
          
          {loading ? (
            <Text textAlign="center" py={4}>Loading waivers...</Text>
          ) : signatures.length === 0 ? (
            <Text textAlign="center" py={4}>No waivers signed yet</Text>
          ) : (
            <VStack align="stretch" spacing={3}>
              {signatures.map((sig) => (
                <Box 
                  key={sig.id} 
                  p={3} 
                  borderWidth="1px" 
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="bold">{sig.name}</Text>
                    <Badge colorScheme={sig.type === 'ADULT' ? 'blue' : 'purple'}>
                      {sig.type}
                    </Badge>
                  </HStack>
                  
                  {sig.type === 'MINOR' && sig.guardianName && (
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Guardian: {sig.guardianName}
                    </Text>
                  )}
                  
                  <Text fontSize="xs" color="gray.500">
                    Signed: {formatDate(sig.date)}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WaiverPopup; 