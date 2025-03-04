import React from 'react'
import SettingListItem from './SettingListItem'
import { FiUser } from "react-icons/fi";
import { Flex } from '@chakra-ui/react';

export default function SettingsList({ }) {


    return (
        <Flex direction="column" justifyContent="flex-start" width="100%">
            <SettingListItem title="My Profile" description="Manage your profile Information" icon={<FiUser size={18} />} />
            <SettingListItem title="Mock 1" description="Mock description blablabla 1" icon={<FiUser size={18} />} />
            <SettingListItem title="Mock 2" description="Mock description blablabla 2" icon={<FiUser size={18} />} />
            <SettingListItem title="Mock 3" description="Mock description blablabla 3" icon={<FiUser size={18} />} />
            <SettingListItem title="Mock 4" description="Mock description blablabla 4" icon={<FiUser size={18} />} />
            <SettingListItem title="Mock 5" description="Mock description blablabla 5" icon={<FiUser size={18} />} />

        </Flex>
    )
}
