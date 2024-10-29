import { Button, Flex, HStack, Image, Text, VStack, Spacer } from "@chakra-ui/react";
import { FaTag } from "react-icons/fa";
import { MdOutlineAccessTimeFilled } from "react-icons/md";

export default function CardHome({ title, description, originalPrice, discountedPrice, duration, image }) {
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
                <Text mt={2} color="gray.600" >
                    {description}
                </Text>

                <Spacer /> {/* Empurra o próximo elemento para o final do card */}

                {/* Seção de Preço e Duração */}
                <HStack w={"100%"} spacing={"0px"} justifyContent="space-around" mt={4}>
                    {/* Preço */}
                    <VStack spacing={1} align="start">
                        <Flex align="center">
                            <FaTag size={"20px"} color={"#3D77E3"} />
                            <Text fontWeight="bold" ml={2}>
                                PRICE:
                            </Text>
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

                    {/* Duração */}
                    <VStack spacing={1} align="start">
                        <Flex align="center">
                            <MdOutlineAccessTimeFilled size={"20px"} color={"#3D77E3"} />
                            <Text fontWeight="bold" ml={2}>
                                DURATION:
                            </Text>
                        </Flex>
                        <Text fontSize="md" color="gray.600">
                            Approx. {duration} Hours.
                        </Text>
                    </VStack>
                </HStack>

                {/* Botões */}
                <HStack w={"100%"} spacing={"20px"} mt={4}>
                    <Flex h={"85px"} w={"full"}>
                        <Button w={"full"} h={"100%"}>
                            Learn More
                        </Button>
                    </Flex>
                    <Flex h={"85px"} w={"full"}>
                        <Button w={"full"} h={"100%"}>
                            Book Now
                        </Button>
                    </Flex>
                </HStack>
            </VStack>
        </Flex>
    );
}
