import React from 'react'
import { Flex, Box, Text } from '@chakra-ui/react'

interface SettingListItemProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}

export default function SettingListItem({ title, description, icon, isActive, onClick }: SettingListItemProps) {
    return (
        <Flex 
            align="center" 
            borderBottom="1px solid" 
            borderColor="gray.200" 
            height="150px" 
            sx={{ cursor: "pointer" }} 
            justifyContent="center" 
            width="100%" 
            backgroundColor={isActive ? "#d1e1ff": 'white' }
            onClick={onClick}
            _hover={{ backgroundColor: isActive ? "#d1e1ff" : "#f5f7fa" }}
            transition="background-color 0.2s"
        >
            <Box display="flex" flexDirection="row" gap={3} >
                <Flex align="center" flexDirection="column" paddingTop={1}>
                    {icon && <Box>{icon}</Box>}
                </Flex>
                <Flex flexDirection="column">
                    <Text fontWeight="bold" fontSize="lg">{title}</Text>
                    <Text color="gray.500" fontSize="sm" width={"200px"}>{description}</Text>
                </Flex>
            </Box>
        </Flex>
    )
}
