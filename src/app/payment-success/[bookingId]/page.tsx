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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
        if (
          paymentData.status === "completed" &&
          bookingData.status === "pending"
        ) {
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
            // If the booking was already confirmed, just update the local state
            if (bookingData.status === "confirmed") {
              setBooking((prev) =>
                prev ? { ...prev, status: "confirmed" } : null
              );
            }
          }
        } else if (bookingData.status === "confirmed") {
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
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

  if (!booking || !payment) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Booking or Payment not found
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
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

          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600">
              Your booking has been confirmed. You&apos;ll receive a
              confirmation email shortly.
            </p>
          </div>

          {/* Payment Details Card */}
          <Card className="mb-6 border-green-200 shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center text-green-800">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                    {payment.razorpay_payment_id ||
                      payment.transaction_id ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                    {payment.razorpay_order_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                  <p className="font-bold text-lg text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="font-medium capitalize">
                    {payment.method === "razorpay"
                      ? "Online (Razorpay)"
                      : payment.method}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 px-3 py-1"
                  >
                    ✓ {payment.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                  <p className="font-medium">
                    {formatDateTime(payment.updated_at)}
                  </p>
                </div>
              </div>
              {payment.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="font-medium">{payment.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Details Card */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CarIcon className="h-5 w-5 mr-2" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Car Information */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-xl mb-3 text-blue-900">
                    {booking.car?.name ||
                      (carLoading
                        ? "Loading car details..."
                        : `Car (ID: ${booking.car_id})`)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Brand & Model</p>
                      {carLoading ? (
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <p className="font-medium">
                          {booking.car?.brand && booking.car?.model
                            ? `${booking.car.brand} ${booking.car.model}`
                            : "Car details unavailable"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Year</p>
                      {carLoading ? (
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <p className="font-medium">
                          {booking.car?.year || "N/A"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Location</p>
                      {carLoading ? (
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <p className="font-medium">
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
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        {booking.car.fuel_type && (
                          <div>
                            <p className="text-gray-600 mb-1">Fuel Type</p>
                            <p className="font-medium capitalize">
                              {booking.car.fuel_type}
                            </p>
                          </div>
                        )}
                        {booking.car.engine?.transmission && (
                          <div>
                            <p className="text-gray-600 mb-1">Transmission</p>
                            <p className="font-medium capitalize">
                              {booking.car.engine.transmission}
                            </p>
                          </div>
                        )}
                        {booking.car.color && (
                          <div>
                            <p className="text-gray-600 mb-1">Color</p>
                            <p className="font-medium capitalize">
                              {booking.car.color}
                            </p>
                          </div>
                        )}
                        {booking.car.rental_price && (
                          <div>
                            <p className="text-gray-600 mb-1">Daily Rate</p>
                            <p className="font-medium">
                              {formatCurrency(booking.car.rental_price)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {carLoading && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rental Period Information */}
                {booking.start_date && booking.end_date && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      Rental Period
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600 mb-1">Start Date</p>
                        <p className="font-medium">
                          {formatDate(booking.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-600 mb-1">End Date</p>
                        <p className="font-medium">
                          {formatDate(booking.end_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-600 mb-1">Duration</p>
                        <p className="font-medium">
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
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                      {booking.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <Badge
                      variant="default"
                      className="bg-blue-100 text-blue-800 px-3 py-1"
                    >
                      {booking.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-bold text-lg text-blue-600">
                      {formatCurrency(booking.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Booking Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Booking Created
                    </p>
                    <p className="font-medium">
                      {formatDateTime(booking.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="font-medium">
                      {formatDateTime(booking.updated_at)}
                    </p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Special Notes</p>
                    <p className="font-medium bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                      {booking.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="mb-6 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="text-center text-green-800">
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="text-gray-600">
                  Successfully paid for {booking.car?.name}
                </p>
                {booking.start_date && booking.end_date && (
                  <p className="text-sm text-gray-500">
                    {calculateRentalDays(booking.start_date, booking.end_date)}{" "}
                    day(s) rental from {formatDate(booking.start_date)} to{" "}
                    {formatDate(booking.end_date)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-6 border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">
                📋 Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p>
                    A confirmation email has been sent to your registered email
                    address.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p>
                    Please carry a valid ID proof when picking up the vehicle.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p>
                    Contact the car owner for pickup location and timing
                    details.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <p>
                    Save your booking ID:{" "}
                    <span className="font-mono bg-gray-100 px-1 rounded">
                      {booking.id}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/bookings">📅 View All Bookings</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Link href="/cars">🚗 Book Another Car</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="border-gray-600 text-gray-600 hover:bg-gray-50"
            >
              🖨️ Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
