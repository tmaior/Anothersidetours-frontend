import {Button, Checkbox, Flex, HStack, Image, Text} from "@chakra-ui/react";
import {GiShoppingCart} from "react-icons/gi";
import {useState} from "react";

export default function CheckoutFooter({totalAmount, onCheckout}) {

    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    return (
        <Flex
            position="static"
            w="full"
            h={["auto", "60px"]}
            bg="gray.100"
            align="center"
            justify="space-between"
            boxShadow="md"
            zIndex={1000}
            px={0}
            flexDirection={["column", "row"]}
            mt={4}
        >
            <Button
                bg="gray.500"
                color="white"
                _hover={{bg: "gray.400"}}
                h={["auto", "60px"]}
                w={["100%", "auto"]}
                px={8}
                fontSize="lg"
                fontWeight="normal"
                borderRadius={0}
                // onClick={onBack}
                onClick={onCheckout}
            >
                Back
            </Button>
            <HStack spacing={4} pl={8} py={[4, 0]}>
                <Text fontSize="sm" color="gray.500">
                    POWERED BY
                </Text>
                <Image
                    src="https://checkout.xola.app/images/xola-logo.png"
                    alt="Xola logo"
                    h="30px"
                />
            </HStack>
            <Flex align="flex-end" flex={5} justify="flex-end">
                <Checkbox
                    position="absolute"
                    bottom="70px"
                    isChecked={isChecked}
                    onChange={handleCheckboxChange}
                    w="300px"
                >
                    I agree to the Terms and Conditions
                </Checkbox>
                <HStack spacing={7}>
                    <Image
                        src="https://checkout.xola.app/images/ssl-secure-encryption.svg"
                        alt="SSL Secure Encryption"
                        h="30px"
                    />
                    <Button
                        bg="#5CB85C"
                        color="white"
                        _hover={{bg: "#4cae4c"}}
                        h={"60px"}
                        w={"400px"}
                        // px={8}
                        fontSize="lg"
                        fontWeight="normal"
                        borderRadius={0}
                        isDisabled={!isChecked}
                    >
                        <GiShoppingCart/>
                        PAY: ${totalAmount}
                    </Button>
                </HStack>
            </Flex>
        </Flex>
    );
}
