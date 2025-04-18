import {useRouter} from 'next/router';
import {useEffect, useRef, useState} from 'react';
import {useToast} from '@chakra-ui/react';
import axios from 'axios';

const withPermission = (WrappedComponent, requiredPermission) => {
  const WithPermissionComponent = (props) => {
    const router = useRouter();
    const toast = useToast();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const currentToastIdRef = useRef(null);

    useEffect(() => {
      const checkPermission = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            withCredentials: true,
          });

          const userPermissions = response.data.permissions || [];
          const hasPermission = userPermissions.includes(requiredPermission) ||
                               response.data.roles.some(role => role.name === 'ADMIN');

          setIsAuthorized(hasPermission);

          if (!hasPermission) {
            if (currentToastIdRef.current) {
              toast.close(currentToastIdRef.current);
            }

            currentToastIdRef.current = toast({
              title: "Access Denied",
              description: "You don't have permission to access this page. Please contact your administrator.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });

            router.push('/dashboard/reservation');
          }
        } catch (error) {
          console.error('Error checking permissions:', error);
          if (currentToastIdRef.current) {
            toast.close(currentToastIdRef.current);
          }
          currentToastIdRef.current = toast({
            title: "Authentication Error",
            description: "Failed to verify your permissions. Please log in again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });

          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      };

      checkPermission();
    }, [router, toast]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthorized) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
  return WithPermissionComponent;
};
export default withPermission; 