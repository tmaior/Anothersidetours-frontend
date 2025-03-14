import React, {useState} from "react";
import {Box, HStack, IconButton, Image, Menu, MenuButton, MenuItem, MenuList, Stack, Text} from "@chakra-ui/react";
import {BsPersonX, BsThreeDots} from "react-icons/bs";
import ConfirmUnassignModal from "./ConfirmUnassignModal";
import {useGuideAssignment} from "../hooks/useGuideAssignment";
import ManageGuidesModal from "./ManageGuidesModal";
import CancelConfirmationModal from "./CancelConfirmationModal";
import BookingCancellationModal from "./BookingCancellationModal";
import SendMessageModal from "./SendMessageModal";
import ChangeArrivalModal from "./ChangeArrivalModal";
import ChangeCapacityModal from "./ChangeCapacityModal";
import AddEventNoteModal from "./AddEventNoteModal";
import {IoPersonAddOutline} from "react-icons/io5";
import {MdOutlineCancel, MdOutlineReduceCapacity} from "react-icons/md";
import {CiCalendar} from "react-icons/ci";
import {CgNotes, CgPlayListAdd} from "react-icons/cg";
import {FiSend} from "react-icons/fi";

const DashBoardMenu = ({reservation}) => {
    const [isUnassignModalOpen, setUnassignModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isCancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
    const [isBookingCancellationOpen, setBookingCancellationOpen] = useState(false);
    const [isSendMessageModalOpen, setSendMessageModalOpen] = useState(false);
    const [isChangeArrivalonOpen, setChangeArrivalOpen] = useState(false);
    const [isChangeCapacityModalOpen, setChangeCapacityModalOpen] = useState(false);
    const [isAddEventNoteModalOpen, setAddEventNoteModalOpen] = useState(false);
    const formatDate = (date: string | Date | undefined): string => {
        if (!date) return "Invalid Date";
        let parsedDate: Date;
        if (date instanceof Date) {
            parsedDate = date;
        } else {
            parsedDate = new Date(date);
        }
        if (isNaN(parsedDate.getTime())) return "Invalid Date";
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");
        const year = parsedDate.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const {assignGuides} = useGuideAssignment();

    const handleUnassignGuides = async (reservationId, guideIds) => {
        try {
            await assignGuides(reservationId, guideIds);
            console.log(`Successfully removed guides from reservation ID: ${reservationId}`);
        } catch (error) {
            console.error("Error removing guides:", error);
        }
    };

    const handleCancelReservation = async () => {
        try {
            console.log("Reservation canceled:", reservation.id);
            setCancelConfirmationOpen(false);
            setBookingCancellationOpen(true);
        } catch (error) {
            console.error("Error canceling reservation:", error);
        }
    };

    const handleSaveNote = (note) => {
        console.log("Note Saved:", note);
    };

    return (
        <>
            <Menu placement="left-start" offset={[-200, 0]}>
                <MenuButton
                    as={IconButton}
                    icon={<BsThreeDots/>}
                    variant="ghost"
                    aria-label="Options"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                />
                <MenuList
                    p={0}
                    borderRadius="md"
                    boxShadow="lg"
                    width="300px"
                    maxWidth="300px"
                    minHeight="200px"
                >
                    <Box p={4} borderBottomWidth="1px" bg="gray.50">
                        <Stack direction="row" spacing={4} align="center">
                            <Image
                                src={reservation.imageUrl || "https://via.placeholder.com/50"}
                                alt="Tour Image"
                                boxSize="50px"
                                borderRadius="md"
                            />
                            <Box>
                                <Text
                                    fontWeight="bold"
                                    fontSize="md"
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    maxWidth="260px"
                                >
                                    {reservation.title}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    {`${formatDate(reservation.dateFormatted)} - ${reservation.time}`}
                                </Text>
                            </Box>
                        </Stack>
                    </Box>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setSendMessageModalOpen(true);
                        }}
                    >
                        <HStack spacing={2}>
                            <FiSend/>
                            <Text>Send Message</Text>
                        </HStack>
                    </MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setAddEventNoteModalOpen(true);
                        }}
                    >
                        <HStack spacing={2}>
                            <CgPlayListAdd/>
                            <Text>Add Event Note</Text>
                        </HStack>
                    </MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setChangeArrivalOpen(true);
                        }}
                    >
                        <HStack spacing={2}>
                            <CiCalendar/>
                            <Text>Change Arrival</Text>
                        </HStack>
                    </MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setCancelConfirmationOpen(true);
                        }}
                    >
                        <HStack spacing={2}>
                            <MdOutlineCancel/>
                            <Text>Cancel Reservations</Text>
                        </HStack>
                    </MenuItem>
                    <MenuItem
                    >
                        <HStack spacing={2}>
                            <CgNotes/>
                            <Text>Roster</Text>
                        </HStack>
                    </MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setChangeCapacityModalOpen(true);
                        }}
                    >
                        <HStack spacing={2}>
                            <MdOutlineReduceCapacity/>
                            <Text>Adjust Capacity</Text>
                        </HStack>
                    </MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setAssignModalOpen(true);
                        }}
                    >
                        <HStack spacing={2}>
                            <IoPersonAddOutline/>
                            <Text>Assign Guides</Text>
                        </HStack>
                    </MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setUnassignModalOpen(true);
                        }}
                    >
                        <HStack spacing={2}>
                            <BsPersonX/>
                            <Text>Unassign Guides Guides</Text>
                        </HStack>
                    </MenuItem>
                </MenuList>
            </Menu>

            <ConfirmUnassignModal
                isOpen={isUnassignModalOpen}
                onClose={() => setUnassignModalOpen(false)}
                reservation={reservation}
                onConfirm={() => handleUnassignGuides(reservation.id, [])}
            />

            <ManageGuidesModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onSelectGuide={(selectedGuides) => {
                    const guideIds = selectedGuides.map((guide) => guide.id);
                    assignGuides(reservation.id, guideIds)
                        .then(() => {
                            console.log("Successfully assigned guides");
                        })
                        .catch((error) => {
                            console.error("Failed to assign guides:", error);
                        });
                }}
                reservationId={reservation.id}
            />

            <CancelConfirmationModal
                booking={reservation}
                isOpen={isCancelConfirmationOpen}
                onClose={() => setCancelConfirmationOpen(false)}
                onConfirm={handleCancelReservation}
            />

            <BookingCancellationModal
                booking={reservation}
                isOpen={isBookingCancellationOpen}
                onClose={() => setBookingCancellationOpen(false)}
                onStatusChange={undefined}
            />

            <SendMessageModal
                isOpen={isSendMessageModalOpen}
                onClose={() => setSendMessageModalOpen(false)}
                eventDetails={{
                    title: reservation.title,
                    date: reservation.dateFormatted,
                    time: reservation.time,
                    image: reservation.imageUrl
                }}
            />

            <ChangeArrivalModal
                booking={reservation}
                isOpen={isChangeArrivalonOpen}
                onClose={() => setChangeArrivalOpen(false)}
            />

            <ChangeCapacityModal
                isOpen={isChangeCapacityModalOpen}
                onClose={() => setChangeCapacityModalOpen(false)}
                eventDetails={reservation}
            />

            <AddEventNoteModal
                isOpen={isAddEventNoteModalOpen}
                onClose={() => setAddEventNoteModalOpen(false)}
                eventDetails={reservation}
                onSave={handleSaveNote} reservationId={reservation.id}/>
        </>
    );
};

export default DashBoardMenu;