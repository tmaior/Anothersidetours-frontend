import React from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
import WaiverPopup from './WaiverPopup';

interface LinkWaiverButtonProps {
  reservationId: string;
  totalGuests: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  width?: string;
  isCompact?: boolean;
}

const LinkWaiverButton: React.FC<LinkWaiverButtonProps> = ({
  reservationId,
  totalGuests,
  size = 'md',
  width = '100%',
  isCompact = false
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        width={width}
        size={size}
        variant="outline"
        colorScheme="gray"
        borderColor="gray.300"
        borderRadius="md"
        onClick={onOpen}
        py={isCompact ? 1 : 3}
        px={isCompact ? 2 : 4}
        fontWeight="medium"
        minWidth={isCompact ? "auto" : undefined}
      >
        {isCompact ? "Waiver" : "Link Waiver"}
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

export default LinkWaiverButton; 