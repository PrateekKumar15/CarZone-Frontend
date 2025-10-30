"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import ProtectedRoute from "@/components/auth/protected-route";
import Navbar from "@/components/layout/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient, Booking } from "@/lib/api-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Calendar,
  Car,
  DollarSign,
  Clock,
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;

      try {
        let data;
        // Owners see bookings of their cars, renters see their own bookings
        if (user.role === "owner") {
          data = await apiClient.getBookingsByOwner(user.id);
        } else {
          data = await apiClient.getBookingsByCustomer(user.id);
        }
        setBookings(data || []); // Handle null/undefined response
      } catch (error) {
        toast.error("Failed to fetch bookings");
        console.error("Error fetching bookings:", error);
        setBookings([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id, user?.role]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDays = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-48" />
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-border bg-card">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {user?.role === "owner" ? "Car Bookings" : "My Bookings"}
                </h1>
                <p className="text-muted-foreground">
                  {user?.role === "owner"
                    ? "Manage bookings for your cars"
                    : "Manage your car rental bookings"}
                </p>
              </div>
            </motion.div>

            {bookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="text-center py-12 border-border bg-card">
                  <CardContent>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Car className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t made any car bookings yet. Start
                      exploring our cars!
                    </p>
                    <Button onClick={() => router.push("/cars")}>
                      Browse Cars
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-foreground">
                              {booking.car?.brand} {booking.car?.model}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              Booking #{booking.id}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {booking.start_date && booking.end_date ? (
                          <>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(booking.start_date)} -{" "}
                                {formatDate(booking.end_date)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {calculateDays(
                                  booking.start_date,
                                  booking.end_date
                                )}{" "}
                                days
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Purchase - No rental dates</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-primary">
                            ${(booking.total_amount || 0).toLocaleString()}
                          </span>
                        </div>

                        {booking.car && (
                          <div className="pt-2 border-t border-border">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Year:</span>
                              <span className="text-foreground">
                                {booking.car.year}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Fuel:</span>
                              <span className="text-foreground">
                                {booking.car.fuel_type}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Transmission:</span>
                              <span className="text-foreground">
                                {booking.car.engine?.transmission || "N/A"}
                              </span>
                            </div>
                          </div>
                        )}

                        {booking.customer && (
                          <div className="pt-2 border-t border-border">
                            <div className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                              Customer Contact
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <UserIcon className="h-3.5 w-3.5 text-primary" />
                                <span className="text-foreground">
                                  {booking.customer.username}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                                <span className="truncate text-foreground">
                                  {booking.customer.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3.5 w-3.5 text-primary" />
                                <span className="text-foreground">
                                  {booking.customer.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(`/cars/${booking.car_id}`)
                            }
                          >
                            View Car
                          </Button>
                          {booking.status === "pending" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await apiClient.deleteBooking(booking.id);
                                  setBookings(
                                    bookings.filter((b) => b.id !== booking.id)
                                  );
                                  toast.success(
                                    "Booking cancelled successfully"
                                  );
                                } catch {
                                  toast.error("Failed to cancel booking");
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
