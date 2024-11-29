import {
    Box,
    Flex,
    VStack,
    Text,
    useColorModeValue,
    Divider,
} from "@chakra-ui/react";
import { useState } from "react";
import CreateTour from "./dashboard/create-tours";
import Home from "./dashboard/home/home";
import ListTours from "./dashboard/list-tours";

export default function Dashboard() {
    const sidebarColor = useColorModeValue("black", "#2c2b2b");
    const bgColor = useColorModeValue("white", "gray.800");
    const [activeScreen, setActiveScreen] = useState("home");

    const renderContent = () => {
        switch (activeScreen) {
            case "createTour":
                return <CreateTour />;
            case "listTours":
                return <ListTours />;
            case "home":
            default:
                return <Home />;
        }
    };

    return (
        <Flex>
            <Box
                as="nav"
                width="250px"
                bg={sidebarColor}
                p={4}
                position="fixed"
                top="0"
                left="0"
                h="100vh"
                borderRight="1px solid #333"
                display="flex"
                flexDirection="column"
                alignItems="stretch"
            >
                <VStack spacing={4} align="stretch" mt="20">
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        onClick={() => setActiveScreen("home")}
                        _hover={{ cursor: "pointer" }}
                    >
                        Home
                    </Text>
                    <Divider borderColor="gray.600" />
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="white"
                        _hover={{ cursor: "pointer" }}
                    >
                        Tour
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => setActiveScreen("createTour")}
                        _hover={{ cursor: "pointer", color: "gray.200" }}
                    >
                        Cadastrar
                    </Text>
                    <Text
                        fontSize="md"
                        color="gray.400"
                        pl={4}
                        onClick={() => setActiveScreen("listTours")}
                        _hover={{ cursor: "pointer", color: "gray.200" }}
                    >
                        Listar
                    </Text>
                </VStack>
            </Box>

            <Box
                ml="250px"
                p={8}
                w="full"
                minH="100vh"
                bg={bgColor}
                color="white"
            >
                {renderContent()}
            </Box>
        </Flex>
    );
}
