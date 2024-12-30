import {
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    VStack,
} from "@chakra-ui/react";
import {BsSticky, BsThreeDots} from "react-icons/bs";
import {FaPencilAlt} from "react-icons/fa";
import React, {useEffect, useState} from "react";
import {AiOutlineCompass} from "react-icons/ai";
import ManageGuidesModal from "./ManageGuidesModal";
import axios from "axios";

const ReservationItem = ({
                             date,
                             day,
                             availableSummary,
                             reservedSummary,
                             reservations,
                             onNoteClick,
                             onSelectReservation,
                             isCompactView,
                         }) => {
    const [isGuideModalOpen, setGuideModalOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<string>("");
    const [guidesList, setGuidesList] = useState<string[]>([]);
    const [loadingGuides, setLoadingGuides] = useState(true);

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/guides`)
            .then((response) => {
                const guideNames = response.data.map((guide) => guide.name);
                setGuidesList(guideNames);
            })
            .catch((error) => {
                console.error("Failed to fetch guides", error);
            })
            .finally(() => setLoadingGuides(false));
    }, []);

    const handleGuideSelection = (selectedGuides: string[], guideList: string[]) => {
        setSelectedGuide(selectedGuides.length > 0 ? selectedGuides.join(", ") : "No Guide selected");
        setGuidesList(guideList);
    };

    const displayGuideText = () => {
        if (loadingGuides) {
            return "Loading guides...";
        }
        if (guidesList.length === 0) {
            return "No Guide available";
        }
        return selectedGuide || "No Guide selected";
    };

    const handleOpenGuideModal = (e) => {
        e.stopPropagation();
        setGuideModalOpen(true);
    };

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
                    cursor="pointer"
                    onClick={() => onSelectReservation(item)}
                >
                    <HStack spacing={3}>
                        <Box minWidth="40px" textAlign="center">
                            <Text fontWeight="medium" fontSize="sm" color="gray.600">
                                {item.time.split(' ')[0]}
                            </Text>
                            <Text fontWeight="light" fontSize="xs" color="gray.500" mt="-1">
                                {item.time.split(' ')[1]}
                            </Text>
                        </Box>
                        <Image
                            src={item.imageUrl}
                            boxSize="70px"
                            borderRadius="md"
                            alt="Tour Icon"
                            objectFit="fill"
                        />
                    </HStack>
                    <Box flex="1" ml={4}>
                        {!isCompactView && (
                            <Text fontWeight="semibold" fontSize="sm">
                                {item.title}
                            </Text>
                        )}
                        {!isCompactView && (
                            <HStack spacing={3} fontSize="xs" color="gray.500">
                                <Text>{item.available}</Text>
                                <Text>{item.reservedDetails}</Text>
                            </HStack>
                        )}
                    </Box>

                    {!isCompactView && (
                        <HStack spacing={4} align="center">
                            <Box boxSize="8px" borderRadius="full" bg={item.statusColor}/>
                            <Flex
                                w={"900px"}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p={2}
                            >
                                <HStack spacing={1}>
                                    <FaPencilAlt
                                        color="gray"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Text fontSize="xs">{item.capacity}</Text>
                                </HStack>
                                <Flex justify="center" align="center" flex="1">
                                    <AiOutlineCompass/>
                                    <Text
                                        marginLeft={"5px"}
                                        fontSize="xs"
                                        color="green.600"
                                        textAlign="center"
                                        onClick={handleOpenGuideModal}
                                        cursor="pointer"
                                        _hover={{color: "blue.500"}}
                                    >
                                        {displayGuideText()}
                                    </Text>
                                </Flex>
                                <ManageGuidesModal
                                    isOpen={isGuideModalOpen}
                                    onClose={() => setGuideModalOpen(false)}
                                    onSelectGuide={(selectedGuides, guideList) => {
                                        handleGuideSelection(selectedGuides, guideList);
                                    }}
                                />
                                <Flex align="center" justify="center">
                                    {item.hasNotes ? (
                                        <IconButton
                                            icon={<BsSticky/>}
                                            variant="ghost"
                                            aria-label="Notes"
                                            size="sm"
                                            color="orange.500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNoteClick(item);
                                            }}
                                        />
                                    ) : (
                                        <Box width="20px"/>
                                    )}
                                </Flex>
                            </Flex>
                            <Menu>
                                <MenuButton
                                    as={IconButton}
                                    icon={<BsThreeDots/>}
                                    variant="ghost"
                                    aria-label="Options"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <MenuList>
                                    <MenuItem>Download</MenuItem>
                                    <MenuItem>Create a Copy</MenuItem>
                                    <MenuItem>Mark as Draft</MenuItem>
                                    <MenuItem>Delete</MenuItem>
                                    <MenuItem>Attend a Workshop</MenuItem>
                                </MenuList>
                            </Menu>
                            <Button
                                variant="outline"
                                colorScheme="green"
                                size="xs"
                                onClick={(e) => e.stopPropagation()}
                            >
                                +
                            </Button>
                        </HStack>
                    )}
                </Flex>
            ))}
        </VStack>
    );
};

export default ReservationItem;
