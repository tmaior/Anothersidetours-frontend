import {Box, Button, Divider, Flex, FormControl, FormLabel, Heading, HStack, Input, Textarea,} from "@chakra-ui/react";
import PhotoUpload from "../../../components/PhotoUpload";
import DashboardLayout from "../../../components/DashboardLayout";
import {useEffect, useState} from "react";

export default function GuideForm() {

    const [sidebarWidth, setSidebarWidth] = useState(250);

    useEffect(() => {
        const handleResize = () => {
            const sidebar = document.getElementById("dashboard-sidebar");
            if (sidebar) {
                setSidebarWidth(sidebar.offsetWidth);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    return (
        <DashboardLayout>
            <Box p={8} maxW="800px" mx="auto">
                <Heading size="lg" mb={6}>
                    <Box as="span" fontWeight="medium" color="gray.500">
                        Guide Management
                    </Box>
                </Heading>

                <Divider mb={8}/>

                <Box>
                    <Heading size="md" mb={6}>
                        Details
                    </Heading>

                    <FormControl isRequired mb={4}>
                        <FormLabel>Name</FormLabel>
                        <Input placeholder="Guide name"/>
                    </FormControl>

                    <FormControl isRequired mb={4}>
                        <FormLabel>Email</FormLabel>
                        <Input type="email" placeholder="Guide email"/>
                    </FormControl>

                    <FormControl mb={4}>
                        <FormLabel>Phone</FormLabel>
                        <Input placeholder="Guide phone"/>
                    </FormControl>

                    <FormControl mb={6}>
                        <FormLabel>Bio</FormLabel>
                        <Textarea placeholder="Short bio of the guide" rows={4}/>
                    </FormControl>
                </Box>
                <Box mb={8}>
                    <PhotoUpload/>
                </Box>
                <Divider marginBottom={"10px"}/>
                <Flex
                    as="footer"
                    position="fixed"
                    bottom="0"
                    bg="white"
                    py={4}
                    px={8}
                    boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
                    justifyContent="center"
                    borderTop="1px solid #E2E8F0"
                    left={`${sidebarWidth}px`}
                    width={`calc(100% - ${sidebarWidth}px)`}
                >
                    <HStack spacing={4}>
                        <Button colorScheme="blue">Save</Button>
                        <Button variant="outline">Cancel</Button>
                    </HStack>
                </Flex>
            </Box>
        </DashboardLayout>
    );
}