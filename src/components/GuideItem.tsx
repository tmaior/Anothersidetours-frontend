import {Avatar, Badge, Box, Grid, GridItem, IconButton, Text, VStack, HStack, Flex, useBreakpointValue} from "@chakra-ui/react";
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
    const isMobile = useBreakpointValue({ base: true, sm: false });

    return (
        <Box
            w="100%"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={{ base: 3, md: 4 }}
            mb={2}
            boxShadow="sm"
        >
            {isMobile ? (
                <VStack spacing={3} align="stretch">
                    <Flex align="center">
                        <Avatar name={name} src={imageUrl || undefined} mr={3} size="sm"/>
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="sm">{name}</Text>
                            <HStack spacing={1} fontSize="xs" color="gray.600">
                                <CiAt />
                                <Text>{email}</Text>
                            </HStack>
                        </VStack>
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                        <Badge colorScheme="green">{status}</Badge>
                        
                        <HStack spacing={2}>
                            <IconButton
                                aria-label="Edit"
                                icon={<EditIcon boxSize={3}/>}
                                onClick={onEdit}
                                variant="outline"
                                size="sm"
                                _hover={{
                                    borderColor: "black",
                                }}
                            />
                            <IconButton
                                aria-label="Delete"
                                icon={<DeleteIcon boxSize={3}/>}
                                onClick={onDelete}
                                variant="outline"
                                size="sm"
                                _hover={{
                                    borderColor: "black",
                                }}
                            />
                        </HStack>
                    </Flex>
                </VStack>
            ) : (
                <Grid
                    templateColumns={{ sm: "1fr auto", md: "1fr 150px 1fr" }}
                    gap={{ sm: 4, md: 0 }}
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

                    <GridItem display="flex" justifyContent={{ sm: "flex-start", md: "center" }}>
                        <Badge colorScheme="green">{status}</Badge>
                    </GridItem>

                    <GridItem display="flex" justifyContent="flex-end" gridColumn={{ sm: "2", md: "auto" }} gridRow={{ sm: "1", md: "auto" }}>
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
            )}
        </Box>
    );
}
