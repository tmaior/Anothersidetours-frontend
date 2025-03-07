import React from 'react'
import SettingListItem from './SettingListItem'
import { FiUser } from "react-icons/fi";
import { Flex } from '@chakra-ui/react';

export default function SettingsList({ }) {


    return (
        <Flex direction="column" justifyContent="flex-start" width="100%">
            <SettingListItem title="Company Profile" description="Basic information about your company" icon={<FiUser size={18} />} />
            <SettingListItem title="My Profile" description="Manage your profile Information" icon={<FiUser size={18} />} />
            <SettingListItem title="Users & Access" description="Manage users and access levels" icon={<FiUser size={18} />} />
            <SettingListItem title="Notifications" description="Manage email and SMS notifications to your customers and guide" icon={<FiUser size={18} />} />
            <SettingListItem title="Button Code" description="Create and manage book now buttons for your website" icon={<FiUser size={18} />} />
            <SettingListItem title="Preferences" description="Manage booking and gift settings" icon={<FiUser size={18} />} />
            <SettingListItem title="Gratuity" description="Manage your preferences for the Gratuity feature" icon={<FiUser size={18} />} />
            <SettingListItem title="Apps" description="Configure and manage your installed apps from the Xola App Store" icon={<FiUser size={18} />} />
            <SettingListItem title="Taxes and Fees" description="Configure and manage your business' taxes and fees" icon={<FiUser size={18} />} />
            <SettingListItem title="Payments" description="Configure and manage payout details for payment processors" icon={<FiUser size={18} />} />

        </Flex>
    )
}
