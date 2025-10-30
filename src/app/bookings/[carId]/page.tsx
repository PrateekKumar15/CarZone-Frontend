"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import ProtectedRoute from "@/components/auth/protected-route";
import Navbar from "@/components/layout/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiClient, Car, Booking } from "@/lib/api-client";
import { formatCurrency } from "@/lib/pricing-utils";
import { openRazorpayCheckout, RazorpayResponse } from "@/lib/razorpay-utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Car as CarIcon,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Info,
  Calculator,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function BookingFormPage() {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const params = useParams();
  const carId = params.carId as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carResponse, existingBookingsResponse] = await Promise.all([
          apiClient.getCarById(carId),
          apiClient.getBookingsByCar(carId),
        ]);
        setCar(carResponse);
        setExistingBookings(existingBookingsResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch car details");
        setExistingBookings([]); // Set empty array on error
        router.push("/cars");
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchData();
    }
  }, [carId, router]);

  const calculateTotalCost = () => {
    if (!startDate || !endDate || !car) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // All bookings are rentals - calculate based on daily rate
    return diffDays * car.rental_price;
  };

  const getDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getTotalPrice = () => {
    return calculateTotalCost();
  };

  const formatPrice = (price: number) => {
    return formatCurrency(price);
  };

  // Check if selected dates conflict with existing bookings
  const checkDateConflict = (start: string, end: string) => {
    if (existingBookings.length === 0) return false;

    const selectedStart = new Date(start);
    const selectedEnd = new Date(end);

    return existingBookings.some((booking) => {
      if (!booking.start_date || !booking.end_date) return false;

      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);

      // Check if dates overlap
      return selectedStart <= bookingEnd && selectedEnd >= bookingStart;
    });
  };

  // Get suggested available dates
  const getSuggestedDates = () => {
    const today = new Date();
    const suggestedStart = new Date(today);
    suggestedStart.setDate(today.getDate() + 7); // Start a week from now

    // Keep moving the suggested date until we find a clear period
    while (
      checkDateConflict(
        suggestedStart.toISOString().split("T")[0],
        new Date(suggestedStart.getTime() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      )
    ) {
      suggestedStart.setDate(suggestedStart.getDate() + 1);
    }

    const suggestedEnd = new Date(suggestedStart);
    suggestedEnd.setDate(suggestedStart.getDate() + 2); // 2-day rental

    return {
      start: suggestedStart.toISOString().split("T")[0],
      end: suggestedEnd.toISOString().split("T")[0],
    };
  };

  // Handle using suggested dates
  const useSuggestedDates = () => {
    const suggested = getSuggestedDates();
    setStartDate(suggested.start);
    setEndDate(suggested.end);
    toast.success("Suggested available dates selected!");
  };

  // Event handlers
  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (!user?.id) {
      toast.error("Please login to book a car");
      router.push("/auth/login");
      return;
    }

    if (!car?.owner?.id) {
      toast.error("Car owner information not found");
      return;
    }

    // Debug logging
    console.log("User data:", user);
    console.log("User ID:", user.id);
    console.log("Car owner ID:", car.owner.id);
    console.log("Selected dates:", { startDate, endDate });
    console.log("Existing bookings:", existingBookings);

    // Log formatted dates being sent to backend
    const formattedStartDate = startDate + "T00:00:00Z";
    const formattedEndDate = endDate + "T23:59:59Z";
    console.log("Formatted dates for backend:", {
      start: formattedStartDate,
      end: formattedEndDate,
    });

    // Validate UUID format (simple check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      console.error("Invalid user ID format:", user.id);
      toast.error("Authentication error. Please log out and log back in.");
      return;
    }
    if (!uuidRegex.test(carId)) {
      toast.error("Invalid car ID format");
      return;
    }
    if (!uuidRegex.test(car.owner.id)) {
      toast.error("Invalid owner ID format");
      return;
    }

    setBookingLoading(true);
    try {
      const bookingRequest: {
        customer_id: string;
        car_id: string;
        owner_id: string;
        start_date?: string;
        end_date?: string;
        notes?: string;
      } = {
        customer_id: user.id,
        car_id: carId,
        owner_id: car.owner.id,
      };

      if (startDate && endDate) {
        // Format dates as RFC3339 strings (Go time.Time JSON format)
        bookingRequest.start_date = startDate + "T00:00:00Z";
        bookingRequest.end_date = endDate + "T23:59:59Z";
      }

      if (notes.trim()) {
        bookingRequest.notes = notes.trim();
      }

      // Create booking first
      const booking = await apiClient.createBooking(bookingRequest);
      toast.success("Booking created! Redirecting to payment...");

      // Calculate amount for payment
      const amount = getTotalPrice();

      // Create payment order
      const paymentRequest = {
        booking_id: booking.id,
        amount: amount,
        method: "razorpay" as const,
        description: `Car rental payment for ${car.name}`,
        notes: notes.trim() || undefined,
      };

      const razorpayOrder = await apiClient.createPayment(paymentRequest);

      console.log("Created Razorpay Order:", razorpayOrder);
      console.log("Razorpay Order ID:", razorpayOrder.id);
      console.log("Razorpay Order Amount:", razorpayOrder.amount);
      console.log("Razorpay Order Currency:", razorpayOrder.currency);
      console.log("Razorpay Order Status:", razorpayOrder.status);

      // Check if we have a valid order ID
      if (!razorpayOrder.id) {
        console.error("ERROR: No order ID received from backend!");
        toast.error("Failed to create payment order. Please try again.");
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "CarZone",
        description: paymentRequest.description,
        order_id: razorpayOrder.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Debug: Log the response from Razorpay
            console.log("Razorpay Response:", response);
            console.log("Order ID:", response.razorpay_order_id);
            console.log("Payment ID:", response.razorpay_payment_id);
            console.log("Signature:", response.razorpay_signature);

            // Check if all required fields are present
            if (!response.razorpay_order_id) {
              console.warn(
                "Missing razorpay_order_id in response - this is expected in test environment"
              );
              // Try to use the order ID from our backend order creation
              console.log(
                "Attempting to use order ID from backend:",
                razorpayOrder.id
              );
              response.razorpay_order_id = razorpayOrder.id;
            }
            if (!response.razorpay_payment_id) {
              console.error("Missing razorpay_payment_id in response");
              throw new Error(
                "Missing razorpay_payment_id - payment may have failed"
              );
            }
            if (!response.razorpay_signature) {
              console.warn(
                "Missing razorpay_signature in response - this is expected in test environment"
              );
              console.log(
                "This might be a test payment - proceeding with mock verification"
              );
              // For test payments, create a mock signature (this should only be used in development)
              response.razorpay_signature = "test_signature_" + Date.now();
            }

            // Verify payment on backend
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            console.log("Sending verification data:", verificationData);

            await apiClient.verifyPayment(verificationData);

            // Redirect to success page
            router.push(`/payment-success/${booking.id}`);
          } catch (error) {
            console.error("Payment verification failed:", error);
            router.push(
              `/payment-failure?bookingId=${booking.id}&error=Payment verification failed`
            );
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: () => {
            router.push(
              `/payment-failure?bookingId=${booking.id}&error=Payment cancelled by user`
            );
          },
        },
      };

      openRazorpayCheckout(options);
    } catch (error) {
      console.error("Error creating booking:", error);

      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes("booking conflicts with existing rental")) {
          toast.error(
            "These dates are not available. Please select different dates for your rental.",
            {
              duration: 6000,
            }
          );
          // Clear the date inputs to force user to select new dates
          setStartDate("");
          setEndDate("");
        } else if (error.message.includes("fk_booking_customer_id")) {
          toast.error("Authentication error. Please log out and log back in.", {
            duration: 6000,
          });
          console.error("User ID not found in database. User:", user);
          // Redirect to login
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        } else if (error.message.includes("start date cannot be in the past")) {
          toast.error(
            "Start date cannot be in the past. Please select a future date."
          );
        } else if (error.message.includes("minimum rental duration")) {
          toast.error(
            "Minimum rental duration is 1 day. Please select an end date at least 1 day after start date."
          );
        } else {
          toast.error(`Failed to create booking: ${error.message}`);
        }
      } else {
        toast.error("Failed to create booking. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <Skeleton className="h-96" />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-96" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!car) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">
                  Car not found
                </h1>
                <p className="text-muted-foreground">
                  The car you&apos;re looking for doesn&apos;t exist or has been
                  removed.
                </p>
                <Button onClick={() => router.push("/cars")} className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cars
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!car.is_available) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">
                  Car Not Available
                </h1>
                <p className="text-muted-foreground">
                  This car is currently not available for booking.
                </p>
                <div className="flex gap-4 justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/cars/${carId}`)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Car Details
                  </Button>
                  <Button onClick={() => router.push("/cars")}>
                    Browse Cars
                  </Button>
                </div>
              </motion.div>
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
                onClick={() => router.push(`/cars/${carId}`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Book Your Car
                </h1>
                <p className="text-muted-foreground">
                  Complete the form to reserve your rental
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Car Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1"
              >
                <Card className="border-border bg-card sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CarIcon className="h-5 w-5 text-primary" />
                      </div>
                      Your Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Car Image */}
                    <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                      {car.images && car.images.length > 0 ? (
                        <Image
                          src={car.images[0]}
                          alt={`${car.brand} ${car.model}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Hide broken images and show placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                          unoptimized={true} // Skip Next.js optimization for potentially broken URLs
                        />
                      ) : null}
                      <div className="flex items-center justify-center h-full">
                        <CarIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Car Details */}
                    <div>
                      <h3 className="font-bold text-lg text-foreground">
                        {car.name || `${car.brand} ${car.model}`}
                      </h3>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {car.year} • {car.location_city}, {car.location_state}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Daily Rate:
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatPrice(car.rental_price)}
                        </span>
                      </div>
                    </div>

                    <Badge className="w-full justify-center bg-primary/10 text-primary hover:bg-primary/20">
                      Available
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-foreground">Name</Label>
                          <Input
                            value={user?.username || ""}
                            disabled
                            className="bg-muted text-muted-foreground"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Email</Label>
                          <Input
                            value={user?.email || ""}
                            disabled
                            className="bg-muted text-muted-foreground"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
                        <Info className="h-4 w-4 inline mr-1 text-primary" />
                        Customer information is automatically filled from your
                        profile.
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Booking Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        Booking Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Date Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="start-date"
                            className="text-foreground"
                          >
                            Start Date *
                          </Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            required
                            className="bg-background border-border"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date" className="text-foreground">
                            End Date *
                          </Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={
                              startDate ||
                              new Date().toISOString().split("T")[0]
                            }
                            required
                            className="bg-background border-border"
                          />
                        </div>
                      </div>

                      {/* Quick date selection helper */}
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={useSuggestedDates}
                          className="gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Suggest Available Dates
                        </Button>
                      </div>

                      {/* Show existing bookings */}
                      {existingBookings.length > 0 && (
                        <div className="mt-6">
                          <Label className="text-sm font-medium text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Currently Booked Dates (Unavailable)
                          </Label>
                          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                            {existingBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="text-xs bg-background border border-border rounded p-2"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-foreground flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {booking.start_date && booking.end_date
                                      ? `${new Date(
                                          booking.start_date
                                        ).toLocaleDateString()} - ${new Date(
                                          booking.end_date
                                        ).toLocaleDateString()}`
                                      : "Dates TBD"}
                                  </span>
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    {booking.status}
                                  </Badge>
                                </div>
                                {booking.notes && (
                                  <div className="text-muted-foreground mt-1 text-xs">
                                    Note: {booking.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-destructive mt-2 font-medium flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Please select dates that don&apos;t overlap with the
                            booked periods above.
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <Label htmlFor="notes" className="text-foreground">
                          Additional Notes
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Any special requirements or notes..."
                          value={notes}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setNotes(e.target.value)}
                          rows={3}
                          className="bg-background border-border"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Cost Summary */}
                {startDate && endDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-primary" />
                          </div>
                          Cost Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Daily Rate ({getDuration()}{" "}
                              {getDuration() === 1 ? "day" : "days"}):
                            </span>
                            <span className="font-medium text-foreground">
                              {formatPrice(car.rental_price)} × {getDuration()}
                            </span>
                          </div>
                          <div className="border-t border-border pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold text-foreground">
                                Total Cost:
                              </span>
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(calculateTotalCost())}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
                            <Info className="h-4 w-4 inline mr-1 text-primary" />
                            Final pricing and payment will be handled by the car
                            owner.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-border bg-card">
                    <CardContent className="pt-6">
                      <Button
                        onClick={handleBooking}
                        disabled={!startDate || !endDate || bookingLoading}
                        size="lg"
                        className="w-full font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {bookingLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5 mr-2" />
                            Book Rental
                          </>
                        )}
                      </Button>

                      <div className="text-center mt-4">
                        <p className="text-sm text-muted-foreground">
                          By proceeding, you agree to our terms of service and
                          the car owner will be notified of your booking
                          request.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
