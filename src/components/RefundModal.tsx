import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    Text,
    HStack,
    Icon,
    Box,
    Button, Flex,
} from '@chakra-ui/react';
import { LuPiggyBank } from 'react-icons/lu';
import {IoPersonAddOutline} from "react-icons/io5";
import {LiaHandHoldingUsdSolid} from "react-icons/lia";

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOptionSelect: (option: 'reduce' | 'return' | 'change') => void;
}

const RefundModal: React.FC<RefundModalProps> = ({ isOpen, onClose, onOptionSelect }) => {


    const InvertedIcon = (props: any) => (
        <Icon as={LuPiggyBank} {...props} transform="scaleX(-1)" />
    );

    const options = [
        {
            id: "reduce",
            title: "Reduce Booking Value and Return Payment",
            description:
                "Use this to provide ad-hoc discounts (e.g. bad weather, unhappy customer)",
            icon: InvertedIcon,
        },
        {
            id: "return",
            title: "Return Payment Only",
            description:
                "Use this when you want to return some or all of the payment, but plan on collecting it back later (e.g. using a different credit card, split payments)",
            icon: LiaHandHoldingUsdSolid,
        },
        {
            id: "change",
            title: "Change Guest Quantity",
            description:
                "Use this when you want reduce the guest quantity of this booking and optionally refund your customer",
            icon: IoPersonAddOutline,
        },
    ];

    const handleOptionSelect = (option: 'reduce' | 'return' | 'change') => {
        console.log('Selected refund option:', option);
        onOptionSelect(option);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent maxW="700px">
                <ModalHeader textAlign="center" fontSize="2xl">
                    Refund
                </ModalHeader>
                <ModalHeader>Why Are You Refunding?</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4} align="stretch">
                        {options.map((option) => (
                            <Box
                                key={option.id}
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                cursor="pointer"
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => handleOptionSelect(option.id as 'reduce' | 'return' | 'change')}
                            >
                                <HStack spacing={4}>
                                    <Icon as={option.icon} boxSize={5} />
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="semibold">{option.title}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            {option.description}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                </ModalBody>
                <Flex justifyContent="flex-end" px={6} pb={4}>
                    <Button colorScheme="blue" onClick={onClose} size="md">
                        Cancel
                    </Button>
                </Flex>
            </ModalContent>
        </Modal>
    );
};

export default RefundModal; 