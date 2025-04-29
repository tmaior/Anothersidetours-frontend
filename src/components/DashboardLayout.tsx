import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useGuest } from "../contexts/GuestContext";
import { CartProvider } from "../contexts/CartContext";
import { SidebarContent } from "./SidebarContent";
import { HamburgerIcon } from "@chakra-ui/icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { tenantId, setTenantId } = useGuest();
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noTenants, setNoTenants] = useState(false);
  const toast = useToast();
  const [key, setKey] = useState(router.asPath);
  const {
    isOpen: isMobileSidebarOpen,
    onOpen: openMobileSidebar,
    onClose: closeMobileSidebar,
  } = useDisclosure();

  useEffect(() => {
    const handleRouteChange = (url) => {
      setKey(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

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
            const existingTenant = data.find(
              (tenant) => tenant.id === tenantId
            );
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
  }, [noTenants, toast, tenantId, tenants, setTenantId]);

  const [newTenant, setNewTenant] = useState({
    title: "",
    description: "",
    image: null,
  });

  const handleAddTenant = async () => {
    const formData = new FormData();
    formData.append("name", newTenant.title);
    formData.append("description", newTenant.description);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const createdTenant = await response.json();
        setTenants((prev) => [...prev, createdTenant]);
        setNewTenant({ title: "", description: "", image: null });
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
    <>
      <IconButton
        aria-label="Open Menu"
        icon={<HamburgerIcon />}
        display={{ base: "flex", md: "none" }}
        onClick={openMobileSidebar}
        position="fixed"
        top="20px"
        left="20px"
        zIndex={999}
      />
      <CartProvider>
        <Box display="flex" minH="100vh" position="relative">
          <Box
            as="nav"
            display={{ base: "none", md: "flex" }}
            width="250px"
            position="fixed"
            height="100vh"
            bg="#222324"
            px={4}
            pt={6}
            pb={4}
            flexDirection="column"
            justifyContent="space-between"
            zIndex={10}
          >
            <SidebarContent
              selectedTenant={selectedTenant}
              tenants={tenants}
              handleSelectTenant={handleSelectTenant}
              onAddCityClick={onOpen}
              onLogout={() => {
                localStorage.removeItem("user");
                router.push("/login");
              }}
            />
          </Box>

          <Box
            flex="1"
            p={{ base: 4, md: 8 }}
            marginLeft={{ base: 0, md: "250px" }}
            maxW={{ base: "100%", md: "calc(100% - 250px)" }}
            overflowY="auto"
            minH="100vh"
            position="relative"
            zIndex={1}
          >
            {isLoading ? (
              <Text color="white">Loading...</Text>
            ) : (
              <div key={key}>{children}</div>
            )}
          </Box>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New City</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <Input
                    placeholder="Name"
                    value={newTenant.title}
                    onChange={(e) =>
                      setNewTenant((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                  <Textarea
                    placeholder="Description"
                    value={newTenant.description}
                    onChange={(e) =>
                      setNewTenant((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
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
      <Drawer
        placement="left"
        onClose={closeMobileSidebar}
        isOpen={isMobileSidebarOpen}
      >
        <DrawerOverlay />
        <DrawerContent bg="#222324" p={{ base: 4, md: 8 }}>
          <SidebarContent
            selectedTenant={selectedTenant}
            tenants={tenants}
            handleSelectTenant={handleSelectTenant}
            onAddCityClick={onOpen}
            onLogout={() => {
              localStorage.removeItem("user");
              router.push("/login");
            }}
            onItemClick={closeMobileSidebar}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}
