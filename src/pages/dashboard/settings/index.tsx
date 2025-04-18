import { Box, Text, Flex } from '@chakra-ui/react'
import React, { useState } from "react";
import DashboardLayout from '../../../components/DashboardLayout'
import MyProfileForm from '../../../components/MyProfileForm'
import SettingsList, { SettingsPage } from '../../../components/SettingsList'
import UnderConstruction from '../../../components/UnderConstruction';
import CompanyProfileForm from '../../../components/CompanyProfileForm';
import ButtonCodeSettings from '../../../components/ButtonCodeSettings';
import UsersAccessPage from '../../../components/UsersAccessPage';
import withPermission from '../../../utils/withPermission';

function Settings() {
    const [currentPage, setCurrentPage] = useState<SettingsPage>(SettingsPage.MyProfile);

    const handlePageChange = (page: SettingsPage) => {
        setCurrentPage(page);
    };

    const renderContent = () => {
        switch (currentPage) {
            case SettingsPage.MyProfile:
                return <MyProfileForm />;
            case SettingsPage.CompanyProfile:
                return <CompanyProfileForm />;
            case SettingsPage.ButtonCode:
                return <ButtonCodeSettings />;
            case SettingsPage.UsersAccess:
                return <UsersAccessPage />;
            default:
                return <UnderConstruction pageName={currentPage} />;
        }
    };

    return (
        <Box
            width="100vw"
            height="100vh"
            overflowX={"hidden"}
            marginTop={0}
            padding={0}
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
                        <SettingsList activePage={currentPage} onPageChange={handlePageChange} />
                    </Flex>
                    <Flex
                        direction="column"
                        justifyContent={"flex-start"}
                        alignItems={"flex-start"}
                        sx={{ width: "75%", margin: 0 }}
                    >
                        {renderContent()}
                    </Flex>
                </Box>
            </DashboardLayout>
        </Box>
    )
}

export default withPermission(Settings, 'ROLE_READ');
