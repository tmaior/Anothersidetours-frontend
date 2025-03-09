import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

export default function ReportsSelectedDatesChip({ selectedDateType, startDate, endDate }) {
  const dateString = (date: string | number | Date) => {
    const d = new Date(date);
    const fullMonthName = d.toLocaleString('default', { month: 'long' });
    const fullMonthNameCapitalized = fullMonthName.charAt(0).toUpperCase() + fullMonthName.slice(1)
    const day = d.getDate();
    const year = d.getFullYear().toString();
    return `${fullMonthNameCapitalized} ${day}, ${year}`;
  };

  return (
    <Flex align="center" gap={2} backgroundColor={"#d1e1ff"} border={"1px solid #1352c6"} borderRadius={"6px"} padding={"4px"}>
      <Text  fontSize="12px" fontWeight="bold">{selectedDateType}</Text>
      <Text fontSize="12px">
        is between {dateString(startDate)} - {dateString(endDate)}
      </Text>
    </Flex>
  );
}
