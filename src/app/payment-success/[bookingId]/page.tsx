"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient, Booking, Payment } from "@/lib/api-client";
import { toast } from "sonner";
import {
  CheckCircle,
  Car as CarIcon,
  CreditCard,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [carLoading, setCarLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  useEffect(() => {
    const fetchBookingAndPayment = async () => {
      try {
        setLoading(true);

        // Fetch booking details
        const bookingData = await apiClient.getBookingById(bookingId);
        console.log("Booking data received:", bookingData);
        setBooking(bookingData);

        // If booking doesn't have car details, fetch them separately
        if (bookingData && !bookingData.car && bookingData.car_id) {
          try {
            setCarLoading(true);
            console.log("Fetching car details for car_id:", bookingData.car_id);
            const carData = await apiClient.getCarById(bookingData.car_id);
            console.log("Car data fetched successfully:", carData);
            setBooking({ ...bookingData, car: carData });
          } catch (carError) {
            console.error("Failed to fetch car details:", carError);
            // Keep the booking data even if car fetch fails
            setBooking(bookingData);
          } finally {
            setCarLoading(false);
          }
        }

        // Fetch payment details
        const paymentData = await apiClient.getPaymentByBookingId(bookingId);
        console.log("Payment data received:", paymentData);
        setPayment(paymentData);

        // Update booking status to confirmed if payment is successful and status is still pending
        const bookingStatus = bookingData.status;
        if (paymentData.status === "completed" && bookingStatus === "pending") {
          try {
            await apiClient.updateBookingStatus(bookingId, "confirmed");
            setBooking((prev) =>
              prev ? { ...prev, status: "confirmed" } : null
            );
            console.log("Booking status updated to confirmed");
          } catch (statusError) {
            // Log the error but don't show it to the user if the booking is already confirmed
            console.log(
              "Status update error (may be already confirmed):",
              statusError
            );
            // Check if status is confirmed after failed update attempt
            const currentBookingData = await apiClient.getBookingById(
              bookingId
            );
            if (currentBookingData.status === "confirmed") {
              setBooking((prev) =>
                prev ? { ...prev, status: "confirmed" } : null
              );
            }
          }
        } else if (bookingStatus === "confirmed") {
          // Booking is already confirmed, no need to update
          console.log("Booking already confirmed, skipping status update");
        }
      } catch (error) {
        console.error("Error fetching booking/payment details:", error);
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingAndPayment();
    }
  }, [bookingId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateRentalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <Skeleton className="h-12 w-96 mx-auto rounded-xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!booking || !payment) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CarIcon className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Booking or Payment not found
              </h1>
              <Button
                onClick={() => router.push("/bookings")}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                View All Bookings
              </Button>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-background via-green-50/20 to-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/bookings")}
            className="mb-6 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>

          {/* Success Header with Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-2xl"
            >
              <CheckCircle className="h-14 w-14 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3"
            >
              Payment Successful!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Your booking has been confirmed. You&apos;ll receive a
              confirmation email shortly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-600 font-medium">
                Booking Confirmed
              </span>
            </motion.div>
          </motion.div>

          {/* Payment Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="mb-6 border-green-200 shadow-xl bg-background">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-foreground font-medium">
                      Transaction ID
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-muted/50 p-3 rounded-lg border flex-1 break-all">
                        {payment.razorpay_payment_id ||
                          payment.transaction_id ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-accent font-medium">
                      Order ID
                    </p>
                    <p className="font-mono text-sm bg-muted/50 p-3 rounded-lg border break-all">
                      {payment.razorpay_order_id || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-accent font-medium">
                      Amount Paid
                    </p>
                    <p className="font-bold text-2xl text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-accent font-medium">
                      Payment Method
                    </p>
                    <p className="font-medium capitalize bg-muted/50 p-3 rounded-lg border">
                      {payment.method === "razorpay"
                        ? "Online (Razorpay)"
                        : payment.method}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-accent font-medium">
                      Payment Status
                    </p>
                    <Badge
                      variant="default"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm"
                    >
                      ✓ {payment.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-accent font-medium">
                      Payment Date
                    </p>
                    <p className="font-medium bg-muted/50 p-3 rounded-lg border">
                      {formatDateTime(payment.updated_at)}
                    </p>
                  </div>
                </div>
                {payment.description && (
                  <div className="mt-6 pt-6 border-t space-y-2">
                    <p className="text-sm text-muted-accent  font-medium">
                      Description
                    </p>
                    <p className="font-medium bg-muted/50 p-3 rounded-lg border">
                      {payment.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="mb-6 shadow-xl border-border hover:shadow-2xl transition-shadow duration-300 rounded-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 p-4 to-cyan-500 text-white">
                Booking Details
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Car Information */}
                  <div className="border-b pb-6">
                    <h3 className="font-bold text-2xl mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {booking.car?.name ||
                        (carLoading
                          ? "Loading car details..."
                          : `Car (ID: ${booking.car_id})`)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">
                          Brand & Model
                        </p>
                        {carLoading ? (
                          <div className="h-5 bg-muted animate-pulse rounded"></div>
                        ) : (
                          <p className="font-medium bg-muted/50 p-2 rounded-lg border">
                            {booking.car?.brand && booking.car?.model
                              ? `${booking.car.brand} ${booking.car.model}`
                              : "Car details unavailable"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">
                          Year
                        </p>
                        {carLoading ? (
                          <div className="h-5 bg-muted animate-pulse rounded"></div>
                        ) : (
                          <p className="font-medium bg-muted/50 p-2 rounded-lg border">
                            {booking.car?.year || "N/A"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">
                          Location
                        </p>
                        {carLoading ? (
                          <div className="h-5 bg-muted animate-pulse rounded"></div>
                        ) : (
                          <p className="font-medium bg-muted/50 p-2 rounded-lg border">
                            {booking.car?.location_city &&
                            booking.car?.location_state
                              ? `${booking.car.location_city}, ${booking.car.location_state}`
                              : "Location unavailable"}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Additional car details if available */}
                    {booking.car && !carLoading && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {booking.car.fuel_type && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground font-medium">
                                Fuel Type
                              </p>
                              <Badge variant="secondary" className="capitalize">
                                {booking.car.fuel_type}
                              </Badge>
                            </div>
                          )}
                          {booking.car.engine?.transmission && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground font-medium">
                                Transmission
                              </p>
                              <Badge variant="secondary" className="capitalize">
                                {booking.car.engine.transmission}
                              </Badge>
                            </div>
                          )}
                          {booking.car.color && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground font-medium">
                                Color
                              </p>
                              <Badge variant="secondary" className="capitalize">
                                {booking.car.color}
                              </Badge>
                            </div>
                          )}
                          {booking.car.rental_price && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground font-medium">
                                Daily Rate
                              </p>
                              <p className="font-bold text-blue-600">
                                {formatCurrency(booking.car.rental_price)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {carLoading && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                              <div className="h-4 bg-muted rounded animate-pulse"></div>
                              <div className="h-5 bg-muted rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rental Period Information */}
                  {booking.start_date && booking.end_date && (
                    <div className="bg-gradient-to-br from-accent-50 to-accent-90 p-6 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Rental Period
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-background text-foreground p-4 rounded-lg">
                        <div className="space-y-2">
                          <p className="text-sm text-blue-600 font-medium">
                            Start Date
                          </p>
                          <p className="font-semibold p-3 rounded-lg border border-blue-200">
                            {formatDate(booking.start_date)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-blue-600 font-medium">
                            End Date
                          </p>
                          <p className="font-semibold  p-3 rounded-lg border border-blue-200">
                            {formatDate(booking.end_date)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-blue-600 font-medium">
                            Duration
                          </p>
                          <p className="font-semibol p-3 rounded-lg border border-blue-200">
                            {calculateRentalDays(
                              booking.start_date,
                              booking.end_date
                            )}{" "}
                            day(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        Booking ID
                      </p>
                      <p className="font-mono text-sm bg-muted/50 p-3 rounded-lg border break-all">
                        {booking.id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        Status
                      </p>
                      <Badge
                        variant="default"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2"
                      >
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        Total Amount
                      </p>
                      <p className="font-bold text-2xl text-blue-600">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Booking Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        Booking Created
                      </p>
                      <p className="font-medium bg-muted/50 p-3 rounded-lg border">
                        {formatDateTime(booking.created_at)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        Last Updated
                      </p>
                      <p className="font-medium bg-muted/50 p-3 rounded-lg border">
                        {formatDateTime(booking.updated_at)}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="border-t pt-4 space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        Special Notes
                      </p>
                      <p className="font-medium bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 text-yellow-900">
                        {booking.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="mb-6 border-green-200 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                <CardTitle className="text-center flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-muted-foreground text-lg">
                    Successfully paid for{" "}
                    <span className="font-semibold text-foreground">
                      {booking.car?.name}
                    </span>
                  </p>
                  {booking.start_date && booking.end_date && (
                    <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg border inline-block">
                      {calculateRentalDays(
                        booking.start_date,
                        booking.end_date
                      )}{" "}
                      day(s) rental from {formatDate(booking.start_date)} to{" "}
                      {formatDate(booking.end_date)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Important Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="mb-6 border-blue-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-foreground p-4">
                <CardTitle>Important Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-blue-600 text-lg">✓</span>
                    <p className="text-sm text-muted-foreground">
                      A confirmation email has been sent to your registered
                      email address.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-blue-600 text-lg">✓</span>
                    <p className="text-sm text-muted-foreground">
                      Contact the car owner for pickup location and timing
                      details.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-blue-600 text-lg">✓</span>
                    <p className="text-sm text-muted-foreground">
                      Save your booking ID:{" "}
                      <span className="font-mono bg-muted px-2 py-1 rounded border">
                        {booking.id}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/bookings">
                <Calendar className="h-4 w-4 mr-2" />
                View All Bookings
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/cars">
                <CarIcon className="h-4 w-4 mr-2" />
                Book Another Car
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="border-2 border-muted-foreground text-muted-foreground hover:bg-muted hover:border-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
