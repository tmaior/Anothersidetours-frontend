import {Button, Flex, HStack, Image} from "@chakra-ui/react";

interface FooterBarProps {
    onContinue?: () => void;
    continueText?: string;
}

export default function FooterBar({onContinue, continueText}: FooterBarProps) {

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
            mt="auto"
            marginTop={["10px", "20px"]}
        >
            <HStack spacing={4} pl={8} py={[4, 0]}>
                {/*<Text fontSize="sm" color="gray.500">*/}
                {/*    POWERED BY*/}
                {/*</Text>*/}
                <Image
                    src="/assets/logo.png"
                    alt="another side logo"
                    h="50px"
                />
            </HStack>
            <Flex align="center" justify="flex-end" flex={1}>
                {/*<HStack spacing={4} pr={4}>*/}
                {/*    <Image*/}
                {/*        src="https://checkout.xola.app/images/ssl-secure-encryption.svg"*/}
                {/*        alt="SSL Secure Encryption"*/}
                {/*        h="30px"*/}
                {/*    />*/}
                {/*</HStack>*/}

                {onContinue && continueText && (
                    <Button bg="#0574BC" color="white" _hover={{bg: "#0554BC"}} h={["auto", "60px"]}
                            w={["100%", "auto"]} px={8} fontSize="lg" fontWeight="normal" borderRadius={0}
                            onClick={onContinue}> {continueText} </Button>)}
            </Flex>
        </Flex>
    );
}