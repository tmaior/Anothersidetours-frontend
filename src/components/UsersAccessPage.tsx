import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Tag, 
  Text, 
  Input, 
  InputGroup, 
  InputLeftElement,
  IconButton,
  useToast,
  useDisclosure,
  Divider
} from '@chakra-ui/react';
import { FiEdit, FiSearch, FiUserPlus, FiFilter, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import AddUserModal from './AddUserModal';
import RoleFilterModal from './RoleFilterModal';

type UserRole = {
  id: string;
  name: string;
};

type User = {
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
  const [availableRoles, setAvailableRoles] = useState<{id: string, name: string}[]>([]);
  const toast = useToast();

  const { isOpen: isAddUserOpen, onOpen: onAddUserOpen, onClose: onAddUserClose } = useDisclosure();
  const { isOpen: isRoleFilterOpen, onOpen: onRoleFilterOpen, onClose: onRoleFilterClose } = useDisclosure();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
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

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [toast]);

  const handleRevokeAccess = async (userId: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/employees/${userId}/deactivate`, {}, {
        withCredentials: true
      });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: false } : user
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

  const filteredUsers = users.filter(user => {
    if (activeTab === 'pending' && user.isActive) return false;
    if (activeTab === 'active' && !user.isActive) return false;
    if (selectedRoleIds.length > 0) {
      const userRoleIds = user.roles.map(role => role.id);
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
        <Button leftIcon={<FiUserPlus />} colorScheme="blue" onClick={onAddUserOpen}>
          Add User
        </Button>
      </Flex>
      
      <Flex mb={4}>
        <Box mr={4}>
          <Button 
            variant="outline" 
            onClick={onRoleFilterOpen}
            leftIcon={<FiFilter />}
            rightIcon={<FiChevronDown />}
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
            <FiSearch color="gray.300" />
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
      
      <Divider mb={4} />
      
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
                  <Text color="blue.500" fontSize="sm" mb={1}>
                    @ {user.email}
                  </Text>
                  {user.phone && (
                    <Text color="gray.600" fontSize="sm">
                      {user.phone}
                    </Text>
                  )}
                  <Flex mt={2}>
                    {user.roles.map(role => (
                      <Tag 
                        key={role.id}
                        mr={2}
                        size="sm"
                        colorScheme={role.name === 'ADMIN' ? 'red' : 'blue'}
                      >
                        {role.name}
                      </Tag>
                    ))}
                    {user.roles.length === 0 && (
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
                      icon={<FiEdit />}
                      variant="ghost"
                      mr={2}
                      onClick={() => {}}
                    />
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
        onClose={onAddUserClose}
        onUserAdded={fetchUsers}
      />

      <RoleFilterModal
        isOpen={isRoleFilterOpen}
        onClose={onRoleFilterClose}
        onApplyFilters={handleApplyRoleFilters}
        selectedRoles={selectedRoleIds}
      />
    </Box>
  );
};

export default UsersAccessPage; 