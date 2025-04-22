import { Box, Button, Container, Heading, Text, VStack, Image } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { reservation } = router.query;
  const [reservationDetails, setReservationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.isReady && reservation) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservation}`,{
        method: "GET",
        credentials: "include",
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to load reservation details");
          }
          return response.json();
        })
        .then(data => {
          setReservationDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching reservation:", err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [reservation, router.isReady]);

  const handleReturnToHome = () => {
    window.location.href = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={10} centerContent>
        <VStack spacing={8}>
          <Heading>Loading Payment Details...</Heading>
          <Box h="50px" w="50px" borderRadius="50%" border="3px solid" 
            borderColor="blue.500" borderTopColor="transparent" 
            animation="spin 1s linear infinite" />
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10} centerContent>
        <VStack spacing={8}>
          <Heading color="red.500">Error</Heading>
          <Text>{error}</Text>
          <Button colorScheme="blue" onClick={handleReturnToHome}>Return Home</Button>
        </VStack>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Successful | Another Side Tours</title>
      </Head>
      <Container maxW="container.md" py={10} centerContent>
        <VStack spacing={8} align="center" w="full">
          <Image 
            src="https://another-images.s3.us-east-1.amazonaws.com/tours/logo.png" 
            alt="Another Side Tours Logo" 
            maxW="300px" 
          />
          
          <Box bg="green.50" p={6} borderRadius="lg" w="full" boxShadow="md">
            <VStack spacing={4} align="center">
              <Box p={3} bg="green.100" borderRadius="full">
                <Text fontSize="4xl" color="green.500">✓</Text>
              </Box>
              <Heading size="lg" color="green.600">Payment Successful!</Heading>
              <Text textAlign="center">
                Thank you for your payment. Your reservation has been confirmed.
              </Text>
              
              {reservationDetails && (
                <Box w="full" mt={4} p={4} bg="white" borderRadius="md" boxShadow="sm">
                  <VStack align="start" spacing={3}>
                    <Heading size="sm">Reservation Details</Heading>
                    <Box w="full">
                      <Text fontWeight="bold">Experience:</Text>
                      <Text>{reservationDetails.tour?.name || "Tour"}</Text>
                    </Box>
                    <Box w="full">
                      <Text fontWeight="bold">Date:</Text>
                      <Text>{new Date(reservationDetails.reservation_date).toLocaleDateString("en-US")}</Text>
                    </Box>
                    <Box w="full">
                      <Text fontWeight="bold">Guests:</Text>
                      <Text>{reservationDetails.guestQuantity}</Text>
                    </Box>
                    <Box w="full">
                      <Text fontWeight="bold">Total Amount:</Text>
                      <Text>${reservationDetails.total_price.toFixed(2)}</Text>
                    </Box>
                    <Box w="full">
                      <Text fontWeight="bold">Reservation ID:</Text>
                      <Text>{reservation}</Text>
                    </Box>
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
          
          <Text>A confirmation email has been sent to your email address.</Text>
          
          {/*<Button colorScheme="blue" size="lg" onClick={handleReturnToHome}>*/}
          {/*  Return to Home*/}
          {/*</Button>*/}
        </VStack>
      </Container>
    </>
  );
} 