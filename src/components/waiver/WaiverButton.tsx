import React from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';

interface WaiverButtonProps {
  reservationId: string;
  isCompact?: boolean;
}

const WaiverButton: React.FC<WaiverButtonProps> = ({ reservationId, isCompact = false }) => {
  const router = useRouter();
  const toast = useToast();

  const handleWaiverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!reservationId) {
      toast({
        title: 'Error',
        description: 'Reservation ID is missing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    router.push(`/waiver/${reservationId}`);
  };

  return (
    <Button
      size={isCompact ? 'sm' : 'md'}
      colorScheme="green"
      variant="outline"
      onClick={handleWaiverClick}
    >
      {isCompact ? 'Waiver' : 'Sign Waiver'}
    </Button>
  );
};

export default WaiverButton; 