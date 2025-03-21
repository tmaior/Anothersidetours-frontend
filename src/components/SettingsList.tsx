import React from 'react'
import SettingListItem from './SettingListItem'
import { FiUser, FiBriefcase, FiUsers, FiBell, FiCode, FiSettings, FiDollarSign, FiGrid, FiPercent, FiCreditCard } from "react-icons/fi";
import { Flex } from '@chakra-ui/react';

export enum SettingsPage {
    CompanyProfile = "Company Profile",
    MyProfile = "My Profile",
    UsersAccess = "Users & Access",
    Notifications = "Notifications",
    ButtonCode = "Button Code",
    Preferences = "Preferences",
    Gratuity = "Gratuity",
    Apps = "Apps",
    TaxesFees = "Taxes and Fees",
    Payments = "Payments"
}

interface SettingsListProps {
    activePage: SettingsPage;
    onPageChange: (page: SettingsPage) => void;
}

export default function SettingsList({ activePage, onPageChange }: SettingsListProps) {
    return (
        <Flex direction="column" justifyContent="flex-start" width="100%">
            <SettingListItem 
                title={SettingsPage.CompanyProfile} 
                description="Basic information about your company" 
                icon={<FiBriefcase size={18} />} 
                isActive={activePage === SettingsPage.CompanyProfile}
                onClick={() => onPageChange(SettingsPage.CompanyProfile)}
            />
            <SettingListItem 
                title={SettingsPage.MyProfile} 
                description="Manage your profile Information" 
                icon={<FiUser size={18} />} 
                isActive={activePage === SettingsPage.MyProfile}
                onClick={() => onPageChange(SettingsPage.MyProfile)}
            />
            <SettingListItem 
                title={SettingsPage.UsersAccess} 
                description="Manage users and access levels" 
                icon={<FiUsers size={18} />} 
                isActive={activePage === SettingsPage.UsersAccess}
                onClick={() => onPageChange(SettingsPage.UsersAccess)}
            />
            <SettingListItem 
                title={SettingsPage.Notifications} 
                description="Manage email and SMS notifications to your customers and guide" 
                icon={<FiBell size={18} />} 
                isActive={activePage === SettingsPage.Notifications}
                onClick={() => onPageChange(SettingsPage.Notifications)}
            />
            <SettingListItem 
                title={SettingsPage.ButtonCode} 
                description="Create and manage book now buttons for your website" 
                icon={<FiCode size={18} />} 
                isActive={activePage === SettingsPage.ButtonCode}
                onClick={() => onPageChange(SettingsPage.ButtonCode)}
            />
            <SettingListItem 
                title={SettingsPage.Preferences} 
                description="Manage booking and gift settings" 
                icon={<FiSettings size={18} />} 
                isActive={activePage === SettingsPage.Preferences}
                onClick={() => onPageChange(SettingsPage.Preferences)}
            />
            <SettingListItem 
                title={SettingsPage.Gratuity} 
                description="Manage your preferences for the Gratuity feature" 
                icon={<FiDollarSign size={18} />} 
                isActive={activePage === SettingsPage.Gratuity}
                onClick={() => onPageChange(SettingsPage.Gratuity)}
            />
            <SettingListItem 
                title={SettingsPage.Apps} 
                description="Configure and manage your installed apps from the Xola App Store" 
                icon={<FiGrid size={18} />} 
                isActive={activePage === SettingsPage.Apps}
                onClick={() => onPageChange(SettingsPage.Apps)}
            />
            <SettingListItem 
                title={SettingsPage.TaxesFees} 
                description="Configure and manage your business' taxes and fees" 
                icon={<FiPercent size={18} />} 
                isActive={activePage === SettingsPage.TaxesFees}
                onClick={() => onPageChange(SettingsPage.TaxesFees)}
            />
            <SettingListItem 
                title={SettingsPage.Payments} 
                description="Configure and manage payout details for payment processors" 
                icon={<FiCreditCard size={18} />} 
                isActive={activePage === SettingsPage.Payments}
                onClick={() => onPageChange(SettingsPage.Payments)}
            />
        </Flex>
    )
}
