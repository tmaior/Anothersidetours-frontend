import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
} from "@chakra-ui/react";
import {FiCalendar, FiWatch} from "react-icons/fi";
import { ArrowBackIcon } from "@chakra-ui/icons";

export default function ReservationDetail({ reservation, onCloseDetail }) {
    if (!reservation) {
        return (
            <Box p={4}>
                <Text>Nenhuma reserva selecionada. Selecione um item na lista ao lado.</Text>
            </Box>
        );
    }
    const { user } = reservation;

    return (
        <Box p={4}>
            <Button
                leftIcon={<ArrowBackIcon />}
                variant="outline"
                size="sm"
                mb={4}
                onClick={onCloseDetail}
            >
                Voltar
            </Button>
            <Flex alignItems="center" justifyContent="space-between" mb={4}>
                {/*<HStack spacing={4}>*/}
                {/*    <Text fontSize="xl" fontWeight="bold">*/}
                {/*        Filtros (exemplo)*/}
                {/*    </Text>*/}
                {/*    <Menu>*/}
                {/*        <MenuButton as={Button} variant="outline" size="sm" rightIcon={<ChevronDownIcon />}>*/}
                {/*            Products: All*/}
                {/*        </MenuButton>*/}
                {/*        <MenuList>*/}
                {/*            <MenuItem>All</MenuItem>*/}
                {/*            <MenuItem>Product A</MenuItem>*/}
                {/*            <MenuItem>Product B</MenuItem>*/}
                {/*        </MenuList>*/}
                {/*    </Menu>*/}
                {/*</HStack>*/}
            </Flex>
            <HStack alignItems="flex-start" justifyContent="space-between">
                <HStack alignItems="flex-start">
                    <Box boxSize="80px">
                        <Image
                            src={reservation.imageUrl || "https://via.placeholder.com/80"}
                            alt="Event Image"
                            borderRadius="md"
                            width="80px"
                            height="80px"
                            objectFit="cover"
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xl" fontWeight="bold">{reservation.title}</Text>
                        <HStack spacing={2}>
                            <Icon as={FiCalendar} color="gray.500" />
                            <Text fontSize="sm" color="gray.600">
                                {reservation.dateFormatted}
                            </Text>
                            <Icon as={FiWatch} color="gray.500" />
                            <Text fontSize="sm" color="gray.600">
                                {reservation.time}
                            </Text>
                        </HStack>
                    </Box>
                </HStack>
            </HStack>
            <HStack spacing={4} mt={4}>
                <Button size="sm" variant="outline">Message</Button>
                <Button size="sm" variant="outline">Change Arrival</Button>
                <Button size="sm" variant="outline">Cancel Reservations</Button>
                <Button size="sm" variant="outline">Email Roster</Button>
                <Button size="sm" variant="outline">Export Roster</Button>
                <Button size="sm" colorScheme="green">Purchase</Button>
            </HStack>
            <HStack spacing={8} mt={4}>
                <Box>
                    <Text fontSize="sm" fontWeight="bold">Guide</Text>
                    <Text fontSize="sm" color="green.500">
                        {reservation.guide}
                    </Text>
                    <Button variant="link" size="xs">Manage Guides</Button>
                </Box>
            </HStack>

            <Box mt={6} borderTop="1px solid" borderColor="gray.200" pt={4}>
                <HStack justifyContent="space-between">
                    <Text fontSize="lg" fontWeight="bold">Event Notes</Text>
                    <Button size="sm">Add Note</Button>
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={2}>
                    No notes added yet.
                </Text>
            </Box>

            <Box mt={6}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>Guests</Text>
                <Table size="sm" variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Action</Th>
                            <Th>Guest Name</Th>
                            <Th>Demographics</Th>
                            <Th>Balance Due</Th>
                            <Th>Notes</Th>
                            <Th>Waivers</Th>
                            <Th>Source</Th>
                            <Th>Vouchers</Th>
                            <Th>Phone</Th>
                            <Th>Email</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>
                                <Accordion allowToggle>
                                    <AccordionItem border="none">
                                        <AccordionButton p={0}>
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            Informações adicionais...
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                            </Td>
                            <Td>{user?.name || 'N/A'}</Td>
                            <Td>{reservation.guestQuantity}</Td>
                            <Td>0</Td>
                            <Td>
                                0 Purchase Notes<br />
                                0 Customer Notes
                            </Td>
                            <Td>
                                <Text color="green.500">3 Signed</Text>
                                <Text color="red.500">0 Unsigned</Text>
                            </Td>
                            <Td> - </Td>
                            <Td> - </Td>
                            <Td>{user?.phone || 'N/A'}</Td>
                            <Td>{user?.email || 'N/A'}</Td>
                        </Tr>
                    </Tbody>
                </Table>

                <HStack justifyContent="space-between" mt={4}>
                    <Text fontSize="sm" color="gray.500">Status: Checkout</Text>
                </HStack>
            </Box>
        </Box>
    );
}