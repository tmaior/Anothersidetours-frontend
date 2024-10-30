import {Flex, Text} from "@chakra-ui/react";

export default function CheckoutBody({title, totalDue}) {
    return (
        <Flex flexDirection="column" alignItems="center" w="full">
            <Text fontSize="lg" fontWeight="bold">
                {title}
            </Text>
            <Text mt={2}>Total Due Now: ${totalDue}</Text>
        </Flex>
    );
}
