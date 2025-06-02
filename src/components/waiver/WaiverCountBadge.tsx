import React, { useState } from 'react';
import { Button, HStack, Text, useDisclosure } from '@chakra-ui/react';
import WaiverPopup from './WaiverPopup';

interface WaiverCountBadgeProps {
  reservationId: string;
  signedCount: number;
  totalGuests: number;
}

const WaiverCountBadge: React.FC<WaiverCountBadgeProps> = ({
  reservationId,
  signedCount,
  totalGuests
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getColor = () => {
    if (signedCount === 0) return 'red.500';
    if (signedCount < totalGuests) return 'orange.500';
    return 'green.500';
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpen}
        p={1}
        color={getColor()}
        _hover={{ bg: 'transparent', textDecoration: 'underline' }}
      >
        <HStack spacing={1}>
          <Text fontSize="sm">⦿</Text>
          <Text fontSize="sm">{signedCount}/{totalGuests}</Text>
        </HStack>
      </Button>
      
      <WaiverPopup
        isOpen={isOpen}
        onClose={onClose}
        reservationId={reservationId}
        totalGuests={totalGuests}
      />
    </>
  );
};

export default WaiverCountBadge; 