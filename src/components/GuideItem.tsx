import {Avatar, Badge, Box, Grid, GridItem, IconButton, Text} from "@chakra-ui/react";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";

interface GuideItemProps {
    name: string;
    status: string;
    onEdit: () => void;
    onDelete: () => void;
}

export default function GuideItem({
                                      name,
                                      status,
                                      onEdit,
                                      onDelete,
                                  }: GuideItemProps) {
    return (
        <Box
            marginTop={"10"}
            w={"1500px"}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
        >
            <Grid
                templateColumns="1fr 150px 1fr"
                alignItems="center"
            >
                <GridItem>
                    <Box display="flex" alignItems="center">
                        <Avatar name={name} src="https://bit.ly/broken-link" mr={4}/>
                        <Text fontWeight="bold">{name}</Text>
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
