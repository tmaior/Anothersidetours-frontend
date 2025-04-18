import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Checkbox,
  Stack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useToast
} from '@chakra-ui/react';
import { FiSearch, FiCheck } from 'react-icons/fi';
import axios from 'axios';

type Role = {
  id: string;
  name: string;
};

interface RoleFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (roleIds: string[]) => void;
  selectedRoles: string[];
}

const RoleFilterModal: React.FC<RoleFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  selectedRoles
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(selectedRoles || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      setSelectedRoleIds(selectedRoles);
    }
  }, [isOpen, selectedRoles]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
        withCredentials: true
      });
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRoleIds.length === roles.length) {
      setSelectedRoleIds([]);
    } else {
      setSelectedRoleIds(roles.map(role => role.id));
    }
  };

  const handleApply = () => {
    onApplyFilters(selectedRoleIds);
    onClose();
  };

  const handleCancel = () => {
    setSelectedRoleIds(selectedRoles);
    onClose();
  };

  const filteredRoles = roles.filter(role =>
    searchTerm === '' || role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = roles.length > 0 && selectedRoleIds.length === roles.length;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Filter by User Role</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <InputGroup mb={4}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Checkbox 
            mb={4} 
            isChecked={isAllSelected}
            onChange={handleSelectAll}
            colorScheme="blue"
          >
            Select All
          </Checkbox>
          
          {isLoading ? (
            <Text>Loading roles...</Text>
          ) : (
            <Stack spacing={2} maxH="300px" overflowY="auto">
              {filteredRoles.length === 0 ? (
                <Text>No roles found.</Text>
              ) : (
                filteredRoles.map(role => (
                  <Checkbox 
                    key={role.id}
                    isChecked={selectedRoleIds.includes(role.id)}
                    onChange={() => handleToggleRole(role.id)}
                    colorScheme="blue"
                  >
                    {role.name}
                  </Checkbox>
                ))
              )}
            </Stack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleApply} 
            leftIcon={<FiCheck />}
            isDisabled={isLoading}
          >
            Apply Filters
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoleFilterModal; 