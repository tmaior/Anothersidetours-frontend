import React from "react";
import {Box, IconButton, Image, Menu, MenuButton, MenuItem, MenuList, Stack, Text} from "@chakra-ui/react";
import {BsThreeDots} from "react-icons/bs";

const DashBoardMenu = ({reservation}) => {

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


    return (
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
                <MenuItem>Cancel Reservations</MenuItem>
                <MenuItem>Roster</MenuItem>
                <MenuItem>Adjust Capacity</MenuItem>
                <MenuItem>Assign Guides</MenuItem>
                <MenuItem>Unassign Guides</MenuItem>
            </MenuList>
        </Menu>
    );
};

export default DashBoardMenu;
