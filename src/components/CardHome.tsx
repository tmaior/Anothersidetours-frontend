import {
    Button,
    Flex,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Text,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import {FaTag} from "react-icons/fa";
import {MdOutlineAccessTimeFilled} from "react-icons/md";
import BookingDetails from "./BookingDetails";
import CheckoutModal from "./CheckoutModal";

export default function CardHome({title, description, originalPrice, discountedPrice, duration, image}) {
    const {isOpen: isBookingOpen, onOpen: openBooking, onClose: closeBooking} = useDisclosure();
    const {isOpen: isCheckoutOpen, onOpen: openCheckout, onClose: closeCheckout} = useDisclosure();

    const handleCloseCheckout = () => {
        closeCheckout();
    };

    const handleBackToBooking = () => {
        closeCheckout();
        openBooking();
    };

    const handleContinueToCheckout = () => {
        closeBooking();
        openCheckout();
    };

    return (
        <Flex
            w="100%"
            bg="white"
            borderRadius="10px"
            flexDir="column"
            boxShadow="2xl"
            border="1px"
            borderColor="gray.200"
            margin={0}
        >
            <Flex flexDir="column" w="100%">
                <Image
                    objectFit="cover"
                    borderTopRadius="10px"
                    src={image}
                    alt={title}
                    maxHeight="340px"
                />
            </Flex>
            <VStack p={"20px"} spacing={0} flex="1">
                <Text fontWeight="bold" fontSize="25px" mt={4} w={"full"}>
                    {title}
                </Text>
                <Text mt={2} color="gray.600">
                    {description}
                </Text>

                <Spacer/>

                <HStack w={"100%"} spacing={"0px"} justifyContent="space-around" mt={4}>
                    <VStack spacing={1} align="start">
                        <Flex align="center">
                            <FaTag size={"20px"} color={"#3D77E3"}/>
                            <Text fontWeight="bold" ml={2}>PRICE:</Text>
                        </Flex>
                        <Flex>
                            <Text fontSize="2xl" fontWeight="bold" color="black">
                                {discountedPrice}
                            </Text>
                            <Text fontSize="lg" color="red.500" as="s" ml={2} fontWeight="bold">
                                {originalPrice}
                            </Text>
                        </Flex>
                    </VStack>
                    <VStack spacing={1} align="start">
                        <Flex align="center">
                            <MdOutlineAccessTimeFilled size={"20px"} color={"#3D77E3"}/>
                            <Text fontWeight="bold" ml={2}>DURATION:</Text>
                        </Flex>
                        <Text fontSize="md" color="gray.600">
                            Approx. {duration} Hours.
                        </Text>
                    </VStack>
                </HStack>

                <HStack w={"100%"} spacing={"20px"} mt={4}>
                    <Flex h={"85px"} w={"full"}>
                        <Button w={"full"} h={"100%"}>Learn More</Button>
                    </Flex>
                    <Flex h={"85px"} w={"full"}>
                        <Button w={"full"} h={"100%"} onClick={openBooking}>
                            Book Now
                        </Button>
                    </Flex>
                </HStack>
            </VStack>

            <Modal isOpen={isBookingOpen} onClose={closeBooking} isCentered size="6xl">
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <BookingDetails onContinue={handleContinueToCheckout}/>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={handleCloseCheckout}
                totalDue={235.90}
                onBack={handleBackToBooking}
            />
        </Flex>
    );
}