import { Box, Text, Flex } from '@chakra-ui/react'
import React, { useEffect, useState } from "react";
import DashboardLayout from '../../../components/DashboardLayout'
import MyProfileForm from '../../../components/MyProfileForm'
import SettingsList from '../../../components/SettingsList'

enum SettingsPage {
    MyProfile = "My Profile",
}


export default function settings() {

    const [currentPage, setCurrentPage] = useState(SettingsPage.MyProfile)


    return (
        <Box
            width="100vw"
            height="100vh"
            overflowX={"hidden"}
            marginTop={0}
            padding={0}
        // overflow="hidden"
        >
            <DashboardLayout>
                <Flex 
                    direction={{ base: "column", md: "row" }}
                    alignItems={"center"}
                    sx={{ borderBottom: "1px solid #e0e3e7", width: "105%", height: "8%", margin: 0, position: "sticky", marginLeft:"-30px", paddingLeft:"30px"}}
                    marginLeft={"-30px"}
                >
                    <Text fontSize="2xl" fontWeight={"bold"} color="#8a8c91">Settings / </Text>
                    <Text fontSize="2xl" fontWeight={"bold"} ml={2}> {" " + currentPage}</Text>
                </Flex>
                <Box
                    width="100%"
                    height="100%"
                    display="flex"
                    flexDirection="row"
                    marginTop={"0"}
                    marginLeft={"-30px"}
                    padding={0}
                >
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        sx={{ borderRight: "1px solid #e0e3e7", width: "15%", margin: 0 }}
                    >
                        <SettingsList />
                    </Flex>
                    <Flex
                        direction="column"
                        justifyContent={"flex-start"}
                        alignItems={"flex-start"}
                        sx={{ width: "75%", margin: 0 }}
                    >
                        <MyProfileForm />
                    </Flex>

                </Box>
            </DashboardLayout>
        </Box>
    )
}

