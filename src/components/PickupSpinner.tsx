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
    pl?: number;
}

const PickupSpinner: React.FC<PickupSpinnerProps> = ({
                                                         title,
                                                         description,
                                                         value,
                                                         onChange,
                                                         minValue,
                                                         note,
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
        <Flex flexDir={"column"} width="100%" >
            <Text color={"blue.300"}>{title}</Text>

            <Box pl={95}>
                <VStack align="flex-start" spacing={2} w="full">
                    {description && <Text>{description}</Text>}
                    <HStack spacing={"10px"} w="full">
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
                            <Text fontSize="md" color="gray">
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