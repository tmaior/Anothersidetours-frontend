import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Box, Flex, Spinner, Text, Center } from '@chakra-ui/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          withCredentials: true,
        });
        
        if (response.data) {
          setIsAuthenticated(true);
          // localStorage.setItem("user", JSON.stringify(response.data));
        } else {
          throw new Error("No user data");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // localStorage.removeItem("user");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Flex direction="column" align="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>Verificando autenticação...</Text>
        </Flex>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Box>{children}</Box>;
} 