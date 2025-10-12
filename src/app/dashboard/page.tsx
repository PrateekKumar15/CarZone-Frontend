"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutUser } from "@/store/slices/authSlice";
import ProtectedRoute from "@/components/auth/protected-route";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Car,
  LogOut,
  ArrowRight,
  Sparkles,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    }),
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2 flex items-center">
                  {/* <Sparkles className="h-8 w-8 text-primary" /> */}
                  <Image
                    src="/logocar.png"
                    alt="CarZone Logo"
                    width={150}
                    height={100}
                  />
                  <div className="special-font uppercase z-10 text-primary/90 text-2xl sm:text-4xl md:text-5xl pointer-events-none">
                    D<b>a</b>shb<b>o</b>ard
                  </div>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Welcome back, {user?.username}!
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="transition-colors"
                size="lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
              {/* User Profile Card */}
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                      Profile Info
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Username
                        </p>
                        <p className="font-medium">{user?.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{user?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-foreground pt-2 border-t border-border">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <p className="font-medium capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* My Cars Card */}
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                      My Cars
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Manage your listed vehicles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      View and manage all your cars listed for rental.
                    </p>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group/btn"
                      onClick={() => router.push("/cars/my-cars")}
                      size="lg"
                    >
                      View My Cars
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* List Your Car Card */}
              <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                      List Your Car
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Earn money by renting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Share your vehicle and start earning passive income today.
                    </p>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group/btn"
                      onClick={() => router.push("/cars/create")}
                      size="lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Car
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* My Bookings Card */}
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                      My Bookings
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Manage your car rentals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      View and manage all your upcoming and past bookings in one
                      place.
                    </p>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group/btn"
                      onClick={() => router.push("/bookings")}
                      size="lg"
                    >
                      View Bookings
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Browse Cars Card */}
              <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="border-border bg-card hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                      Browse Cars
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Find your perfect ride
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Explore our wide selection of vehicles and book your next
                      adventure.
                    </p>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group/btn"
                      onClick={() => router.push("/cars")}
                      size="lg"
                    >
                      Browse Cars
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Shortcuts to common tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => router.push("/cars")}
                    >
                      <Car className="h-6 w-6" />
                      <span className="text-sm font-medium">Browse Cars</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => router.push("/cars/my-cars")}
                    >
                      <Car className="h-6 w-6" />
                      <span className="text-sm font-medium">My Cars</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => router.push("/bookings")}
                    >
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm font-medium">My Bookings</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => router.push("/cars/create")}
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-sm font-medium">List Your Car</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => router.push("/#contact")}
                    >
                      <Mail className="h-6 w-6" />
                      <span className="text-sm font-medium">Contact Us</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                      onClick={() => router.push("/")}
                    >
                      <Sparkles className="h-6 w-6" />
                      <span className="text-sm font-medium">Home</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
