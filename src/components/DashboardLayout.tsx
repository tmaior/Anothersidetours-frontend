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
    Portal,
    Text,
    Textarea,
    useDisclosure,
    useToast,
    VStack,
    IconButton,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerOverlay,
    useBreakpointValue
} from "@chakra-ui/react";
import {useRouter} from "next/router";
import React, {useEffect, useRef, useState} from "react";
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
import {IoMdAppstore, IoMdMenu} from "react-icons/io";
import {useGuest} from "../contexts/GuestContext";
import {CartProvider} from "../contexts/CartContext";
import LogoutButton from "./LogoutButton";
import axios from "axios";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {tenantId, setTenantId} = useGuest();
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [noTenants, setNoTenants] = useState(false);
    const toast = useToast();
    const [key, setKey] = useState(router.asPath);
    const [user, setUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const currentToastIdRef = useRef(null);

    const {
        isOpen: isSidebarOpen,
        onOpen: onSidebarOpen,
        onClose: onSidebarClose
    } = useDisclosure();

    const showMobileMenu = useBreakpointValue({ base: true, md: true, lg: false });
    
    const isSmallMobile = useBreakpointValue({ base: true, sm: false });
    
    const isTablet = useBreakpointValue({ 
        base: false, 
        sm: true, 
        md: true, 
        lg: false 
    });
    
    const drawerSize = useBreakpointValue({ 
        base: "xs",
        sm: "xs",
        md: "xs"
    });

    useEffect(() => {
        const handleRouteChange = (url) => {
            setKey(url);
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router]);

    useEffect(() => {
        const storedTenantId = localStorage.getItem("tenantId");
        const storedTenant = localStorage.getItem("selectedTenant");
        if (storedTenantId && !tenantId) {
            setTenantId(storedTenantId);
        }
        if (storedTenant) {
            try {
                const parsedTenant = JSON.parse(storedTenant);
                setSelectedTenant(parsedTenant);
            } catch (e) {
                console.error("Error parsing stored tenant:", e);
            }
        }

        if (noTenants) {
            setIsLoading(false);
            return;
        }

        if (!tenants.length) {
            setIsLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            })
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

                    const currentTenantId = storedTenantId || tenantId;

                    if (!currentTenantId && data.length > 0) {
                        const defaultTenant = data[0];
                        setSelectedTenant(defaultTenant);
                        setTenantId(defaultTenant.id);

                        localStorage.setItem("tenantId", defaultTenant.id);
                        localStorage.setItem("selectedTenant", JSON.stringify(defaultTenant));
                    } else if (currentTenantId) {
                        const existingTenant = data.find((tenant) => tenant.id === currentTenantId);
                        if (existingTenant) {
                            setSelectedTenant(existingTenant);
                        }
                    }
                })
                .catch((error) => console.error("Error fetching tenants:", error))
                .finally(() => setIsLoading(false));
        } else {
            const effectiveTenantId = storedTenantId || tenantId;
            if (effectiveTenantId) {
                const existingTenant = tenants.find((tenant) => tenant.id === effectiveTenantId);
                if (existingTenant) {
                    setSelectedTenant(existingTenant);
                }
            }
            setIsLoading(false);
        }
    }, [noTenants, toast, tenantId, tenants, setTenantId]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                    withCredentials: true,
                });

                if (response.data) {
                    setUser(response.data);
                    setUserPermissions(response.data.permissions || []);
                }
            } catch (error) {
                console.error("Authentication error:", error);
                router.push("/login");
            }
        };
        checkAuth();
    }, [router]);

    const hasPermission = (permission) => {
        if (!user) return false;
        const isAdmin = user.roles?.some(role => role.name === 'ADMIN');
        if (isAdmin) return true;
        return userPermissions.includes(permission);
    };

    const handleNavigate = (path, requiredPermission) => {
        if (!requiredPermission || hasPermission(requiredPermission)) {
            window.location.href = path;

            if (showMobileMenu) {
                onSidebarClose();
            }
        } else {
            if (currentToastIdRef.current) {
                toast.close(currentToastIdRef.current);
            }
            currentToastIdRef.current = toast({
                title: "Access Denied",
                description: "You don't have permission to access this page. Please contact your administrator.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };
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
                credentials: 'include',
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
        localStorage.setItem("tenantId", tenant.id);
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
            <Box display="flex" minH="100vh" position="relative">
                {showMobileMenu && (
                    <IconButton
                        aria-label="Open menu"
                        icon={<IoMdMenu />}
                        position="fixed"
                        top="10px"
                        left="10px"
                        zIndex={20}
                        colorScheme="blue"
                        onClick={onSidebarOpen}
                    />
                )}

                {!showMobileMenu && (
                    <Box
                        as="nav"
                        width="250px"
                        position="fixed"
                        height="100vh"
                        bg="#222324"
                        p={4}
                        borderRight="1px solid #333"
                        display="flex"
                        flexDirection="column"
                        alignItems="stretch"
                        zIndex={10}
                    >
                        <VStack spacing={4} align="stretch" marginTop={"-50px"}>
                            <Box
                                as="button"
                                onClick={() => window.location.href = "/dashboard/reservation"}
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

                            <Text
                                fontSize="md"
                                color="gray.400"
                                pl={4}
                                onClick={() => handleNavigate("/dashboard/reservation", "DASHBOARD_ACCESS")}
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
                                onClick={() => handleNavigate("/dashboard/purchases", "RESERVATION_MANAGE")}
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
                                onClick={() => handleNavigate("/dashboard/under-construction", "EMPLOYEE_READ")}
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
                                onClick={() => handleNavigate("/dashboard/list-tours", "TOUR_READ")}
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
                                onClick={() => handleNavigate("/dashboard/under-construction", "REPORT_ACCESS")}
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
                                onClick={() => handleNavigate("/dashboard/reports", "REPORT_ACCESS")}
                            >
                                <Button
                                    marginLeft={"-5"}
                                    marginTop={"-130px"}
                                    justifyContent="flex-start"
                                    color="white"
                                    variant="ghost"
                                    w="230px"
                                    background={router.pathname === "/dashboard/reports" ? "blue.500" : "transparent"}
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
                                onClick={() => handleNavigate("/dashboard/under-construction", "ROLE_READ")}
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
                                onClick={() => handleNavigate("/dashboard/under-construction", "ROLE_READ")}
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
                                onClick={() => handleNavigate("/dashboard/under-construction", "ROLE_READ")}
                            >
                                <Button
                                    marginLeft={"-5"}
                                    marginTop={"-130px"}
                                    justifyContent="flex-start"
                                    color="white"
                                    variant="ghost"
                                    w="230px"
                                    background={router.pathname === "/dashboard/under-construction" ? "blue.500" : "transparent"}
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
                                onClick={() => handleNavigate("/dashboard/settings", "ROLE_READ")}
                            >
                                <Button
                                    marginLeft={"-5"}
                                    marginTop={"-130px"}
                                    justifyContent="flex-start"
                                    color="white"
                                    variant="ghost"
                                    w="230px"
                                    background={router.pathname === "/dashboard/settings" ? "blue.500" : "transparent"}
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
                                onClick={() => handleNavigate("/dashboard/guides", "EMPLOYEE_READ")}
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
                                onClick={() => handleNavigate("/dashboard/list-addons", "TOUR_READ")}
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
                                onClick={() => handleNavigate("/dashboard/categories", "TOUR_READ")}
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
                                onClick={() => handleNavigate("/dashboard/blackouts", "TOUR_READ")}
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

                        <Box mt="10vh" p={4} marginLeft={"-6"} w={"238px"} marginTop={"-60px"} position="relative"
                             zIndex={100}>
                            <Menu
                                placement="right-start"
                                offset={[0, 0]}
                                closeOnSelect={false}
                                isLazy
                                lazyBehavior="keepMounted"
                                gutter={0}
                                strategy="fixed"
                            >
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
                                <Portal>
                                    <MenuList
                                        minW="300px"
                                        bg="#222324"
                                        maxH="calc(100vh - 120px)"
                                        overflowY="auto"
                                        zIndex={9999}
                                        position="relative"
                                        boxShadow="0px 0px 15px rgba(0, 0, 0, 0.5)"
                                    >
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
                                        <LogoutButton
                                            as={MenuItem}
                                            bg="#222324"
                                            color="white"
                                            w="100%"
                                            justifyContent="flex-start"
                                            _hover={{background: "rgba(255,255,255,0.1)"}}
                                        >
                                            Logout
                                        </LogoutButton>
                                        <MenuDivider borderColor="#333"/>
                                        <MenuItem bg="#222324" color={"white"} icon={<AiOutlinePlus/>} _hover={{
                                            background: "rgba(255, 255, 255, 0.1)",
                                            transition: "background 0.2s ease-in-out",
                                        }} onClick={onOpen}>
                                            Add New City
                                        </MenuItem>
                                    </MenuList>
                                </Portal>
                            </Menu>
                        </Box>
                    </Box>
                )}

                <Drawer
                    isOpen={isSidebarOpen}
                    placement="left"
                    onClose={onSidebarClose}
                    size={drawerSize}
                >
                    <DrawerOverlay />
                    <DrawerContent 
                        bg="#222324" 
                        color="white" 
                        maxW="250px"
                    >
                        <DrawerCloseButton color="white" />
                        <DrawerBody p={0} overflowY="auto">
                            <Box
                                height="100%"
                                display="flex"
                                flexDirection="column"
                                alignItems="stretch"
                                p={4}
                                overflowY="auto"
                            >
                                <VStack spacing={4} align="stretch" marginTop={"-50px"}>
                                    <Box
                                        as="button"
                                        onClick={() => window.location.href = "/dashboard/reservation"}
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

                                    <Text
                                        fontSize="md"
                                        color="gray.400"
                                        pl={4}
                                        onClick={() => handleNavigate("/dashboard/reservation", "DASHBOARD_ACCESS")}
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
                                        onClick={() => handleNavigate("/dashboard/purchases", "RESERVATION_MANAGE")}
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
                                        onClick={() => handleNavigate("/dashboard/under-construction", "EMPLOYEE_READ")}
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
                                        onClick={() => handleNavigate("/dashboard/list-tours", "TOUR_READ")}
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
                                        onClick={() => handleNavigate("/dashboard/under-construction", "REPORT_ACCESS")}
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
                                        onClick={() => handleNavigate("/dashboard/reports", "REPORT_ACCESS")}
                                    >
                                        <Button
                                            marginLeft={"-5"}
                                            marginTop={"-130px"}
                                            justifyContent="flex-start"
                                            color="white"
                                            variant="ghost"
                                            w="230px"
                                            background={router.pathname === "/dashboard/reports" ? "blue.500" : "transparent"}
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
                                        onClick={() => handleNavigate("/dashboard/under-construction", "ROLE_READ")}
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
                                        onClick={() => handleNavigate("/dashboard/under-construction", "ROLE_READ")}
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
                                        onClick={() => handleNavigate("/dashboard/under-construction", "ROLE_READ")}
                                    >
                                        <Button
                                            marginLeft={"-5"}
                                            marginTop={"-130px"}
                                            justifyContent="flex-start"
                                            color="white"
                                            variant="ghost"
                                            w="230px"
                                            background={router.pathname === "/dashboard/under-construction" ? "blue.500" : "transparent"}
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
                                        onClick={() => handleNavigate("/dashboard/settings", "ROLE_READ")}
                                    >
                                        <Button
                                            marginLeft={"-5"}
                                            marginTop={"-130px"}
                                            justifyContent="flex-start"
                                            color="white"
                                            variant="ghost"
                                            w="230px"
                                            background={router.pathname === "/dashboard/settings" ? "blue.500" : "transparent"}
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
                                        onClick={() => handleNavigate("/dashboard/guides", "EMPLOYEE_READ")}
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
                                        onClick={() => handleNavigate("/dashboard/list-addons", "TOUR_READ")}
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
                                        onClick={() => handleNavigate("/dashboard/categories", "TOUR_READ")}
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
                                        onClick={() => handleNavigate("/dashboard/blackouts", "TOUR_READ")}
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

                                <Box mt="10vh" p={4} marginLeft={"-6"} w={"238px"} marginTop={"-60px"} position="relative"
                                     zIndex={100}>
                                    <Menu
                                        placement="right-start"
                                        offset={[0, 0]}
                                        closeOnSelect={false}
                                        isLazy
                                        lazyBehavior="keepMounted"
                                        gutter={0}
                                        strategy="fixed"
                                    >
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
                                        <Portal>
                                            <MenuList
                                                minW="300px"
                                                bg="#222324"
                                                maxH="calc(100vh - 120px)"
                                                overflowY="auto"
                                                zIndex={9999}
                                                position="relative"
                                                boxShadow="0px 0px 15px rgba(0, 0, 0, 0.5)"
                                            >
                                            </MenuList>
                                        </Portal>
                                    </Menu>
                                </Box>
                            </Box>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                <Box
                    flex="1"
                    p={{ base: 4, md: 8 }}
                    marginLeft={{ base: 0, lg: "250px" }}
                    maxW={{ base: "100vw", lg: "calc(100vw - 250px)" }}
                    overflowY="auto"
                    overflowX="hidden"
                    minH="100vh"
                    position="relative"
                    zIndex={1}
                    pt={{ base: "50px", md: 4 }}
                >
                    {isLoading ? (
                        <Text color="white">Loading...</Text>
                    ) : (
                        <div key={key}>
                            {children}
                        </div>
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