"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAppSelector } from "@/hooks/redux";
import { apiClient, Car } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Edit,
  Trash2,
  Plus,
  Car as CarIcon,
  MapPin,
  Fuel,
  Gauge,
  Clock,
} from "lucide-react";

export default function MyCarsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyCars = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError("");
      const myCars = await apiClient.getCarsByOwner(user.id);
      setCars(myCars);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Failed to load your cars. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.id) {
      fetchMyCars();
    }
  }, [user, isAuthenticated, router, fetchMyCars]);

  const handleDelete = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this car?")) {
      return;
    }

    try {
      await apiClient.deleteCar(carId);
      setCars(cars.filter((car) => car.id !== carId));
    } catch (err) {
      console.error("Error deleting car:", err);
      alert("Failed to delete car. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-32 -translate-x-32" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <CarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                      My Cars
                    </h1>
                    <p className="text-primary-foreground/80 text-lg mt-1">
                      Manage your car listings
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-primary-foreground/90">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-medium">
                      {cars.length} Active Listings
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push("/cars/create")}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Car
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}

        {/* Cars Grid */}
        {cars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="pt-16 pb-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="p-6 bg-primary/10 rounded-full">
                    <CarIcon className="h-16 w-16 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">
                      No cars listed yet
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                      Start by adding your first car to the platform and reach
                      thousands of potential renters
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/cars/create")}
                    size="lg"
                    className="mt-4"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Car
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card">
                  {/* Car Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-muted">
                    {car.images && car.images.length > 0 ? (
                      <Image
                        src={car.images[0]}
                        alt={car.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CarIcon className="h-20 w-20 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={car.is_available ? "default" : "secondary"}
                        className={
                          car.is_available
                            ? "bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg"
                            : "bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg"
                        }
                      >
                        {car.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-2xl font-bold text-primary">
                          ${car.rental_price}
                        </p>
                        <p className="text-xs text-muted-foreground">per day</p>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3 space-y-2">
                    <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {car.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="font-normal">
                        {car.brand}
                      </Badge>
                      <span>•</span>
                      <span>{car.model}</span>
                      <span>•</span>
                      <span>{car.year}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Location
                          </p>
                          <p className="text-sm font-medium truncate">
                            {car.location_city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Fuel className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Fuel</p>
                          <p className="text-sm font-medium truncate">
                            {car.fuel_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Gauge className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Transmission
                          </p>
                          <p className="text-sm font-medium truncate">
                            {car.engine.transmission}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Status
                          </p>
                          <p className="text-sm font-medium truncate capitalize">
                            {car.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 gap-3 bg-muted/30">
                    <Button
                      onClick={() => router.push(`/cars/edit/${car.id}`)}
                      className="flex-1"
                      variant="default"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(car.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
