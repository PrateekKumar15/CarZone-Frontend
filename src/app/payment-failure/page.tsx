"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient, Booking, Payment } from "@/lib/api-client";
import { toast } from "sonner";
import {
  XCircle,
  Car as CarIcon,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function PaymentFailurePage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("bookingId");
  const error = searchParams?.get("error") || "Payment failed";

  useEffect(() => {
    const fetchBookingAndPayment = async () => {
      if (!bookingId) return;

      try {
        setLoading(true);

        // Fetch booking details
        const bookingData = await apiClient.getBookingById(bookingId);
        setBooking(bookingData);

        // Try to fetch payment details (might not exist for failed payments)
        try {
          const paymentData = await apiClient.getPaymentByBookingId(bookingId);
          setPayment(paymentData);
        } catch {
          console.log("No payment found for booking (expected for failed payments)");
        }

        // Update booking status to cancelled if payment failed
        if (bookingData.status !== "cancelled") {
          await apiClient.updateBookingStatus(bookingId, "cancelled");
          setBooking({ ...bookingData, status: "cancelled" });
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndPayment();
  }, [bookingId]);

  const handleRetryPayment = async () => {
    if (!booking) return;

    setRetryLoading(true);
    try {
      // Navigate back to booking page for retry
      router.push(`/bookings/${booking.car_id}?retry=${bookingId}`);
    } catch {
      toast.error("Failed to retry payment");
    } finally {
      setRetryLoading(false);
    }
  };

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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-primary/5" />
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
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

  if (!booking) {
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
                Booking not found
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
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-primary/5" />
        
        {/* Animated shapes */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
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
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={() => router.push("/bookings")}
              className="mb-6 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card hover:border-border"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </motion.div>

          {/* Failure Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.5,
                delay: 0.2,
                type: "spring",
                stiffness: 200
              }}
            >
              <XCircle className="h-12 w-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Payment Failed
              </h1>
              <p className="text-lg text-muted-foreground">
                Unfortunately, your payment could not be processed. Don&apos;t worry, your booking has been cancelled.
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Error Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-red-500/50 bg-card/50 backdrop-blur-sm shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-border/50">
                    <CardTitle className="flex items-center text-foreground">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                      Error Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-600 font-semibold mb-2">{error}</p>
                      <p className="text-muted-foreground text-sm">
                        Please try again or contact support if the issue persists. No charges have been made to your account.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Attempt Details (if payment exists) */}
              {payment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-b border-border/50">
                      <CardTitle className="flex items-center text-foreground">
                        <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                        Payment Attempt Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Transaction ID</p>
                          <div className="font-mono text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                            {payment.razorpay_payment_id || payment.transaction_id || "N/A"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Attempted Amount</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p className="font-medium text-foreground capitalize">{payment.method}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Booking Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50">
                    <CardTitle className="flex items-center text-foreground">
                      <CarIcon className="h-5 w-5 mr-2 text-primary" />
                      Cancelled Booking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Car Information */}
                      {booking.car && (
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center">
                              <CarIcon className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-foreground">
                                {booking.car.brand} {booking.car.model}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.car.year} • {booking.car.fuel_type}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Booking Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Booking ID</p>
                          </div>
                          <p className="font-mono text-sm font-semibold text-foreground">{booking.id}</p>
                        </div>
                        <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Status</p>
                          </div>
                          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">
                            {booking.status}
                          </Badge>
                        </div>
                        {booking.start_date && (
                          <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Pick-up Date</p>
                            </div>
                            <p className="font-semibold text-foreground">{formatDate(booking.start_date)}</p>
                          </div>
                        )}
                        {booking.end_date && (
                          <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Return Date</p>
                            </div>
                            <p className="font-semibold text-foreground">{formatDate(booking.end_date)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar - Right Side (1 column) */}
            <div className="space-y-6">
              {/* Need Help Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                      Need Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => toast.info("Support phone: +1-800-CARZONE")}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Support
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => toast.info("Email: support@carzone.com")}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email Us
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => toast.info("Live chat coming soon!")}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Live Chat
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Common Issues Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Common Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                      <span>Insufficient balance in account</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                      <span>Card expired or blocked</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                      <span>Payment gateway timeout</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5" />
                      <span>Incorrect payment details</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Amount Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Attempted Amount</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border/50">
                      <span className="text-foreground font-semibold">Amount Charged</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹0
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      No charges were made to your account
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              onClick={handleRetryPayment}
              disabled={retryLoading}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {retryLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Payment
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/cars")}
              className="bg-card/50 backdrop-blur-sm"
            >
              <CarIcon className="h-4 w-4 mr-2" />
              Browse More Cars
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/bookings")}
              className="bg-card/50 backdrop-blur-sm"
            >
              View All Bookings
            </Button>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
