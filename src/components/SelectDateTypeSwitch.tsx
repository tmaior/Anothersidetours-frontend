import { Flex } from '@chakra-ui/react'
import React from 'react'

export default function SelectDateTypeSwitch({selectedDateType,selectedOption}) {
  return (
    <>
        <Flex>
            <Flex sx={{border: "1px solid #e0e3e7", backgroundColor: selectedDateType==="booking" ? "#3182ce": "white", color:  selectedDateType==="booking" ? "white": "black"}} borderLeftRadius={"10px"} padding="10px" align={"center"} cursor={"pointer"} fontSize={"18px"} onClick={()=>selectedOption("booking")}>Booking Date</Flex >
            <Flex sx={{border: "1px solid #e0e3e7",backgroundColor: selectedDateType==="arrival" ? "#3182ce": "white", color:  selectedDateType==="arrival" ? "white": "black"}} align={"center"} borderRightRadius={"10px"} padding="10px" cursor={"pointer"} fontSize={"18px"} onClick={()=>selectedOption("arrival")}>Arrival Date</Flex >
        </Flex>
      
    </>
  )
}
