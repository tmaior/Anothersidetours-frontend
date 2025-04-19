import {Avatar, Badge, Box, Grid, GridItem, IconButton, Text, VStack, HStack} from "@chakra-ui/react";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";
import {CiAt} from "react-icons/ci";

interface GuideItemProps {
    id: string;
    name: string;
    email: string;
    status: string;
    imageUrl?: string;
    onEdit: () => void;
    onDelete: () => void;
}

export default function GuideItem({
    id,
    name,
    email,
    status,
    imageUrl,
    onEdit,
    onDelete,
}: GuideItemProps) {
    return (
        <Box
            w={{ base: "40%", md: "50%", lg: "1100px" }}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            mb={2}
        >
            <Grid
                templateColumns="1fr 150px 1fr"
                alignItems="center"
            >
                <GridItem>
                    <Box display="flex" alignItems="center">
                        <Avatar name={name} src={imageUrl || undefined} mr={4}/>
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{name}</Text>
                            <HStack spacing={1} fontSize="sm" color="gray.600">
                                <CiAt />
                                <Text>{email}</Text>
                            </HStack>
                        </VStack>
                    </Box>
                </GridItem>

                <GridItem display="flex" justifyContent="center">
                    <Badge colorScheme="green">{status}</Badge>
                </GridItem>

                <GridItem display="flex" justifyContent="flex-end">
                    <IconButton
                        aria-label="Edit"
                        icon={<EditIcon boxSize={3}/>}
                        onClick={onEdit}
                        variant="outline"
                        w="50px"
                        h="30px"
                        _hover={{
                            borderColor: "black",
                        }}
                    />
                    <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon boxSize={3}/>}
                        onClick={onDelete}
                        variant="outline"
                        w="50px"
                        h="30px"
                        ml={2}
                        _hover={{
                            borderColor: "black",
                        }}
                    />
                </GridItem>
            </Grid>
        </Box>
    );
}
