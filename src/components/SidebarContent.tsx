import {
  Avatar,
  Box,
  Button,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AiOutlineDashboard, AiOutlinePlus } from "react-icons/ai";
import { LuPiggyBank, LuMegaphone } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { FaBoxArchive, FaHandshake, FaUsersGear } from "react-icons/fa6";
import { IoClipboardOutline } from "react-icons/io5";
import { VscGraph } from "react-icons/vsc";
import { MdAddchart, MdOutlineCategory } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { GiSettingsKnobs } from "react-icons/gi";
import { IoMdAppstore } from "react-icons/io";
import { useRouter } from "next/router";
import React from "react";

interface SidebarContentProps {
  selectedTenant?: any;
  tenants?: any[];
  handleSelectTenant?: (tenant: any) => void;
  onAddCityClick?: () => void;
  onLogout?: () => void;
  onItemClick?: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    icon: AiOutlineDashboard,
    path: "/dashboard/reservation",
  },
  { label: "Purchases", icon: LuPiggyBank, path: "/dashboard/purchases" },
  { label: "Customer", icon: GoPeople, path: "/dashboard/under-construction" },
  { label: "Products", icon: FaBoxArchive, path: "/dashboard/list-tours" },
  {
    label: "Resources",
    icon: IoClipboardOutline,
    path: "/dashboard/under-construction",
  },
  { label: "Reports", icon: VscGraph, path: "/dashboard/reports" },
  {
    label: "Marketing",
    icon: LuMegaphone,
    path: "/dashboard/under-construction",
  },
  {
    label: "Distribution",
    icon: FaHandshake,
    path: "/dashboard/under-construction",
  },
  {
    label: "App Store",
    icon: IoMdAppstore,
    path: "/dashboard/under-construction",
  },
  { label: "Settings", icon: GiSettingsKnobs, path: "/dashboard/settings" },
  { label: "Guides", icon: FaUsersGear, path: "/dashboard/guides" },
  { label: "Add-ons", icon: MdAddchart, path: "/dashboard/list-addons" },
  {
    label: "Categories",
    icon: MdOutlineCategory,
    path: "/dashboard/categories",
  },
  { label: "Blackouts", icon: SlCalender, path: "/dashboard/blackouts" },
];

export const SidebarContent: React.FC<SidebarContentProps> = ({
  selectedTenant,
  tenants = [],
  handleSelectTenant,
  onAddCityClick,
  onLogout,
  onItemClick,
}) => {
  const router = useRouter();

  return (
    <Box
      width="250px"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <VStack spacing={4} align="stretch" mt="-50px">
        <Box
          as="button"
          onClick={() => {
            window.location.href = "/dashboard/reservation";
            onItemClick?.();
          }}
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

        {navItems.map(({ label, icon: Icon, path }) => (
          <Text
            key={label}
            fontSize="md"
            color="gray.400"
            pl={4}
            onClick={() => {
              window.location.href = path;
              onItemClick?.();
            }}
          >
            <Button
              marginLeft={"-5"}
              marginTop={"-130px"}
              justifyContent="flex-start"
              color="white"
              variant="ghost"
              w="230px"
              background={router.pathname === path ? "blue.500" : "transparent"}
              _hover={{ background: "rgba(255, 255, 255, 0.1)" }}
              _active={{ background: "blue.500", color: "white" }}
            >
              <HStack spacing={3}>
                <Icon />
                <Text>{label}</Text>
              </HStack>
            </Button>
          </Text>
        ))}
      </VStack>

      <Box p={4} ml="-6" w="273px" position="relative" zIndex={100}>
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
            _hover={{ background: "rgba(255, 255, 255, 0.1)" }}
            _active={{ background: "blue.500", color: "white" }}
          >
            <HStack spacing={3} alignItems="center">
              <Avatar
                size="sm"
                src={selectedTenant?.imageUrl || "https://bit.ly/broken-link"}
              />
              <Box overflow="hidden">
                <Text fontSize="sm" fontWeight="bold" isTruncated maxW="200px">
                  {selectedTenant?.name || "No City Selected"}
                </Text>
                <Text fontSize="xs" color="gray.400" isTruncated maxW="200px">
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
                  _hover={{ background: "rgba(255, 255, 255, 0.1)" }}
                  onClick={() => {
                    handleSelectTenant?.(tenant);
                    onItemClick?.();
                  }}
                >
                  <HStack spacing={3}>
                    <Avatar size="sm" src={tenant.imageUrl} />
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
              <MenuDivider borderColor="#333" bg="#222324" />
              <MenuItem
                bg="#222324"
                color="white"
                _hover={{ background: "rgba(255, 255, 255, 0.1)" }}
              >
                Privacy Policy
              </MenuItem>
              <MenuItem
                bg="#222324"
                color="white"
                _hover={{ background: "rgba(255, 255, 255, 0.1)" }}
              >
                Support
              </MenuItem>
              <MenuItem
                bg="#222324"
                color="white"
                _hover={{ background: "rgba(255, 255, 255, 0.1)" }}
              >
                Help Center
              </MenuItem>
              <MenuDivider borderColor="#333" />
              <MenuItem
                bg="#222324"
                color="white"
                _hover={{ background: "rgba(255, 255, 255, 0.1)" }}
                onClick={onLogout}
              >
                Logout
              </MenuItem>
              <MenuDivider borderColor="#333" />
              <MenuItem
                bg="#222324"
                color="white"
                icon={<AiOutlinePlus />}
                _hover={{ background: "rgba(255, 255, 255, 0.1)" }}
                onClick={onAddCityClick}
              >
                Add New City
              </MenuItem>
            </MenuList>
          </Portal>
        </Menu>
      </Box>
    </Box>
  );
};
