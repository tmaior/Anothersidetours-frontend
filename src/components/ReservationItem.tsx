import {Box, Button, Flex, HStack, IconButton, Image, Text, VStack,} from "@chakra-ui/react";
import {BsSticky, BsThreeDots} from "react-icons/bs";
import {FaPencilAlt} from "react-icons/fa";

const ReservationItem = ({
                             date,
                             day,
                             availableSummary,
                             reservedSummary,
                             reservations,
                         }) => {
    return (
        <VStack align="stretch" spacing={4} bg="gray.50" p={4} borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                {date} {day} &nbsp;&nbsp; {availableSummary} - {reservedSummary}
            </Text>
            {reservations.map((item, index) => (
                <Flex
                    key={index}
                    bg="white"
                    p={3}
                    borderRadius="md"
                    align="center"
                    justify="space-between"
                    boxShadow="sm"
                >
                    <HStack spacing={3}>
                        <Box minWidth="70px">
                            <Text fontWeight="medium" fontSize="sm" color="gray.600">
                                {item.time}
                            </Text>
                        </Box>
                        <Image
                            src={item.imageUrl}
                            boxSize="40px"
                            borderRadius="md"
                            alt="Tour Icon"
                        />
                    </HStack>
                    <Box flex="1" ml={4}>
                        <Text fontWeight="semibold" fontSize="sm">
                            {item.title}
                        </Text>
                        <HStack spacing={3} fontSize="xs" color="gray.500">
                            <Text>{item.available}</Text>
                            <Text>{item.reservedDetails}</Text>
                        </HStack>
                    </Box>
                    <HStack spacing={4} align="center">
                        <Box boxSize="8px" borderRadius="full" bg={item.statusColor}/>
                        <HStack spacing={1}>
                            <FaPencilAlt color="gray"/>
                            <Text fontSize="xs">{item.capacity}</Text>
                        </HStack>
                        <Text fontSize="xs" color="green.600">
                            {item.guide}
                        </Text>
                        {item.hasNotes && (
                            <IconButton
                                icon={<BsSticky/>}
                                variant="ghost"
                                aria-label="Notes"
                                size="sm"
                                color="orange.500"
                            />
                        )}
                        <IconButton
                            icon={<BsThreeDots/>}
                            variant="ghost"
                            aria-label="Options"
                            size="sm"
                        />
                        <Button variant="outline" colorScheme="green" size="xs">
                            +
                        </Button>
                    </HStack>
                </Flex>
            ))}
        </VStack>
    );
};

export default ReservationItem;
