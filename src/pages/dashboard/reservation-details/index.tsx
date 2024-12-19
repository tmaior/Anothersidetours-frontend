import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
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
    Tr
} from "@chakra-ui/react";
import {ChevronDownIcon} from "@chakra-ui/icons";
import {FiCalendar} from "react-icons/fi";
import DashboardLayout from "../../../components/DashboardLayout";

export default function Dashboard2() {
    return (
        <DashboardLayout>
            <Box p={4}>
                <Flex alignItems="center" justifyContent="space-between" mb={4}>
                    <HStack spacing={4}>
                        <Text fontSize="xl" fontWeight="bold">
                            Filters:
                        </Text>
                        <Menu>
                            <MenuButton as={Button} variant="outline" size="sm" rightIcon={<ChevronDownIcon/>}>
                                Products: All
                            </MenuButton>
                            <MenuList>
                                <MenuItem>All</MenuItem>
                                <MenuItem>Product A</MenuItem>
                                <MenuItem>Product B</MenuItem>
                            </MenuList>
                        </Menu>

                        <Menu>
                            <MenuButton as={Button} variant="outline" size="sm" rightIcon={<ChevronDownIcon/>}>
                                Equipment: All
                            </MenuButton>
                            <MenuList>
                                <MenuItem>All</MenuItem>
                                <MenuItem>Equipment A</MenuItem>
                                <MenuItem>Equipment B</MenuItem>
                            </MenuList>
                        </Menu>

                        <Menu>
                            <MenuButton as={Button} variant="outline" size="sm" rightIcon={<ChevronDownIcon/>}>
                                Guides: All
                            </MenuButton>
                            <MenuList>
                                <MenuItem>All</MenuItem>
                                <MenuItem>Guide A</MenuItem>
                                <MenuItem>Guide B</MenuItem>
                            </MenuList>
                        </Menu>
                    </HStack>

                    <Button variant="outline" size="sm">
                        Sync Calendar
                    </Button>
                </Flex>

                <Grid templateColumns="300px 1fr" gap={4}>
                    <GridItem bg="gray.50" borderRadius="md" p={4}>
                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">13 Dec</Text>
                            <Box mt={2} p={2} bg="blue.50" borderRadius="md" cursor="pointer">
                                <HStack alignItems="flex-start">
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold">12:00 PM</Text>
                                        <Text fontSize="xs" color="green.500">Available</Text>
                                        <Text fontSize="xs" color="gray.500">2 Reserved</Text>
                                    </Box>
                                    <Image
                                        src="https://via.placeholder.com/40"
                                        alt="Event"
                                        borderRadius="md"
                                    />
                                </HStack>
                            </Box>
                        </Box>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">13 Dec</Text>
                            <Box mt={2} p={2} bg="blue.50" borderRadius="md" cursor="pointer">
                                <HStack alignItems="flex-start">
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold">2:00 PM</Text>
                                        <Text fontSize="xs" color="green.500">Available</Text>
                                        <Text fontSize="xs" color="gray.500">5 Reserved</Text>
                                    </Box>
                                    <Image
                                        src="https://via.placeholder.com/40"
                                        alt="Event"
                                        borderRadius="md"
                                    />
                                </HStack>
                            </Box>
                        </Box>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">15 Dec</Text>
                            <Box mt={2} p={2} bg="blue.50" borderRadius="md" cursor="pointer">
                                <HStack alignItems="flex-start">
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold">9:00 AM</Text>
                                        <Text fontSize="xs" color="green.500">Available</Text>
                                        <Text fontSize="xs" color="gray.500">4 Reserved</Text>
                                    </Box>
                                    <Image
                                        src="https://via.placeholder.com/40"
                                        alt="Event"
                                        borderRadius="md"
                                    />
                                </HStack>
                            </Box>
                        </Box>

                        <Button variant="outline" width="100%">
                            Load More
                        </Button>
                    </GridItem>
                    <GridItem p={4}>
                        <HStack alignItems="flex-start" justifyContent="space-between">
                            <HStack alignItems="flex-start">
                                <Box boxSize="80px">
                                    <Image
                                        src="https://via.placeholder.com/80"
                                        alt="Event Image"
                                        borderRadius="md"
                                        width="80px"
                                        height="80px"
                                        objectFit="cover"
                                    />
                                </Box>
                                <Box>
                                    <Text fontSize="xl" fontWeight="bold">The Santa Monica & Venice Beach E-Bike
                                        Tour</Text>
                                    <HStack spacing={2}>
                                        <Icon as={FiCalendar} color="gray.500"/>
                                        <Text fontSize="sm" color="gray.600">December 13, 2024 | 12:00 PM</Text>
                                    </HStack>
                                </Box>
                            </HStack>
                        </HStack>
                        <HStack spacing={4} mt={4}>
                            <Button size="sm" variant="outline">
                                Message
                            </Button>
                            <Button size="sm" variant="outline">
                                Change Arrival
                            </Button>
                            <Button size="sm" variant="outline">
                                Cancel Reservations
                            </Button>
                            <Button size="sm" variant="outline">
                                Email Roster
                            </Button>
                            <Button size="sm" variant="outline">
                                Export Roster
                            </Button>
                            <Button size="sm" colorScheme="green">
                                Purchase
                            </Button>
                        </HStack>
                        <HStack spacing={8} mt={4}>
                            <Box>
                                <Text fontSize="sm" fontWeight="bold">
                                    Guide
                                </Text>
                                <Text fontSize="sm" color="green.500">Luce Metrius</Text>
                                <Button variant="link" size="xs">Manage Guides</Button>
                            </Box>

                            <Box>
                                <Text fontSize="sm" fontWeight="bold">
                                    Equipment
                                </Text>
                                <Text fontSize="sm" color="gray.600">Manage Equipment</Text>
                            </Box>

                            <Box>
                                <Text fontSize="sm" fontWeight="bold">
                                    Capacity
                                </Text>
                                <Text fontSize="sm" color="green.500">2 Reserved</Text>
                                <Button variant="link" size="xs">Manage Capacity</Button>
                            </Box>
                        </HStack>

                        <Box mt={6} borderTop="1px solid" borderColor="gray.200" pt={4}>
                            <HStack justifyContent="space-between">
                                <Text fontSize="lg" fontWeight="bold">Event Notes</Text>
                                <Button size="sm">Add Note</Button>
                            </HStack>
                            <Text fontSize="sm" color="gray.500" mt={2}>No notes added yet.</Text>
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
                                                        <AccordionIcon/>
                                                    </AccordionButton>
                                                    <AccordionPanel>
                                                        Informações adicionais...
                                                    </AccordionPanel>
                                                </AccordionItem>
                                            </Accordion>
                                        </Td>
                                        <Td>Michael Hirt</Td>
                                        <Td>2 Guests</Td>
                                        <Td>0</Td>
                                        <Td>
                                            0 Purchase Notes<br/>
                                            0 Customer Notes
                                        </Td>
                                        <Td>
                                            <Text color="green.500">3 Signed</Text>
                                            <Text color="red.500">0 Unsigned</Text>
                                        </Td>
                                        <Td> - </Td>
                                        <Td> - </Td>
                                        <Td>
                                            <Text color="blue.600" as="a" href="tel:+13133103813">(313) 310-3813</Text>
                                        </Td>
                                        <Td>
                                            <Text color="blue.600" as="a" href="mailto:michael@example.com">
                                                michael@example.com
                                            </Text>
                                        </Td>
                                    </Tr>
                                </Tbody>
                            </Table>

                            <HStack justifyContent="space-between" mt={4}>
                                <Text fontSize="sm" color="gray.500">Status: Checkout</Text>
                            </HStack>
                        </Box>
                    </GridItem>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}