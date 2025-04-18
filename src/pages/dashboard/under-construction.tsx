import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Box, Heading, Text, Icon, Button } from '@chakra-ui/react';
import { FaTools } from 'react-icons/fa';
import { useRouter } from 'next/router';
import withAuth from '../../utils/withAuth';

function UnderConstructionPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <Box 
        p={8} 
        textAlign="center"
        maxW="800px"
        mx="auto"
        mt={10}
      >
        <Icon as={FaTools} w={16} h={16} color="blue.500" mb={6} />
        <Heading mb={4}>Page Under Construction</Heading>
        <Text fontSize="lg" mb={6}>
          This feature is currently being developed and will be available soon. 
          Thank you for your patience.
        </Text>
        <Button
          colorScheme="blue"
          onClick={() => router.push('/dashboard/reservation')}
        >
          Return to Dashboard
        </Button>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(UnderConstructionPage); 