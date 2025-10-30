"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { apiClient, Car } from "@/lib/api-client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Car as CarIcon,
  Fuel,
  Settings,
  ArrowLeft,
  Calendar,
  Gauge,
  Filter,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// Custom image component with error handling
const CarImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <>
      {!imageError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`${className} ${
            imageLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-200`}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      ) : (
        <div className="h-full flex items-center justify-center bg-muted">
          <CarIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <CarIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
      )}
    </>
  );
};

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await apiClient.getCars();
        setCars(data || []);
        setFilteredCars(data || []);
      } catch (error) {
        toast.error("Failed to fetch cars");
        console.error("Error fetching cars:", error);
        setCars([]);
        setFilteredCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    let filtered = cars;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (car) =>
          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by fuel type
    if (selectedFuelType !== "all") {
      filtered = filtered.filter(
        (car) => car.fuel_type.toLowerCase() === selectedFuelType.toLowerCase()
      );
    }

    setFilteredCars(filtered);
  }, [searchTerm, selectedFuelType, cars]);

  const fuelTypes = ["all", ...new Set(cars.map((car) => car.fuel_type))];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-background relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

          <div className="relative z-10 p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>

              <Skeleton className="h-32 w-full mb-8 rounded-lg" />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden border-border">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
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
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 p-6 md:p-8 lg:p-12">
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
                className="border-border hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-primary" />
                  Browse Cars
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Find your perfect ride today
                </p>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border bg-card/95 backdrop-blur-sm shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Search & Filter
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Narrow down your search to find the perfect car
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          placeholder="Search by brand, model, or name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-11 bg-background border-border focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="sm:w-56">
                      <select
                        title="Filter by fuel type"
                        value={selectedFuelType}
                        onChange={(e) => setSelectedFuelType(e.target.value)}
                        className="w-full h-11 px-3 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {fuelTypes.map((fuel) => (
                          <option key={fuel} value={fuel}>
                            {fuel === "all" ? "All Fuel Types" : fuel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>
                      Showing {filteredCars.length} of {cars.length} cars
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cars Grid */}
            {filteredCars.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-border bg-card/95 backdrop-blur-sm shadow-lg">
                  <CardContent className="text-center py-16">
                    <CarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                      No cars found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search filters to find more results
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                <AnimatePresence>
                  {filteredCars.map((car) => (
                    <motion.div key={car.id} variants={cardVariants} layout>
                      <Card className="overflow-hidden border-border bg-card/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                        <div className="relative h-48 bg-muted overflow-hidden">
                          {car.images && car.images.length > 0 ? (
                            <CarImage
                              src={car.images[0]}
                              alt={`${car.brand} ${car.model}`}
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <CarIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-primary text-primary-foreground shadow-md">
                              {car.fuel_type}
                            </Badge>
                          </div>
                          <div className="absolute top-3 right-3 bg-card rounded-full p-2 shadow-md">
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {car.year}
                            </span>
                          </div>
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                            {car.brand} {car.model}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground flex items-center gap-2">
                            <Gauge className="h-3 w-3" />
                            {car.mileage.toLocaleString()} miles
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 flex-1 flex flex-col">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 rounded-lg p-2">
                              <Fuel className="h-4 w-4" />
                              <span className="text-xs">{car.fuel_type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 rounded-lg p-2">
                              <Settings className="h-4 w-4" />
                              <span className="text-xs truncate">
                                {car.engine?.transmission || "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 mt-auto border-t border-border">
                            <div>
                              <div className="text-2xl font-bold text-primary">
                                {formatPrice(car.rental_price)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                per day
                              </div>
                            </div>
                            <Button
                              onClick={() => router.push(`/cars/${car.id}`)}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              size="sm"
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
