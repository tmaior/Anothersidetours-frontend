import { Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export default function LogoutButton({ variant = "ghost", ...props }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true
      });

      localStorage.removeItem("user");

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      {...props}
    >
      Logout
    </Button>
  );
} 