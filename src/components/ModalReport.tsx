import React from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    Heading,
    useDisclosure,
    Select, 
    Flex
  } from '@chakra-ui/react'

export default function ModalReport({openModal,onCloseModal}) {
  

  return (
    <>
      <Modal isOpen={openModal} onClose={onCloseModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent gap={4} padding={4}>
          <ModalHeader display={"flex"} justifyContent={"center"}><Heading fontSize={"26px"}>Schedule Export</Heading></ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" gap={4}>
                <Flex padding={4} background="#fff0f0">
                    <Text>To schedule this report, you must select a relative date range.</Text>
                </Flex>
                <Flex flexDirection="column">
                <Text fontWeight="bold">Date Range</Text>
                <Select></Select>
                </Flex>
          </ModalBody>


          <ModalFooter >
            <Button colorScheme='blue' mr={3} onClick={()=>onCloseModal()}>
              Cancel
            </Button>
            <Button variant='ghost'>Next</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
