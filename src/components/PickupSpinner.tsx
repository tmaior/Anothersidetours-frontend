import {Box, Flex, HStack, IconButton, Text, VStack} from "@chakra-ui/react";
import {AddIcon, MinusIcon} from "@chakra-ui/icons";
import React from "react";

interface PickupSpinnerProps {
    title: string;
    description?: string;
    value: number;
    onChange: (value: number) => void;
    minValue: number;
    note?: string;
    pl?: number | object;
}

const PickupSpinner: React.FC<PickupSpinnerProps> = ({
                                                         title,
                                                         description,
                                                         value,
                                                         onChange,
                                                         minValue,
                                                         note,
                                                         pl = 95
                                                     }) => {
    const handleAdd = () => {
        onChange(value + 1);
    };

    const handleSubtract = () => {
        if (value > minValue) {
            onChange(value - 1);
        }
    };

    return (
        <Flex flexDir={"column"} width="100%" mt={2} mb={2}>
            <Text color={"blue.300"} fontSize={{ base: "sm", md: "md" }} fontWeight="medium">{title}</Text>

            <Box pl={pl}>
                <VStack align="flex-start" spacing={2} w="full">
                    {description && <Text fontSize={{ base: "sm", md: "md" }}>{description}</Text>}
                    <HStack spacing={"10px"} w="full" flexWrap={{ base: "wrap", md: "nowrap" }}>
                        <HStack spacing={2}>
                            <IconButton
                                size="sm"
                                borderRadius={"0px"}
                                variant="outline"
                                colorScheme="gray"
                                aria-label="minus"
                                icon={<MinusIcon boxSize={"9px"}/>}
                                onClick={handleSubtract}
                            />
                            <Text fontSize={"20px"}>{value}</Text>
                            <IconButton
                                size="sm"
                                borderRadius={"0px"}
                                variant="outline"
                                colorScheme="gray"
                                aria-label="add"
                                icon={<AddIcon boxSize={"9px"}/>}
                                onClick={handleAdd}
                            />
                        </HStack>
                        {note && (
                            <Text fontSize={{ base: "xs", md: "md" }} color="gray" mt={{ base: 1, md: 0 }}>
                                {note}
                            </Text>
                        )}
                    </HStack>
                </VStack>
            </Box>
        </Flex>
    );
};

export default PickupSpinner;