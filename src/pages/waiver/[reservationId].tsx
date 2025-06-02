import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Container, Heading, Spinner, Text, Center, Button } from '@chakra-ui/react';
import WaiverForm from '../../components/waiver/WaiverForm';

const WaiverPage = () => {
  const router = useRouter();
  const { reservationId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (reservationId) {
        //TODO make a validation for the reservation for now its just a mock data to successful validation after a shor delay
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [reservationId]);

  const handleWaiverComplete = () => {
    setCompleted(true);
  };

  const handleReturnToDashboard = () => {
    router.push('/dashboard/reservation');
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading waiver information...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10} textAlign="center">
        <Heading as="h2" size="lg" mb={4}>
          Error
        </Heading>
        <Text mb={8}>{error}</Text>
        <Button colorScheme="blue" onClick={handleReturnToDashboard}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  if (completed) {
    return (
      <Container maxW="container.md" py={10} textAlign="center">
        <Heading as="h2" size="lg" mb={4}>
          Waiver Submitted Successfully
        </Heading>
        <Text mb={8}>
          Thank you! Your waiver has been submitted and is now associated with your reservation.
        </Text>
        <Button colorScheme="blue" onClick={handleReturnToDashboard}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <WaiverForm 
        reservationId={reservationId as string} 
        onComplete={handleWaiverComplete} 
      />
    </Box>
  );
};

export default WaiverPage; 