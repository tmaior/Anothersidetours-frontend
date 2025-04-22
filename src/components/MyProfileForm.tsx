import React, { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Spinner,
  useToast 
} from '@chakra-ui/react'

import {validateEmail} from '../utils/utils'

import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";

export default function MyProfileForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    mfaPhone: ''
  })

  const [errors, setErrors] = useState({
    name: { isError: false, message: '' },
    email: { isError: false, message: '' },
    phone: { isError: false, message: '' },
    currentPassword: { isError: false, message: '' },
    newPassword: { isError: false, message: '' },
    confirmNewPassword: { isError: false, message: '' },
    mfaPhone: { isError: false, message: '' }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  const [loading, setLoading] = useState({
    basicInfo: false,
    password: false,
    mfa: false
  })

  const userData = localStorage.getItem('user');
  const userDataToObject = userData ? JSON.parse(userData) : null;



  const innerFunction = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/${userDataToObject.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          name: data.name,
          email: data.email
        }));
      } else {
        console.error("Failed to fetch employee data");
      }
    } catch (error) {
      console.error("Error fetching employee data: ", error);
    }
  }, [userDataToObject?.id]);
  
 
    useEffect(() => {
        innerFunction();
    }, [innerFunction]);

  const toast = useToast()

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

   
    setErrors((prev) => ({
      ...prev,
      [field]: { isError: false, message: '' }
    }))
  }

  const handleBasicInformation = async () => {
    const newErrors = { ...errors }

    if (!formData.name) {
      newErrors.name = { isError: true, message: 'This field is required' }
    }

    const emailIsValid = validateEmail(formData.email)
    if (!formData.email) {
      newErrors.email = { isError: true, message: 'This field is required' }
    } else if (!emailIsValid) {
      newErrors.email = { isError: true, message: 'Invalid email address' }
    }

    // if (!formData.phone) {
    //   newErrors.phone = { isError: true, message: 'This field is required' }
    // }

    setErrors(newErrors)

    let responseSuccess = false

    if (Object.values(newErrors).some((error) => error.isError)) {
      return
    }else{
        try {
            setLoading({ ...loading, basicInfo: true })

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee`, {
                method: 'PATCH',
              credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  id: userDataToObject?.id,
                  name: formData.name,
                  email: formData.email
                })
              });

            if (response.ok) {
              responseSuccess = true

            } else {
                console.error("Failed to update employee");
                responseSuccess = false
            }
        } catch (error) {
            console.error("Error updating employee: ", error);
            responseSuccess = false
        }
        setLoading({ ...loading, basicInfo: false })
        toast({
            title: `Basic information saved successfully`,
            status: responseSuccess ? 'success' : 'error',
            isClosable: true,
            duration: 1000
          })
    }
  }

  const handlePasswordChange = async () => {
    const newErrors = { ...errors }

    newErrors.newPassword = { isError: false, message: '' }
    newErrors.confirmNewPassword = { isError: false, message: '' }

    if (!formData.newPassword) {
      newErrors.newPassword = {
        isError: true,
        message: 'This field is required'
      }
    }
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = {
        isError: true,
        message: 'This field is required'
      }
    }

    if (
      formData.newPassword &&
      formData.confirmNewPassword &&
      formData.newPassword !== formData.confirmNewPassword
    ) {
      newErrors.confirmNewPassword = {
        isError: true,
        message: 'Passwords do not match'
      }
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      newErrors.newPassword = {
        isError: true,
        message: 'Password must be at least 8 characters'
      }
    }
    
    setErrors(newErrors)

    if (!Object.values(newErrors).some((error) => error.isError)) {
      setLoading({ ...loading, password: true });
      let responseSuccess = false;
      let responseMessage = '';
    
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/employee/update-password`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: userDataToObject?.id,
              currentPassword: formData.currentPassword,
              password: formData.newPassword
            })
          }
        );
    
        if (response.ok) {
          responseSuccess = true;
          responseMessage = 'Password changed successfully';
        } else {
          const errorData = await response.json();
          responseSuccess = false;
          responseMessage = errorData?.message || 'Failed to update employee';
          console.error("Failed to update employee", errorData);
        }
      } catch (error) {
        console.error("Error updating employee: ", error);
        responseSuccess = false;
        responseMessage = error?.message || 'An unexpected error occurred';
      } finally {
        setLoading({ ...loading, password: false });
        toast({
          title: responseMessage,
          status: responseSuccess ? 'success' : 'error',
          isClosable: true,
          duration: 2000
        });
      }
    }
  }

  const handleMFA = () => {
    console.log('MFA')
    const newErrors = { ...errors }
    if (!formData.mfaPhone) {
      newErrors.mfaPhone = {
        isError: true,
        message: 'This field is required'
      }
    }
    setErrors(newErrors)
  }

  const handleCancelClick = () => {
    console.log('clicked')
  }

  return (
    <Box
      display={'flex'}
      flexDirection="column"
      gap={10}
      justifyContent={'flex-start'}
      alignItems={'flex-start'}
      padding={4}
      width={'100%'}
    >
      <Heading fontSize="2xl">My Profile</Heading>
      <Flex
        gap={25}
        width={'100%'}
        justifyItems={'flex-start'}
        alignItems={'flex-start'}
      >
        <Flex direction="column" gap={1} width={'35%'}>
          <Text fontSize="xl" fontWeight="bold">
            Basic Information
          </Text>
          <Text align="left">
            Update your basic information for your profile
          </Text>
        </Flex>

        <Flex direction="column" gap={4} width={'100%'}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Another Side Of San Diego Tours"
            />
            {errors.name.isError && (
              <Text color="red.500">{errors.name.message}</Text>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="Another Side Of San Diego Tours"
            />
            {errors.email.isError && (
              <Text color="red.500">{errors.email.message}</Text>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              value={formData.phone}
              type='tel'
              onChange={(e) => handleFormChange('phone', e.target.value)}
              placeholder=""
            />
            {errors.phone.isError && (
              <Text color="red.500">{errors.phone.message}</Text>
            )}
          </FormControl>

          <Flex gap={4} mt={2} >
            <Button colorScheme="blue" width={"120px"} onClick={() => {
                handleBasicInformation()
            }}>
              {loading.basicInfo ? <>
                                      <Spinner
                                                thickness='4px'
                                                speed='0.65s'
                                                emptyColor='gray.200'
                                                color='blue.500'
                                                size='xl'
                                                />
                                                <Text ml={2}>Loading...</Text>
                                    </> : 'Save'}

            </Button>
            <Button variant="outline" onClick={handleCancelClick} width={"120px"}>Cancel</Button>
          </Flex>
        </Flex>
      </Flex>


      <Flex
        gap={25}
        width={'100%'}
        justifyItems={'flex-start'}
        alignItems={'flex-start'}
      >
        <Flex direction="column" gap={1} width={'35%'}>
          <Text fontSize="xl" fontWeight="bold">
            Passwords
          </Text>
          <Text align="left">Update your password</Text>
        </Flex>

        <Flex direction="column" gap={4} width={'100%'}>
        <FormControl isRequired>
            <FormLabel>Current Password</FormLabel>
            <InputGroup size='md'>
                <Input
                value={formData.currentPassword}
                type={showCurrentPassword ? 'text' : 'password'}
                onChange={(e) => handleFormChange('currentPassword', e.target.value)}
                placeholder=""
                />
                <InputRightElement width='4.5rem' sx={{cursor: 'pointer'}} onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <><FaRegEyeSlash size={20}/></>: <><FaRegEye size={20}/></>}
                </InputRightElement>
            </InputGroup>
            {errors.currentPassword.isError && (
              <Text color="red.500">{errors.currentPassword.message}</Text>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <InputGroup size='md'>
                <Input
                value={formData.newPassword}
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => handleFormChange('newPassword', e.target.value)}
                placeholder=""
                />
                <InputRightElement width='4.5rem' sx={{cursor: 'pointer'}} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <><FaRegEyeSlash size={20}/></>: <><FaRegEye size={20}/></>}
                </InputRightElement>
            </InputGroup>
            {errors.newPassword.isError && (
              <Text color="red.500">{errors.newPassword.message}</Text>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm New Password</FormLabel>
            <InputGroup size='md'>
                <Input
                type={showPasswordConfirm ? 'text' : 'password'}
                value={formData.confirmNewPassword}
                onChange={(e) =>
                    handleFormChange('confirmNewPassword', e.target.value)
                }
                placeholder=""
                />
                <InputRightElement width='4.5rem' sx={{cursor: 'pointer'}} onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                    {showPasswordConfirm ? <><FaRegEyeSlash size={20}/></>: <><FaRegEye size={20}/></>}
                </InputRightElement>
            </InputGroup>
            {errors.confirmNewPassword.isError && (
              <Text color="red.500">{errors.confirmNewPassword.message}</Text>
            )}
          </FormControl>

          <Flex gap={4}>
            <Button variant="outline" onClick={() => handlePasswordChange()}  width={"120px"} >Change</Button>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        gap={25}
        width={'100%'}
        justifyItems={'flex-start'}
        alignItems={'flex-start'}
      >
        <Flex direction="column" gap={1} width={'35%'}>
          <Text fontSize="xl" fontWeight="bold">
            Multi Factor Authentication
          </Text>
          <Text align="left">
            MFA makes your account more secure by adding an additional
            verification to sensitive changes to your account
          </Text>
        </Flex>

        <Flex direction="column" gap={4} width={'100%'}>
          <Text fontSize="large" fontWeight="bold">
            Multi Factor Authentication
          </Text>

          <FormControl>
            <FormLabel>Mobile phone</FormLabel>
            <Input
              value={formData.mfaPhone}
              onChange={(e) => handleFormChange('mfaPhone', e.target.value)}
              placeholder=""
            />
            {errors.mfaPhone.isError && (
              <Text color="red.500">{errors.mfaPhone.message}</Text>
            )}
          </FormControl>

          <Flex gap={4}>
            <Button colorScheme="blue" onClick={handleMFA}  width={"120px"} >
              Save
            </Button>
            <Button variant="outline" onClick={handleCancelClick}  width={"120px"} >Cancel</Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
