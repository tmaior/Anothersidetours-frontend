import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Text,
  Flex,
  useToast,
  Badge
} from '@chakra-ui/react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  buttonText?: string;
  modalTitle?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onSave, 
  buttonText = "Add Signature", 
  modalTitle = "Please sign below" 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(200);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const updateCanvasDimensions = () => {
      if (canvasContainerRef.current && isOpen) {
        const width = canvasContainerRef.current.clientWidth;
        const calculatedHeight = Math.min(Math.max(width * 0.4, 150), 250);
        setCanvasWidth(width);
        setCanvasHeight(calculatedHeight);
      }
    };

    updateCanvasDimensions();

    window.addEventListener('resize', updateCanvasDimensions);

    const timer = setTimeout(() => {
      updateCanvasDimensions();
    }, 300);

    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('signature-open');
    } else {
      document.body.classList.remove('signature-open');
    }
    
    return () => {
      document.body.classList.remove('signature-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleTouchMove = (e: TouchEvent) => {
        if (e.target && (e.target as HTMLElement).closest('.signature-canvas')) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isOpen]);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !isEmpty) {
      try {
        const trimmedDataURL = signatureRef.current.getTrimmedCanvas().toDataURL('image/png');
        onSave(trimmedDataURL);
        onClose();
      } catch (error) {
        console.error("Error saving signature:", error);
        toast({
          title: "Error",
          description: "Could not save signature. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
    setIsSigning(true);
  };

  const handleEnd = () => {
    setIsSigning(false);
    if (signatureRef.current) {
      setIsEmpty(signatureRef.current.isEmpty());
    }
  };

  const handleModalOpen = () => {
    onOpen();
    setIsEmpty(true);
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  return (
    <>
      <Button onClick={handleModalOpen} colorScheme="blue" width="full">
        {buttonText}
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="xl" 
        isCentered
      >
        <ModalOverlay />
        <ModalContent className="signature-modal">
          <ModalHeader>{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mb={2} justifyContent="space-between" alignItems="center">
              <Text>Use your {isMobile ? 'finger' : 'mouse'} to sign below:</Text>
              {isSigning && (
                <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="full">
                  Signing...
                </Badge>
              )}
            </Flex>
            <Box
              ref={canvasContainerRef}
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              bg="gray.50"
              width="100%"
              height={`${canvasHeight}px`}
              overflow="hidden"
              position="relative"
              _hover={{ borderColor: "blue.300" }}
              transition="border-color 0.2s"
              boxShadow={isSigning ? "0 0 0 2px rgba(49, 130, 206, 0.4)" : "none"}
            >
              {canvasWidth > 0 && (
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{
                    width: canvasWidth,
                    height: canvasHeight,
                    className: 'signature-canvas',
                    style: {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      touchAction: 'none'
                    }
                  }}
                  onBegin={handleBegin}
                  onEnd={handleEnd}
                  dotSize={isMobile ? 3 : 2}
                  minWidth={isMobile ? 2 : 1.5}
                  maxWidth={isMobile ? 4 : 3}
                  throttle={16}
                  velocityFilterWeight={0.7}
                />
              )}
            </Box>
            {isEmpty && (
              <Text fontSize="sm" color="gray.500" mt={1} textAlign="center">
                Please sign above to continue.
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Flex width="100%" justifyContent="space-between">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Flex>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleSave}
                  isDisabled={isEmpty}
                >
                  Save Signature
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SignaturePad; 