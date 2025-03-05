import {
    Avatar,
    Box,
    Button,
    Flex,
    HStack,
    Image,
    Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {SlCalender} from "react-icons/sl";
import {FaBoxArchive, FaUsersGear} from "react-icons/fa6";
import {MdAddchart, MdOutlineCategory} from "react-icons/md";
import {GoPeople} from "react-icons/go";
import {IoClipboardOutline} from "react-icons/io5";
import {LuMegaphone, LuPiggyBank} from "react-icons/lu";
import {FaHandshake} from "react-icons/fa";
import {GiSettingsKnobs} from "react-icons/gi";
import {VscGraph} from "react-icons/vsc";
import {AiOutlineDashboard, AiOutlinePlus} from "react-icons/ai";
import {IoMdAppstore} from "react-icons/io";
import {useGuest} from "../contexts/GuestContext";
import {CartProvider} from "../contexts/CartContext";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {tenantId, setTenantId,} = useGuest();
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [noTenants, setNoTenants] = useState(false);
    const toast = useToast();

    useEffect(() => {

        if (noTenants) {
            setIsLoading(false);
            return;
        }

        if (!tenants.length || !tenantId) {
            setIsLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`)
                .then((response) => response.json())
                .then((data) => {
                    setTenants(data);

                    if (data.length === 0) {
                        setNoTenants(true);
                        toast({
                            title: "No City found",
                            description: "Please create a City to proceed.",
                            status: "warning",
                            duration: 5000,
                            isClosable: true,
                        });
                        return;
                    }
                    if (!tenantId && data.length > 0) {
                        const defaultTenant = data[0];
                        setSelectedTenant(defaultTenant);
                        setTenantId(defaultTenant.id);
                    } else if (tenantId) {
                        const existingTenant = data.find((tenant) => tenant.id === tenantId);
                        if (existingTenant) {
                            setSelectedTenant(existingTenant);
                        }
                    }
                })
                .catch((error) => console.error("Error fetching tenants:", error))
                .finally(() => setIsLoading(false));
        } else {
            const existingTenant = tenants.find((tenant) => tenant.id === tenantId);
            if (existingTenant) {
                setSelectedTenant(existingTenant);
            }
            setIsLoading(false);
        }
    }, [noTenants ,toast,tenantId, tenants, setTenantId]);

    const [newTenant, setNewTenant] = useState({title: "", description: "", image: null});

    const handleAddTenant = async () => {
        const formData = new FormData();
        formData.append('name', newTenant.title);
        formData.append('description', newTenant.description);
        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const createdTenant = await response.json();
                setTenants((prev) => [...prev, createdTenant]);
                setNewTenant({title: "", description: "", image: null});
                setSelectedImage(null);
                setPreviewUrl(null);
                onClose();
            } else {
                console.error("Failed to create tenant");
            }
        } catch (error) {
            console.error("Error creating tenant:", error);
        }
    };

    const handleSelectTenant = (tenant) => {
        setSelectedTenant(tenant);
        setTenantId(tenant.id);
        localStorage.setItem("selectedTenant", JSON.stringify(tenant));
    };

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
    };

    return (
        <CartProvider>
            <Box display="flex" minH="100vh">
                <Box
                    as="nav"
                    width="250px"
                    h={"1000px"}
                    bg="#222324"
                    p={4}
                    borderRight="1px solid #333"
                    display="flex"
                    flexDirection="column"
                    alignItems="stretch"
                >
                    <VStack spacing={4} align="stretch" marginTop={"-50px"}>
                        <Box
                            as="button"
                            onClick={() => router.push("/dashboard/reservation")}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Image
                                src="/assets/logo2.png"
                                alt="Home Logo"
                                boxSize="200px"
                                objectFit="contain"
                            />
                        </Box>
                        <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="white"
                            _hover={{cursor: "pointer"}}
                        >
                        </Text>
                        {/*<Text*/}
                        {/*    fontSize="md"*/}
                        {/*    color="gray.400"*/}
                        {/*    pl={4}*/}
                        {/*    onClick={() => router.push("/dashboard/tenant")}*/}
                        {/*    _hover={{ cursor: "pointer", color: "gray.200" }}*/}
                        {/*>*/}
                        {/*    Register Tenant*/}
                        {/*</Text>*/}
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/reservation")}
                        >
                            <Button
                                marginTop={"-130px"}
                                marginLeft={"-5"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/Dashboard" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <AiOutlineDashboard name="Dashboard"/>
                                    <Text>Dashboard</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/purchases")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/Purchases" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <LuPiggyBank name="Purchases"/>
                                    <Text>Purchases</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/under-construction")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/Customer" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <GoPeople name="Customer"/>
                                    <Text>Customer</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/list-tours")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/list-tours" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <FaBoxArchive name="Products"/>
                                    <Text>Products</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/under-construction")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/Resources" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <IoClipboardOutline name="Resources"/>
                                    <Text>Resources</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/under-construction")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/Reports" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <VscGraph name="Reports"/>
                                    <Text>Reports</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/under-construction")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/Marketing" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <LuMegaphone name="Marketing"/>
                                    <Text>Marketing</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/under-construction")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/Distribution" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <FaHandshake name="Distribution"/>
                                    <Text>Distribution</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/under-construction")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/App Store" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <IoMdAppstore name="Distribution"/>
                                    <Text>App Store</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/under-construction")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/Settings" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <GiSettingsKnobs name="Settings"/>
                                    <Text>Settings</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/guides")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/guides" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <FaUsersGear/>
                                    <Text>Guides</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/list-addons")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/list-addons" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <MdAddchart name="Add-ons"/>
                                    <Text>Add-ons</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/categories")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/categories" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <MdOutlineCategory name="Categories"/>
                                    <Text>Categories</Text>
                                </HStack>
                            </Button>
                        </Text>
                        <Text
                            fontSize="md"
                            color="gray.400"
                            pl={4}
                            onClick={() => router.push("/dashboard/blackouts")}
                        >
                            <Button
                                marginLeft={"-5"}
                                marginTop={"-130px"}
                                justifyContent="flex-start"
                                color="white"
                                variant="ghost"
                                w="230px"
                                background={router.pathname === "/dashboard/blackouts" ? "blue.500" : "transparent"}
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3}>
                                    <SlCalender name="Blackouts"/>
                                    <Text>Blackouts</Text>
                                </HStack>
                            </Button>
                        </Text>
                    </VStack>

                    <Box mt="10vh" p={4} marginLeft={"-6"} w={"273px"} marginTop={"-60px"}>
                        {/*{!isLoading && selectedTenant && (*/}
                        <Menu placement="right-start" offset={[0, 0]} closeOnSelect={false}>
                            <MenuButton
                                color="white"
                                variant="ghost"
                                as={Button}
                                borderRadius="md"
                                w="100%"
                                h="50px"
                                display="flex"
                                alignItems="center"
                                justifyContent="flex-start"
                                _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}
                                _active={{
                                    background: "blue.500",
                                    color: "white",
                                }}
                            >
                                <HStack spacing={3} alignItems="center">
                                    <Avatar size="sm" src={selectedTenant?.imageUrl || "https://bit.ly/broken-link"}/>
                                    <Box overflow="hidden">
                                        <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            isTruncated
                                            maxWidth="200px"
                                        >
                                            {selectedTenant?.name || "No City Selected"}
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color="gray.400"
                                            isTruncated
                                            maxWidth="200px"
                                        >
                                            {selectedTenant?.description || "No location provided"}
                                        </Text>
                                    </Box>
                                </HStack>
                            </MenuButton>
                            <MenuList minW="300px" bg="#222324"
                                      maxH="calc(100vh - 120px)"
                                      overflowY="auto">
                                {tenants.map((tenant) => (
                                    <MenuItem
                                        key={tenant.id}
                                        bg="#222324"
                                        color="white"
                                        _hover={{
                                            background: "rgba(255, 255, 255, 0.1)",
                                            transition: "background 0.2s ease-in-out",
                                        }}
                                        onClick={() => handleSelectTenant(tenant)}
                                    >
                                        <HStack spacing={3}>
                                            <Avatar size="sm" src={tenant.imageUrl}/>
                                            <Box>
                                                <Text fontSize="sm" fontWeight="bold">
                                                    {tenant.name}
                                                </Text>
                                                <Text fontSize="xs" color="gray.400">
                                                    {tenant.location}
                                                </Text>
                                            </Box>
                                        </HStack>
                                    </MenuItem>
                                ))}
                                <MenuDivider borderColor="#333" bg="#222324"/>
                                <MenuItem bg="#222324" color={"white"} _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}>Privacy Policy</MenuItem>
                                <MenuItem bg="#222324" color={"white"} _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}>Support</MenuItem>
                                <MenuItem bg="#222324" color={"white"} _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }}>Help Center</MenuItem>
                                <MenuDivider borderColor="#333"/>
                                {/*<MenuItem bg="#222324" color={"white"} _hover={{*/}
                                {/*    background: "rgba(255, 255, 255, 0.1)",*/}
                                {/*    transition: "background 0.2s ease-in-out",*/}
                                {/*}}>Another Side Of San Diego Tours</MenuItem>*/}
                                <MenuItem
                                    bg="#222324"
                                    color={"white"}
                                    _hover={{
                                        background: "rgba(255, 255, 255, 0.1)",
                                        transition: "background 0.2s ease-in-out",
                                    }}
                                    onClick={() => {
                                        localStorage.removeItem("user");
                                        router.push("/login");
                                    }}
                                >
                                    Logout
                                </MenuItem>
                                <MenuDivider borderColor="#333"/>
                                <MenuItem bg="#222324" color={"white"} icon={<AiOutlinePlus/>} _hover={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    transition: "background 0.2s ease-in-out",
                                }} onClick={onOpen}>
                                    Add New City
                                </MenuItem>
                            </MenuList>
                        </Menu>
                        {/*)}*/}
                    </Box>
                </Box>

                <Box flex="1" p={8}>
                    {isLoading ? (
                        <Text color="white">Loading...</Text>
                    ) : (
                        children
                    )}
                </Box>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay/>
                    <ModalContent>
                        <ModalHeader>Add New City</ModalHeader>
                        <ModalCloseButton/>
                        <ModalBody>
                            <VStack spacing={4}>
                                <Input
                                    placeholder="Name"
                                    value={newTenant.title}
                                    onChange={(e) =>
                                        setNewTenant((prev) => ({...prev, title: e.target.value}))
                                    }
                                />
                                <Textarea
                                    placeholder="Description"
                                    value={newTenant.description}
                                    onChange={(e) =>
                                        setNewTenant((prev) => ({...prev, description: e.target.value}))
                                    }
                                />
                                <VStack spacing={4} align="stretch">
                                    <HStack spacing={4}>
                                        <Button
                                            as="label"
                                            htmlFor="file-upload"
                                            cursor="pointer"
                                            colorScheme="blue"
                                            h={"32px"}
                                        >
                                            Choose File
                                        </Button>
                                        <Input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            display="none"
                                            onChange={handleFileChange}
                                        />
                                        {selectedImage && (
                                            <Button
                                                colorScheme="red"
                                                size="sm"
                                                onClick={removeImage}
                                            >
                                                Remove Image
                                            </Button>
                                        )}
                                    </HStack>

                                    {previewUrl && (
                                        <Flex direction="column" align="center" mt={4}>
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                boxSize="150px"
                                                objectFit="cover"
                                                borderRadius="md"
                                            />
                                            <Text mt={2}>{selectedImage?.name}</Text>
                                        </Flex>
                                    )}

                                    {!selectedImage && <Text>No file chosen</Text>}
                                </VStack>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                colorScheme="blue"
                                mr={3}
                                onClick={handleAddTenant}
                                isDisabled={!newTenant.title}
                            >
                                Save
                            </Button>
                            <Button onClick={onClose}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </CartProvider>
    );
}