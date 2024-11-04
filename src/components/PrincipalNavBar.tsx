import { useEffect, useRef, useState } from 'react';
import {
    Flex, IconButton, Drawer, DrawerOverlay, DrawerContent,
    DrawerCloseButton, DrawerHeader, DrawerBody, DrawerFooter, Button,
    HStack, Link, Image, useDisclosure, VStack
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Adsense from "./Adsense";

export default function PrincipalNavBar() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <Adsense />
            <Flex
                position="sticky"
                top="0"
                w="100%"
                h={isScrolled ? "100px" : "60px"}
                bg={isScrolled ? "white" : "transparent"}
                alignItems="center"
                justifyContent="space-between"
                px={4}
                zIndex="1000"
                boxShadow={isScrolled ? "md" : "none"}
                transition="height 0.3s ease"
            >
                <Flex display={{ base: "none", md: "block" }} ml={20}>
                    <Image src="https://anothersideoflosangelestours.com/wp-content/uploads/2015/11/cropped-NEW-LOS-ANGELES_LOGO_031914.jpg"
                           alt="Logo"
                           boxSize={isScrolled ? "100px" : "200px"} />
                </Flex>
                <HStack spacing={6} display={{ base: "none", md: "flex" }} mx="auto">
                    <Link href="#" fontWeight="bold">Home</Link>
                    <Link href="#" fontWeight="bold">All Categories</Link>
                    <Link href="#" fontWeight="bold">City Tours</Link>
                    <Link href="#" fontWeight="bold">Private Tours</Link>
                    <Link href="#" fontWeight="bold">Segway Tours</Link>
                    <Link href="#" fontWeight="bold">E-Bike Tours</Link>
                    <Link href="#" fontWeight="bold">Team Building</Link>
                    <Link href="#" fontWeight="bold">On Sale</Link>
                    <Link href="#" fontWeight="bold">Contact Us</Link>
                </HStack>
                <IconButton
                    ref={btnRef}
                    icon={<HamburgerIcon />}
                    variant="outline"
                    onClick={onOpen}
                    display={{ base: 'block', md: 'none' }}
                    aria-label="Menu"
                />
            </Flex>
            <Drawer
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
                        <VStack spacing={4} align="start">
                            <Link href="#" fontWeight="bold">Home</Link>
                            <Link href="#" fontWeight="bold">All Categories</Link>
                            <Link href="#" fontWeight="bold">City Tours</Link>
                            <Link href="#" fontWeight="bold">Private Tours</Link>
                            <Link href="#" fontWeight="bold">Segway Tours</Link>
                            <Link href="#" fontWeight="bold">E-Bike Tours</Link>
                            <Link href="#" fontWeight="bold">Team Building</Link>
                            <Link href="#" fontWeight="bold">On Sale</Link>
                            <Link href="#" fontWeight="bold">Contact Us</Link>
                        </VStack>
                    </DrawerBody>

                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button colorScheme="blue">Save</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
