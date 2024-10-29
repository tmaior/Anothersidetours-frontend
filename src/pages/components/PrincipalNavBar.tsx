import { useRef } from 'react';
import { Flex, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, DrawerFooter, Button, Input, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Adsense from "./Adsense";

export default function PrincipalNavBar() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef();

    return (
        <>
            <Adsense />
            <Flex
                w="100%"
                h="60px"
                bg="tomato"
                alignItems="center"
                justifyContent="space-between"
                px={4}
            >
                {/* Logo ou título do Navbar */}
                <Flex fontSize="lg" fontWeight="bold">
                    MyApp
                </Flex>

                {/* Ícone do hambúrguer para dispositivos móveis */}
                <IconButton
                    ref={btnRef}
                    icon={<HamburgerIcon />}
                    variant="outline"
                    onClick={onOpen}
                    display={{ base: 'block', md: 'none' }}
                 aria-label={"Hamburguer-icon"}/>
            </Flex>

            {/* Drawer para menu lateral */}
            <Drawer
                size={'full'}
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Menu</DrawerHeader>

                    <DrawerBody>
                        {/* Adicione os links do menu aqui */}
                        <Input placeholder="Type here..." />
                    </DrawerBody>

                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue">Save</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
