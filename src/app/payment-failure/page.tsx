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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
          console.log(
            "No payment found for booking (expected for failed payments)"
          );
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
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <Skeleton className="h-12 w-96 mx-auto" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!booking) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Booking not found
            </h1>
            <Button onClick={() => router.push("/bookings")}>
              View All Bookings
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/bookings")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>

          {/* Failure Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-lg text-gray-600">
              Unfortunately, your payment could not be processed. Your booking
              has been cancelled.
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="mb-6 border-red-200 shadow-lg">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">{error}</p>
                <p className="text-red-600 text-sm mt-2">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details Card (if payment exists) */}
          {payment && (
            <Card className="mb-6 border-orange-200 shadow-lg">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center text-orange-800">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Attempt Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-medium">
                      {payment.razorpay_payment_id ||
                        payment.transaction_id ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium capitalize">{payment.method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant="destructive">{payment.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Details Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CarIcon className="h-5 w-5 mr-2" />
                Cancelled Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Car Information */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {booking.car?.name || "Car Details"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Brand & Model</p>
                      <p className="font-medium">
                        {booking.car?.brand} {booking.car?.model} (
                        {booking.car?.year})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-medium">
                        {booking.car?.location_city},{" "}
                        {booking.car?.location_state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-medium">{booking.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant="destructive">{booking.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium">
                      {formatCurrency(booking.total_amount)}
                    </p>
                  </div>
                  {booking.start_date && booking.end_date && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">
                          {formatDate(booking.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium">
                          {formatDate(booking.end_date)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {booking.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium">{booking.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleRetryPayment}
              disabled={retryLoading}
              className="bg-blue-600 hover:bg-blue-700"
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
            <Button variant="outline" asChild>
              <Link href="/cars">Book Another Car</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bookings">View All Bookings</Link>
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
