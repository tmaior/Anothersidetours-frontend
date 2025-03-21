import React from 'react';
import { Box, Heading, Text, Icon } from '@chakra-ui/react';
import { FiTool } from 'react-icons/fi';

interface UnderConstructionProps {
  pageName: string;
}

export default function UnderConstruction({ pageName }: UnderConstructionProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      p={8}
      mt={10}
    >
      <Icon as={FiTool} boxSize={16} color="blue.500" mb={6} />
      <Heading mb={4} size="xl">{pageName}</Heading>
      <Text fontSize="lg" color="gray.600">
        This page is currently under construction. Please check back later.
      </Text>
    </Box>
  );
} 