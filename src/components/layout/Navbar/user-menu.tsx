"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Car,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { logoutUser } from "@/store/slices/authSlice";

interface UserData {
  username: string;
  email: string;
  id?: string;
}

export default function UserMenu() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Get user from Redux store
  const reduxUser = useAppSelector((state) => state.auth.user);

  // Local state for user
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Check Redux state first
    if (reduxUser) {
      setUser(reduxUser);
      // Store user in localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(reduxUser));
      }
      return;
    }

    // Fallback: Check if token exists in localStorage (for page refreshes)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
        }
      }
    }
  }, [reduxUser]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Dispatch Redux logout action which handles API call and localStorage clearing
      await dispatch(logoutUser()).unwrap();

      // Clear all auth-related localStorage items (including Redux Persist)
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        // Also clear Redux Persist cache if it exists
        const persistKey = "persist:root";
        const persistedState = localStorage.getItem(persistKey);
        if (persistedState) {
          try {
            const parsed = JSON.parse(persistedState);
            // Clear only the auth portion of persisted state
            parsed.auth = JSON.stringify({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            localStorage.setItem(persistKey, JSON.stringify(parsed));
          } catch {
            // If parsing fails, remove the entire persist key
            localStorage.removeItem(persistKey);
          }
        }
      }

      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");

      // Force clear localStorage even if API call fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("persist:root");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Not logged in - show Login/Signup buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/auth/login")}
          className="text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
        <Button
          size="sm"
          onClick={() => router.push("/auth/register")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Sign Up
        </Button>
      </div>
    );
  }

  // Logged in - show user menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary transition-colors">
            <AvatarImage src="" alt={user.username} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-card border-border shadow-lg"
        align="end"
      >
        <DropdownMenuLabel className="flex min-w-0 flex-col pb-2">
          <span className="text-foreground truncate text-sm font-semibold">
            {user.username}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/bookings")}
            className="cursor-pointer focus:bg-secondary focus:text-foreground"
          >
            <Calendar className="h-4 w-4 mr-3 text-primary" />
            <span>My Bookings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer focus:bg-secondary focus:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4 mr-3 text-primary" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/cars")}
            className="cursor-pointer focus:bg-secondary focus:text-foreground"
          >
            <Car className="h-4 w-4 mr-3 text-primary" />
            <span>Browse All Cars</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className="cursor-pointer focus:bg-destructive/10 focus:text-destructive text-destructive"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span>{isLoading ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
