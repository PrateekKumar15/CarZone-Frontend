"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import ProtectedRoute from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { apiClient, Car } from "@/lib/api-client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Car as CarIcon,
  Calendar,
  User,
  Phone,
  Mail,
  Info,
  MapPin,
  Star,
  Fuel,
  Settings,
  Gauge,
  Zap,
  Check,
  Shield,
  Clock,
  Award,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { motion } from "framer-motion";

// Custom Image Component with Error Handling
interface CarImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

const CarImage = ({
  src,
  alt,
  className = "",
  fill = false,
  sizes,
  ...props
}: CarImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError || !src || src.includes("example.com")) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted ${className}`}
      >
        <CarIcon className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        className={`object-cover transition-all duration-300 hover:scale-105 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        {...props}
      />
    </div>
  );
};

export default function CarDetailsPage() {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await apiClient.getCarById(carId);
        setCar(data);
      } catch (error) {
        toast.error("Failed to fetch car details");
        console.error("Error fetching car:", error);
        router.push("/cars");
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    }
  }, [carId, router]);

  const handleBooking = () => {
    if (!user?.id) {
      toast.error("Please login to book a car");
      return;
    }
    router.push(`/bookings/${carId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
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

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full" />
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
                Car not found
              </h1>
              <Button
                onClick={() => router.push("/cars")}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cars
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

        {/* Animated shapes */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/cars")}
              className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card hover:border-border transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cars
            </Button>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-semibold text-foreground">4.8</span>
              <span className="text-xs text-muted-foreground">
                (128 reviews)
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-8"
          >
            {/* Image Carousel - Takes 2 columns on XL screens */}
            <div className="xl:col-span-2 space-y-6">
              {/* Trust Badges Row */}
              <motion.div
                className="flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-green-600/10 px-4 py-2 rounded-full border border-green-500/20">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Verified Owner
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 px-4 py-2 rounded-full border border-blue-500/20">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    Top Rated
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-purple-600/10 px-4 py-2 rounded-full border border-purple-500/20">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    Instant Booking
                  </span>
                </div>
              </motion.div>

              {/* Image Carousel */}
              {car.images && car.images.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Carousel className="w-full">
                    <CarouselContent>
                      {car.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
                              <CardContent className="p-0 relative group">
                                <CarImage
                                  src={image}
                                  alt={`${car.brand} ${car.model} - Image ${
                                    index + 1
                                  }`}
                                  className="h-[450px] w-full rounded-2xl"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 66vw"
                                />
                                {/* Image overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end p-6">
                                  <span className="text-white text-sm font-medium">
                                    Image {index + 1} of {car.images.length}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {car.images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4 bg-card/90 backdrop-blur-md hover:bg-card border-border/50" />
                        <CarouselNext className="right-4 bg-card/90 backdrop-blur-md hover:bg-card border-border/50" />
                      </>
                    )}
                  </Carousel>
                </motion.div>
              ) : (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                  <CardContent className="flex items-center justify-center p-6 h-[450px]">
                    <div className="text-center">
                      <CarIcon className="h-32 w-32 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No images available
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Car Features Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <Fuel className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xs text-muted-foreground mb-1">
                          Fuel Type
                        </span>
                        <span className="text-sm font-semibold text-foreground capitalize">
                          {car.fuel_type}
                        </span>
                      </div>
                      <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <Zap className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xs text-muted-foreground mb-1">
                          Transmission
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {car.engine?.transmission || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <Gauge className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xs text-muted-foreground mb-1">
                          Mileage
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {car.mileage.toLocaleString()} mi
                        </span>
                      </div>
                      <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <Calendar className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xs text-muted-foreground mb-1">
                          Year
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {car.year}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Car Details Sidebar */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Car Info Card */}
              <Card className="border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="flex items-start justify-between">
                      <Badge
                        variant={car.is_available ? "default" : "secondary"}
                        className={`${
                          car.is_available
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-sm"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        } px-3 py-1.5`}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {car.is_available ? "Available Now" : "Unavailable"}
                      </Badge>
                    </div>

                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        {car.name || `${car.brand} ${car.model}`}
                      </h1>
                      <div className="flex items-center text-muted-foreground mb-2 bg-muted/30 px-3 py-2 rounded-lg">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">
                          {car.year} • {car.location_city}, {car.location_state}
                        </span>
                      </div>
                    </div>

                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 blur-xl" />
                      <div className="relative bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 p-5 rounded-2xl border border-border/50 backdrop-blur-sm">
                        <div className="flex items-baseline gap-2">
                          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPrice(car.rental_price)}
                          </div>
                          <span className="text-lg font-medium text-muted-foreground">
                            /day
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Best price in {car.location_city}
                        </p>
                      </div>
                    </div>

                    {car.description && (
                      <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-lg" />
                        <div className="relative bg-muted/30 p-5 rounded-xl border border-border/50 backdrop-blur-sm">
                          <div className="flex items-start gap-2 mb-2">
                            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <h3 className="text-sm font-semibold text-foreground">
                              About this car
                            </h3>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {car.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Specs Card */}
              <Card className="border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    Quick Specs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/40 to-muted/30 rounded-xl hover:from-muted/50 hover:to-muted/40 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Fuel className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Fuel Type
                      </span>
                    </div>
                    <span className="font-semibold text-sm capitalize text-foreground">
                      {car.fuel_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/40 to-muted/30 rounded-xl hover:from-muted/50 hover:to-muted/40 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Transmission
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {car.engine?.transmission || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/40 to-muted/30 rounded-xl hover:from-muted/50 hover:to-muted/40 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Gauge className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Mileage
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {car.mileage.toLocaleString()} mi
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Owner Information */}
              {car.owner && (
                <Card className="border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      Car Owner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border/50">
                        <div className="h-14 w-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center ring-2 ring-primary/20">
                          <User className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-base">
                            {car.owner.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Verified Owner
                          </p>
                        </div>
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/40 transition-colors group">
                        <div className="p-2 bg-card rounded-lg group-hover:bg-primary/10 transition-colors">
                          <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {car.owner.email}
                        </p>
                      </div>
                      {car.owner.phone && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/40 transition-colors group">
                          <div className="p-2 bg-card rounded-lg group-hover:bg-primary/10 transition-colors">
                            <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {car.owner.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Book Button */}
              {car.is_available && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleBooking}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary via-primary/90 to-secondary hover:from-primary/90 hover:via-secondary/90 hover:to-primary text-white font-bold py-7 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <Calendar className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Book This Car Now</span>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Detailed Specifications - Full Width */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Info className="h-6 w-6 text-primary" />
                  Detailed Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Engine Specs */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 text-base">
                      <Zap className="h-4 w-4 text-primary" />
                      Engine
                    </h4>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          Size:
                        </span>
                        <span className="font-medium text-sm text-foreground">
                          {car.engine?.engine_size || "N/A"}L
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          Power:
                        </span>
                        <span className="font-medium text-sm text-foreground">
                          {car.engine?.horsepower || "N/A"} HP
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          Torque:
                        </span>
                        <span className="font-medium text-sm text-foreground">
                          {car.engine?.torque || "N/A"} lb-ft
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* General Specs */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 text-base">
                      <Settings className="h-4 w-4 text-primary" />
                      General
                    </h4>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          Status:
                        </span>
                        <span className="font-medium text-sm capitalize text-foreground">
                          {car.status}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          Color:
                        </span>
                        <span className="font-medium text-sm text-foreground">
                          {car.color || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          VIN:
                        </span>
                        <span className="font-medium text-xs text-foreground">
                          {car.vin || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 text-base">
                      <span className="h-4 w-4 text-green-600 font-bold">
                        $
                      </span>
                      Pricing
                    </h4>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          Daily Rate:
                        </span>
                        <span className="font-semibold text-sm text-green-600">
                          {formatPrice(car.rental_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
