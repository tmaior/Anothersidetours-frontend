import {useRouter} from 'next/router';
import {useEffect, useRef, useState} from 'react';
import {useToast} from '@chakra-ui/react';
import axios from 'axios';

const withAuth = (WrappedComponent) => {
  const WithAuthComponent = (props) => {
    const router = useRouter();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const currentToastIdRef = useRef(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            withCredentials: true,
          });
          setIsLoading(false);
        } catch (error) {
          console.error('Authentication error:', error);
          if (currentToastIdRef.current) {
            toast.close(currentToastIdRef.current);
          }
          currentToastIdRef.current = toast({
            title: "Authentication Error",
            description: "Please log in to access this page.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          
          router.push('/login');
        }
      };

      checkAuth();
    }, [router, toast]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth; 