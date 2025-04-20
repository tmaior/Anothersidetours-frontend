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
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  FormErrorMessage,
  CheckboxGroup,
  Checkbox,
  Stack
} from '@chakra-ui/react';
import axios from 'axios';

type Role = {
  id: string;
  name: string;
  description: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  employeeRoles: { id: string; role: { id: string; name: string } }[];
  isActive: boolean;
};

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  userToEdit?: User | null;
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded, userToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const isEditing = !!userToEdit;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
          withCredentials: true
        });
        setAvailableRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available roles',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setName(userToEdit.name);
        setEmail(userToEdit.email);
        setPhone(userToEdit.phone || '');
        const userRoleIds = userToEdit.employeeRoles.map(er => er.role.id);
        setRoles(userRoleIds);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setRoles([]);
      }
      setErrors({});
    }
  }, [isOpen, userToEdit]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isEditing && userToEdit) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/employees/${userToEdit.id}`,
          {
            name,
            email,
            phone: phone || undefined,
            roleIds: roles,
            isActive: userToEdit.isActive
          },
          {
            withCredentials: true
          }
        );

        toast({
          title: 'Success',
          description: 'User has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/employees`,
          {
            name,
            email,
            phone: phone || undefined,
            roleIds: roles,
            isActive: true
          },
          {
            withCredentials: true
          }
        );

        toast({
          title: 'Success',
          description: 'User has been added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      setName('');
      setEmail('');
      setPhone('');
      setRoles([]);
      onUserAdded();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} user`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (selectedRoles: string[]) => {
    setRoles(selectedRoles);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditing ? 'Edit User' : 'Add New User'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Roles</FormLabel>
              <CheckboxGroup colorScheme="blue" value={roles} onChange={handleRoleChange}>
                <Stack spacing={2}>
                  {availableRoles.map((role) => (
                    <Checkbox key={role.id} value={role.id}>
                      {role.name}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Add User'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddUserModal; 