import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Image,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr, useToast,
} from "@chakra-ui/react";
import {FiCalendar, FiWatch} from "react-icons/fi";
import {ArrowBackIcon} from "@chakra-ui/icons";
import React, {useState} from "react";
import ManageGuidesModal from "../../../components/ManageGuidesModal";
import {CiSquarePlus} from "react-icons/ci";
import NotesSection from "../../../components/NotesSection";
import {FaRegTimesCircle} from "react-icons/fa";
import {AiOutlineCompass} from "react-icons/ai";
import {useGuides} from "../../../hooks/useGuides";
import {useGuideAssignment} from "../../../hooks/useGuideAssignment";

export default function ReservationDetail({reservation, onCloseDetail}) {
    const [isGuideModalOpen, setGuideModalOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState([]);
    const {guidesList, loadingGuides} = useGuides();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { assignGuides, isAssigning } = useGuideAssignment();
    const toast = useToast();

    const displayGuideText = () => {
        if (loadingGuides) {
            return "Loading guides...";
        }
        if (guidesList.length === 0) {
            return "No Guide available";
        }
        if (selectedGuide.length > 0) {
            return selectedGuide.map((guide) => guide.name).join(", ");
        }
        return "No Guide selected";
    };

    const handleSaveGuides = async (guides) => {
        const guideIds = guides.map((guide) => guide.id);

        if (guideIds.length === 0) {
            toast({
                title: "No guides selected",
                description: "Please select at least one guide.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await assignGuides(reservation.id, guideIds);
            toast({
                title: "Guides Assigned",
                description: "Guides successfully assigned to reservation",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to assign guides",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


    if (!reservation) {
        return (
            <Box p={4}>
                <Text>No reservation selected. Select an item from the list below.</Text>
            </Box>
        );
    }
    const {user} = reservation;

    return (
        <Box p={4} overflowX="hidden">
            <Divider marginTop={"-15px"} maxW={"100%"}/>
            <Button
                marginTop={"15px"}
                leftIcon={<ArrowBackIcon/>}
                variant="outline"
                size="sm"
                mb={4}
                onClick={onCloseDetail}
            >
                Back
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
                    <Box boxSize="130px">
                        <Image
                            src={reservation.imageUrl || "https://via.placeholder.com/80"}
                            alt="Event Image"
                            borderRadius="md"
                            width="130px"
                            height="130px"
                            objectFit="contain"
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xl" fontWeight="bold">{reservation.title}</Text>
                        <HStack spacing={2}>
                            <Icon as={FiCalendar} color="gray.500"/>
                            <Text fontSize="sm" color="gray.600">
                                {reservation.dateFormatted}
                            </Text>
                            <Icon as={FiWatch} color="gray.500"/>
                            <Text fontSize="sm" color="gray.600">
                                {reservation.time}
                            </Text>
                        </HStack>
                    </Box>
                </HStack>
            </HStack>
            <HStack spacing={4} mt={4}>
                <Button size="sm" colorScheme="green">Accept</Button>
                <Button size="sm" colorScheme="red">Reject</Button>
                <Button size="sm" variant="outline">Message</Button>
                <Button size="sm" variant="outline">Change Arrival</Button>
                <Button size="sm" variant="outline"
                        color={"red.500"}>
                    <FaRegTimesCircle style={{marginRight: '8px'}}/>
                    Cancel Reservations
                </Button>
                <Button size="sm" variant="outline">Email Roster</Button>
                <Button size="sm" variant="outline">Export Roster</Button>
                <Button size="sm" variant="outline" color={"green"}> + Purchase</Button>
            </HStack>
            <HStack spacing={8} mt={4}>
                <Box mt={6}>
                    <HStack spacing={2}>
                        <AiOutlineCompass/>
                        <Text fontSize="xl" fontWeight="bold">Guide</Text>
                    </HStack>
                    <Text fontSize="sm" color="black.500">
                        {displayGuideText()}
                    </Text>

                    <Button
                        variant="link"
                        size="xs"
                        onClick={() => setGuideModalOpen(true)}
                        color="black"
                        fontWeight={"bold"}
                    >
                        <CiSquarePlus size={"17px"}/>
                        Manage Guides
                    </Button>
                </Box>
                <ManageGuidesModal
                    isOpen={isGuideModalOpen}
                    onClose={() => setGuideModalOpen(false)}
                    onSelectGuide={(selected) => {
                        setSelectedGuide(selected);
                        setGuideModalOpen(false);
                        handleSaveGuides(selected);
                    }}
                />
            </HStack>

            <NotesSection
                notes={[
                    {title: "Guest Arrival", content: "Guests will arrive at 10 AM."},
                ]}
            />

            <Box mt={6} maxW="100%" overflowX="auto">
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
                            <Td>{user?.name || 'N/A'}</Td>
                            <Td>{reservation.guestQuantity}</Td>
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