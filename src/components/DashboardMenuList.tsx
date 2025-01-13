import React, {useState} from "react";
import {Box, IconButton, Image, Menu, MenuButton, MenuItem, MenuList, Stack, Text} from "@chakra-ui/react";
import {BsThreeDots} from "react-icons/bs";
import ConfirmUnassignModal from "./ConfirmUnassignModal";
import {useGuideAssignment} from "../hooks/useGuideAssignment";
import ManageGuidesModal from "./ManageGuidesModal";
import CancelConfirmationModal from "./CancelConfirmationModal";
import BookingCancellationModal from "./BookingCancellationModal";

const DashBoardMenu = ({reservation}) => {
    const [isUnassignModalOpen, setUnassignModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isCancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
    const [isBookingCancellationOpen, setBookingCancellationOpen] = useState(false);

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
                    <MenuItem>Send Message</MenuItem>
                    <MenuItem>Add Event Note</MenuItem>
                    <MenuItem>Change Arrival</MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setCancelConfirmationOpen(true);
                        }}
                    >
                        Cancel Reservations
                    </MenuItem>
                    <MenuItem>Roster</MenuItem>
                    <MenuItem>Adjust Capacity</MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setAssignModalOpen(true);
                        }}
                    >
                        Assign Guides
                    </MenuItem>
                    <MenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setUnassignModalOpen(true);
                        }}
                    >
                        Unassign Guides
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
                    console.log("Selected guides:", selectedGuides);
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
            />
        </>
    );
};

export default DashBoardMenu;