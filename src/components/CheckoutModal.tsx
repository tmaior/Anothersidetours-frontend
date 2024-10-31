import {
    Box,
    Button,
    Center,
    Divider,
    Flex,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Text,
    VStack
} from "@chakra-ui/react";
import CheckoutFooter from "./CheckoutFooter";
import {useRouter} from "next/router";
import {ImUsers} from "react-icons/im";
import {SlCalender} from "react-icons/sl";
import {MdEmail, MdOutlineAccessTime} from "react-icons/md";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalDue: number;
    title?: string;
    onBack?: () => void;
}

export default function CheckoutModal({isOpen, onClose, totalDue, onBack}: CheckoutModalProps) {

    const router = useRouter();

    const handleEdit = () => {
        router.back();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
            <ModalOverlay/>
            <ModalContent height={"60vh"}>
                <ModalHeader marginLeft={"500"} alignContent={"center"}>{"CHECKOUT"}</ModalHeader>
                <Divider color={"gray.400"}/>
                <ModalCloseButton onClick={onClose}/>
                <ModalBody>

                    <HStack>
                        <HStack w="500px" bg={"blue"}>
                            <HStack>
                                <Flex w="40%" h="40%">
                                    <Box
                                        top={0}
                                        left={0}
                                        right={0}
                                        bottom={0}
                                        bgImage={"url('https://m01.xola.com/cache/images/5b27d2976864ea736e8b45d9_large.jpg')"}
                                        bgPosition="center"
                                        bgSize="cover"
                                        boxSize="150px"
                                    />
                                </Flex>
                                <Flex direction="column" align="flex-start" w="400px" bg="tomato" ml="-10">

                                    <Flex bg="blue.300" w="100%" h="30%" mb={2} p={0}>
                                        <Text fontSize="lg" fontWeight="bold">
                                            The Ultimate Hollywood Tour
                                        </Text>
                                    </Flex>

                                    <VStack align="flex-start" spacing={0} h={"80px"} marginLeft={1}>
                                        <Text>TESTE</Text>
                                        <HStack spacing={6}>

                                            <HStack spacing={2}>
                                                <ImUsers/>
                                                <Text>2 Reserved</Text>
                                            </HStack>
                                            <Spacer/>
                                            <Spacer/>

                                            <HStack spacing={2}>
                                                <MdEmail/>
                                                <Text>teste@gmail.com</Text>
                                            </HStack>
                                        </HStack>

                                        <HStack>
                                            <SlCalender/>
                                            <Text>31 de Out de 2024</Text>
                                        </HStack>

                                        <HStack>
                                            <MdOutlineAccessTime/>
                                            <Text>06:00 PDT</Text>
                                        </HStack>
                                    </VStack>

                                    <Flex w="full" bg="blue.300" mt={4} p={1} justify="flex-end">
                                        <Button size="sm" onClick={handleEdit}>
                                            Edit
                                        </Button>
                                    </Flex>
                                </Flex>
                            </HStack>
                        </HStack>
                        <Spacer/>
                        <Spacer/>
                        <Center height='100px'>
                            <Divider orientation='vertical'/>
                        </Center>
                        <HStack w={"700px"} h={"150px"} bg={"tomato"}>
                            <Flex bg="yellow" w="100%" h="full">
                                <Text>teste2</Text>
                            </Flex>
                        </HStack>
                    </HStack>
                </ModalBody>
                <Divider orientation='horizontal'/>
                <CheckoutFooter totalAmount={totalDue} onCheckout={onBack}/>
            </ModalContent>
        </Modal>
    );
}
