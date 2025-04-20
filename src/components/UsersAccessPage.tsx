import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Tag,
    Text,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import {FiChevronDown, FiEdit, FiFilter, FiSearch, FiUserPlus} from 'react-icons/fi';
import axios from 'axios';
import AddUserModal from './AddUserModal';
import RoleFilterModal from './RoleFilterModal';
import {MdPhone} from "react-icons/md";
import {CiAt} from "react-icons/ci";
import ResetPasswordModal from './ResetPasswordModal';

type UserRole = {
    id: string;
    name: string;
};

class roles {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    role: {
        id: string;
        name: string;
        description?: string;
        created_at: string;
        updated_at: string;
    };
}

type User = {
    employeeRoles: roles[];
    id: string;
    name: string;
    email: string;
    phone?: string;
    lastLogin?: string;
    roles: UserRole[];
    isActive: boolean;
    refreshExpiresAt?: string;
};

const UsersAccessPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab,] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [availableRoles, setAvailableRoles] = useState<{ id: string, name: string }[]>([]);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
    const toast = useToast();

    const {isOpen: isAddUserOpen, onOpen: onAddUserOpen, onClose: onAddUserClose} = useDisclosure();
    const {isOpen: isRoleFilterOpen, onOpen: onRoleFilterOpen, onClose: onRoleFilterClose} = useDisclosure();
    const {isOpen: isResetPasswordOpen, onOpen: onResetPasswordOpen, onClose: onResetPasswordClose} = useDisclosure();
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employee`, {
                withCredentials: true
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "Failed to load user data",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
                withCredentials: true
            });
            setAvailableRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchCurrentUserProfile = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                withCredentials: true
            });
            
            const userData = response.data;
            const isAdmin = userData.roles.some(role => role.name === 'ADMIN');
            setIsCurrentUserAdmin(isAdmin);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchCurrentUserProfile();
    }, [toast]);

    const handleRevokeAccess = async (userId: string) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/employees/${userId}/deactivate`, {}, {
                withCredentials: true
            });

            setUsers(users.map(user =>
                user.id === userId ? {...user, isActive: false} : user
            ));

            toast({
                title: "Access Revoked",
                description: "User access has been revoked successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error revoking access:', error);
            toast({
                title: "Error",
                description: "Failed to revoke user access",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleApplyRoleFilters = (roleIds: string[]) => {
        setSelectedRoleIds(roleIds);
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        onAddUserOpen();
    };

    const handleCloseUserModal = () => {
        setUserToEdit(null);
        onAddUserClose();
    };

    const handleResetPassword = (user: User) => {
        setUserToResetPassword(user);
        onResetPasswordOpen();
    };

    const filteredUsers = users.filter(user => {
        if (activeTab === 'pending' && user.isActive) return false;
        if (activeTab === 'active' && !user.isActive) return false;
        if (selectedRoleIds.length > 0) {
            const userRoleIds = user.employeeRoles.map(role => role.id);
            if (!selectedRoleIds.some(id => userRoleIds.includes(id))) {
                return false;
            }
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                (user.phone && user.phone.includes(term))
            );
        }

        return true;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        return date.toLocaleDateString('en-US', options);
    };

    return (
        <Box p={5} width="100%">
            <Flex justifyContent="flex-end" alignItems="flex-end" mb={6}>
                <Button leftIcon={<FiUserPlus/>} colorScheme="blue" onClick={onAddUserOpen}>
                    Add User
                </Button>
            </Flex>

            <Flex mb={4}>
                <Box mr={4}>
                    <Button
                        variant="outline"
                        onClick={onRoleFilterOpen}
                        leftIcon={<FiFilter/>}
                        rightIcon={<FiChevronDown/>}
                        fontSize="sm"
                    >
                        {selectedRoleIds.length > 0 ? `Filtered (${selectedRoleIds.length})` : 'All User Roles'}
                    </Button>
                </Box>

                {/*<Box borderWidth={1} borderRadius="md" ml={2}>*/}
                {/*  <Tabs variant="unstyled" onChange={(index) => setActiveTab(['all', 'pending', 'active'][index])}>*/}
                {/*    <TabList>*/}
                {/*      <Tab */}
                {/*        _selected={{ color: 'white', bg: 'blue.500' }}*/}
                {/*        borderRadius="md"*/}
                {/*        px={4}*/}
                {/*        py={2}*/}
                {/*      >*/}
                {/*        All*/}
                {/*      </Tab>*/}
                {/*      <Tab */}
                {/*        _selected={{ color: 'white', bg: 'blue.500' }}*/}
                {/*        borderRadius="md"*/}
                {/*        px={4}*/}
                {/*        py={2}*/}
                {/*      >*/}
                {/*        Pending*/}
                {/*      </Tab>*/}
                {/*      <Tab */}
                {/*        _selected={{ color: 'white', bg: 'blue.500' }}*/}
                {/*        borderRadius="md"*/}
                {/*        px={4}*/}
                {/*        py={2}*/}
                {/*      >*/}
                {/*        Active*/}
                {/*      </Tab>*/}
                {/*    </TabList>*/}
                {/*  </Tabs>*/}
                {/*</Box>*/}

                <InputGroup maxW="300px" ml="auto">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.300"/>
                    </InputLeftElement>
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </Flex>

            {selectedRoleIds.length > 0 && (
                <Flex mb={4} align="center">
                    <Text fontSize="sm" color="gray.600" mr={2}>Filtered by roles:</Text>
                    {availableRoles
                        .filter(role => selectedRoleIds.includes(role.id))
                        .map(role => (
                            <Tag
                                key={role.id}
                                size="sm"
                                colorScheme="blue"
                                mr={2}
                            >
                                {role.name}
                            </Tag>
                        ))
                    }
                    <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => setSelectedRoleIds([])}
                    >
                        Clear
                    </Button>
                </Flex>
            )}

            <Divider mb={4}/>

            <Box>
                {isLoading ? (
                    <Text>Loading users...</Text>
                ) : filteredUsers.length === 0 ? (
                    <Text>No users found.</Text>
                ) : (
                    filteredUsers.map(user => (
                        <Box
                            key={user.id}
                            borderBottomWidth={1}
                            py={4}
                        >
                            <Flex justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Text fontWeight="bold" fontSize="lg">{user.name}</Text>

                                    <HStack>
                                        <CiAt />
                                        <Text color="blue.500" fontSize="sm" mb={1}>
                                            {user.email}
                                        </Text>
                                    </HStack>

                                    {(user.phone || '(000)-123-4567') && (
                                        <HStack>
                                            <MdPhone/>
                                            <Text color="gray.600" fontSize="sm">
                                                {user.phone || '(000)-123-4567'}
                                            </Text>
                                        </HStack>

                                    )}
                                    <Flex mt={2}>
                                        {user.employeeRoles.map(er => (
                                            <Tag
                                                key={er.id}
                                                mr={2}
                                                size="sm"
                                                colorScheme={er.role.name === 'ADMIN' ? 'red' : 'blue'}
                                            >
                                                {er.role.name}
                                            </Tag>
                                        ))}
                                        {user.employeeRoles.length === 0 && (
                                            <Tag size="sm" colorScheme="gray">No Role</Tag>
                                        )}
                                    </Flex>
                                </Box>

                                <Flex alignItems="center">
                                    <Box mr={4} textAlign="right">
                                        <Text fontSize="sm" color="gray.500">
                                            Last Login:
                                        </Text>
                                        <Text fontSize="sm">
                                            {formatDate(user.refreshExpiresAt)}
                                        </Text>
                                    </Box>

                                    <Flex>
                                        <IconButton
                                            aria-label="Edit user"
                                            icon={<FiEdit/>}
                                            variant="ghost"
                                            mr={2}
                                            onClick={() => handleEditUser(user)}
                                        />
                                        {isCurrentUserAdmin && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                colorScheme="orange"
                                                mr={2}
                                                onClick={() => handleResetPassword(user)}
                                            >
                                                Reset Password
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            colorScheme="red"
                                            onClick={() => handleRevokeAccess(user.id)}
                                        >
                                            Revoke Access
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Box>
                    ))
                )}
            </Box>

            <AddUserModal
                isOpen={isAddUserOpen}
                onClose={handleCloseUserModal}
                onUserAdded={fetchUsers}
                userToEdit={userToEdit}
            />

            <RoleFilterModal
                isOpen={isRoleFilterOpen}
                onClose={onRoleFilterClose}
                onApplyFilters={handleApplyRoleFilters}
                selectedRoles={selectedRoleIds}
            />

            <ResetPasswordModal
                isOpen={isResetPasswordOpen}
                onClose={onResetPasswordClose}
                user={userToResetPassword}
            />
        </Box>
    );
};

export default UsersAccessPage; 