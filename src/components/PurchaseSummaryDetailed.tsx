import React from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  VStack,
} from '@chakra-ui/react';

interface AddonItem {
  name: string;
  price: number;
  quantity: number;
}

interface TourItem {
  name: string;
  bookingFeePercent: number;
  pricePerGuest: number;
  guestCount: number;
  gratuityAmount: number;
  gratuityPercent: number;
  addons?: AddonItem[];
  total?: number;
}

interface PaymentInfo {
  date: string;
  amount: number;
}

interface PurchaseSummaryDetailedProps {
  tours: TourItem[];
  payments: PaymentInfo[];
  onApplyCode?: () => void;
}

const PurchaseSummaryDetailed: React.FC<PurchaseSummaryDetailedProps> = ({
  tours,
  payments,
  onApplyCode,
}) => {
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const calculateTourTotal = (tour: TourItem) => {
    if (tour.total !== undefined) {
      return tour.total;
    }
    const guestsTotal = tour.pricePerGuest * tour.guestCount;
    const addonsTotal = tour.addons?.reduce((sum, addon) =>
      sum + (addon.price * addon.quantity), 0) || 0;

    return guestsTotal + tour.gratuityAmount + addonsTotal;
  };

  const grandTotal = tours.reduce((total, tour) => total + calculateTourTotal(tour), 0);

  return (
    <Box
         bg="gray.50" p={6}
         marginTop={"-350px"}
    >
      <VStack spacing={6} align="stretch">
        <Text fontWeight="bold" fontSize="lg">Purchase Summary</Text>

        {tours.map((tour, index) => {
          const guestsTotal = tour.pricePerGuest * tour.guestCount;
          const formattedGuestsTotal = formatCurrency(guestsTotal);
          const tourTotal = calculateTourTotal(tour);
          const formattedTourTotal = formatCurrency(tourTotal);

          return (
            <Box key={index}>
              <Text fontWeight="bold" fontSize="md">{tour.name}</Text>
              <VStack align="stretch" spacing={1} mt={2}>
                <Flex justify="space-between">
                  <Text>{`Guests ($${formatCurrency(tour.pricePerGuest)} × ${tour.guestCount})`}</Text>
                  <Text>${formattedGuestsTotal}</Text>
                </Flex>

                {tour.gratuityAmount > 0 && (
                  <Flex justify="space-between">
                    <Text>{`Gratuity (${tour.gratuityPercent}%)`}</Text>
                    <Text>${formatCurrency(tour.gratuityAmount)}</Text>
                  </Flex>
                )}

                {tour.addons && tour.addons.length > 0 && (
                  <>
                    {tour.addons.map((addon, addonIndex) => (
                      <Flex key={`addon-${addonIndex}`} justify="space-between">
                        <Text>{`${addon.name} ($${formatCurrency(addon.price)} × ${addon.quantity})`}</Text>
                        <Text>${formatCurrency(addon.price * addon.quantity)}</Text>
                      </Flex>
                    ))}
                  </>
                )}
              </VStack>
              <Flex justify="space-between" mt={3} mb={4}>
                <Button size="sm" variant="outline" colorScheme="blue">
                  Modify
                </Button>
                <Box textAlign="right">
                  <Text fontWeight="bold">Total</Text>
                  <Text fontWeight="bold">${formattedTourTotal}</Text>
                </Box>
              </Flex>
              {index < tours.length - 1 && <Divider my={4} />}
            </Box>
          );
        })}

        <Divider my={2} />
        <Flex justify="space-between">
          <Text fontWeight="bold" fontSize="lg">Grand Total</Text>
          <Text fontWeight="bold" fontSize="lg">${formatCurrency(grandTotal)}</Text>
        </Flex>

        <Box mt={4}>
          <Text fontWeight="bold" fontSize="lg">Payment Summary</Text>
          <VStack align="stretch" spacing={2} mt={2}>
            {payments.map((payment, index) => (
              <Flex key={index} justify="space-between">
                <Flex alignItems="center">
                  <Box
                    as="span"
                    borderRadius="full"
                    bg="gray.300"
                    color="gray.800"
                    p={1}
                    mr={2}
                    fontSize="xs"
                  >
                    ℹ️
                  </Box>
                  <Text>Payment {payment.date}</Text>
                </Flex>
                <Text>${formatCurrency(payment.amount)}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Flex justify="space-between" mt={2}>
          <Box>
            <Button size="sm" variant="outline" colorScheme="blue" onClick={onApplyCode}>
              Apply Code
            </Button>
          </Box>
          <Box textAlign="right">
            <Text fontWeight="bold">Paid</Text>
            <Text fontWeight="bold">${formatCurrency(grandTotal)}</Text>
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
};

export default PurchaseSummaryDetailed;