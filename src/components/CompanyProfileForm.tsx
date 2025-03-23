import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  Input,
  Button,
  FormControl,
  FormLabel,
  Image,
  Select,
  useToast,
  Tooltip,
  Icon
} from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { useGuest } from '../contexts/GuestContext';

interface CompanyProfile {
  id?: string;
  companyName: string;
  phone: string;
  website: string;
  streetAddress: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
  logoUrl?: string;
}

export default function CompanyProfileForm() {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    companyName: '',
    phone: '',
    website: '',
    streetAddress: '',
    zipCode: '',
    city: '',
    state: '',
    country: 'United States'
  });
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const toast = useToast();
  const { tenantId } = useGuest();

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      if (tenantId) {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/company-profile/tenant/${tenantId}`);
        if (response.data) {
          setCompanyProfile(response.data);
          if (response.data.logoUrl) {
            setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}/${response.data.logoUrl}`);
          }
          return;
        }
      }
      const fallbackResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/company-profile`);
      if (fallbackResponse.data && fallbackResponse.data.length > 0) {
        setCompanyProfile(fallbackResponse.data[0]);
        if (fallbackResponse.data[0].logoUrl) {
          setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}/${fallbackResponse.data[0].logoUrl}`);
        }
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (!file.type.includes('image/png') && !file.type.includes('image/jpeg')) {
        toast({
          title: 'Invalid file type',
          description: 'Only PNG and JPG formats are allowed',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      if (!companyProfile.id && tenantId) {
        formData.append('tenantId', tenantId);
      } else if (!companyProfile.id) {
        toast({
          title: 'Error',
          description: 'No tenant ID available. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }
      Object.entries(companyProfile).forEach(([key, value]) => {
        if (key !== 'logoUrl' && key !== 'id' && value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      if (selectedImage) {
        formData.append('logo', selectedImage);
      }

      let response;
      if (companyProfile.id) {
        response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/company-profile/${companyProfile.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/company-profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast({
        title: 'Success',
        description: 'Company profile saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setCompanyProfile(response.data);
      fetchCompanyProfile();
    } catch (error) {
      console.error('Error saving company profile:', error);
      let errorMessage = 'Failed to save company profile';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `Error: ${error.response.status} - ${error.response.data?.message || errorMessage}`;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box width="100%" p={6}>
      <Box mb={8}>
        <Text fontSize="xl" fontWeight="bold">Basic Information</Text>
        <Text color="gray.600" fontSize="sm">
          General information about your company. This information is
          displayed in email communications with your customers for reference
        </Text>
      </Box>

      <form onSubmit={handleSubmit}>
        <Flex direction={{ base: "column", md: "row" }} mb={8}>
          <Box width={{ base: "100%", md: "30%" }} pr={{ md: 8 }} mb={{ base: 6, md: 0 }}>
            <Text fontSize="lg" fontWeight="bold">Basic Information</Text>
          </Box>
          
          <Box width={{ base: "100%", md: "70%" }}>
            <Flex direction={{ base: "column", md: "row" }} mb={6}>
              <Box flex="1" mr={{ md: 4 }}>
                <FormControl mb={4}>
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={4}
                    textAlign="center"
                    mb={2}
                    width="230px"
                    height="100px"
                  >
                    {previewUrl ? (
                      <Image 
                        src={previewUrl} 
                        alt="Company logo" 
                        maxHeight="90px" 
                        maxWidth="220px" 
                        objectFit="contain" 
                      />
                    ) : (
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center" 
                        height="100%" 
                        color="gray.500"
                      >
                        No logo uploaded
                      </Box>
                    )}
                  </Box>
                  <Button 
                    as="label" 
                    htmlFor="logo-upload" 
                    colorScheme="blue" 
                    size="md" 
                    cursor="pointer"
                    width="230px"
                  >
                    Replace Photo
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </Button>
                  <Text fontSize="xs" mt={1} color="gray.500">
                    Check that the image is in PNG or JPG format and does not exceed 5MB
                  </Text>
                </FormControl>
              </Box>
            </Flex>
            
            <FormControl mb={4}>
              <FormLabel>Company Name</FormLabel>
              <Input
                name="companyName"
                value={companyProfile.companyName}
                onChange={handleChange}
                placeholder="Company Name"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Phone</FormLabel>
              <Input
                name="phone"
                value={companyProfile.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Website</FormLabel>
              <Input
                name="website"
                value={companyProfile.website}
                onChange={handleChange}
                placeholder="Website URL"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>
                Street Address
                <Tooltip label="Your company's street address" placement="top">
                  <span>
                    <Icon as={FiInfo} ml={1} boxSize={4} color="gray.400" />
                  </span>
                </Tooltip>
              </FormLabel>
              <Input
                name="streetAddress"
                value={companyProfile.streetAddress}
                onChange={handleChange}
                placeholder="Street Address"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Zip Code</FormLabel>
              <Input
                name="zipCode"
                value={companyProfile.zipCode}
                onChange={handleChange}
                placeholder="Zip Code"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>City</FormLabel>
              <Select 
                name="city"
                value={companyProfile.city} 
                onChange={handleChange}
                placeholder="Select..."
              >
                <option value="San Diego">San Diego</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="San Francisco">San Francisco</option>
                <option value="New York">New York</option>
              </Select>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>State</FormLabel>
              <Input
                name="state"
                value={companyProfile.state}
                onChange={handleChange}
                placeholder="State"
                bg="gray.100"
                readOnly
              />
            </FormControl>
            
            <FormControl mb={6}>
              <FormLabel>Country</FormLabel>
              <Input
                name="country"
                value={companyProfile.country}
                onChange={handleChange}
                placeholder="Country"
                bg="gray.100"
                readOnly
              />
            </FormControl>
          </Box>
        </Flex>
        
        <Flex justify="flex-start" mt={8}>
          <Button 
            type="submit" 
            colorScheme="blue" 
            mr={4}
            isLoading={loading}
          >
            Save
          </Button>
          <Button variant="outline">
            Cancel
          </Button>
        </Flex>
      </form>
    </Box>
  );
} 