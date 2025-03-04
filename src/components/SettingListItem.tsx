import React from 'react'
import { Flex, Box, Text } from '@chakra-ui/react'

export default function SettingListItem({ title, description, icon }) {
    return (
        <Flex align="center" borderBottom="1px solid" borderColor="gray.200" height="150px" sx={{ cursor: "pointer" }} justifyContent="center" width="100%">

            <Box display="flex" flexDirection="row" gap={3}>
                <Flex align="center" flexDirection="column" paddingTop={1}>
                    {icon && <Box>{icon}</Box>}
                </Flex>
                <Flex flexDirection="column" >
                    <Text fontWeight="bold" fontSize="lg">{title}</Text>
                    <Text color="gray.500" fontSize="sm">{description}</Text>
                </Flex>
            </Box>

        </Flex>
    )
}
