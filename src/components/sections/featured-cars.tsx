"use client";

import { useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fuel, Settings, ArrowRight, MapPin, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient, Car } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";



const FeaturedCars = () => {
  const router = useRouter();
  const sectionRef = useRef(null);

  const { data: carsData, isLoading } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: async () => {
      const cars = await apiClient.getCars();
      return cars.filter((car: Car) => car.is_available).slice(0, 3);
    },
  });

  const cars = useMemo(() => carsData || [], [carsData]);



  const handleViewCar = (carId: string) => {
    router.push(`/cars/${carId}`);
  };

  const handleViewAllCars = () => {
    router.push("/cars");
  };

  return (
    <section
      ref={sectionRef}
      id="featured-cars"
      className="py-20 bg-secondary/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured <span className="text-primary">Vehicles</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our premium collection of luxury vehicles, carefully
              selected for your ultimate driving experience.
            </p>
          </motion.div>
        </div>

        {isLoading && (
          <div className="cars-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && cars.length > 0 && (
          <div className="cars-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car: Car, index: number) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="car-card group bg-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border"
              >
                <div className="relative h-64 overflow-hidden bg-muted">
                  {car.images && car.images.length > 0 ? (
                    <Image
                      src={car.images[0]}
                      alt={`${car.brand} ${car.model}`}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">
                        No image available
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      {car.fuel_type}
                    </Badge>
                    {car.availability_type && (
                      <Badge variant="secondary">{car.availability_type}</Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-muted-foreground">{car.year}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary"></div>
                      <div className="text-sm text-muted-foreground">
                        per day
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-t border-border">
                    <div className="flex flex-col items-center text-center">
                      <MapPin className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        {car.location_city}
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Fuel className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        {car.fuel_type}
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Settings className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        {car.engine.transmission}
                      </span>
                    </div>
                  </div>

                  {car.mileage && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span>{car.mileage.toLocaleString()} miles</span>
                    </div>
                  )}

                  <Button
                    onClick={() => handleViewCar(car.id)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 group"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && cars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No featured cars available at the moment.
            </p>
          </div>
        )}

        {!isLoading && cars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Button
              onClick={handleViewAllCars}
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              View All Vehicles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCars;
