import {Box, Flex, useColorModeValue,} from "@chakra-ui/react";
import {useState} from "react";
import CreateTour from "./dashboard/create-tours";
import Home from "./dashboard/home";
import ListTours from "./dashboard/list-tours";
import DashboardLayout from "../components/DashboardLayout";

export default function Dashboard() {
    useColorModeValue("black", "#2c2b2b");
    const bgColor = useColorModeValue("white", "gray.800");
    const [activeScreen] = useState("home");

    const renderContent = () => {
        switch (activeScreen) {
            case "createTour":
                return <CreateTour/>;
            case "listTours":
                return <ListTours/>;
            case "home":
            default:
                return <Home/>;
        }
    };

    return (
        <DashboardLayout>
            <Flex>
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
        </DashboardLayout>
    );
}
