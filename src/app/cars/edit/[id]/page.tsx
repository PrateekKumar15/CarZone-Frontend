"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/hooks/redux";
import ProtectedRoute from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  MapPin,
  Gauge,
  Settings,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

interface CarFormData {
  name: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  engine: {
    engine_size: number;
    cylinders: number;
    horsepower: number;
    torque: number;
    transmission: string;
  };
  location_city: string;
  location_state: string;
  location_country: string;
  rental_price: number;
  status: string;
  is_available: boolean;
  features: Record<string, boolean>;
  description: string;
  images: string[];
  mileage: number;
}

const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"];
const TRANSMISSION_TYPES = ["Manual", "Automatic", "CVT", "Semi-Automatic"];
const STATUS_OPTIONS = ["active", "maintenance", "inactive"];

const FEATURE_OPTIONS = [
  "Air Conditioning",
  "GPS Navigation",
  "Bluetooth",
  "Backup Camera",
  "Parking Sensors",
  "Sunroof",
  "Leather Seats",
  "Heated Seats",
  "Cruise Control",
  "Keyless Entry",
  "USB Ports",
  "Apple CarPlay",
  "Android Auto",
  "Lane Assist",
  "Blind Spot Monitor",
];

function EditCarPageContent() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;
  const { user } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCar, setIsFetchingCar] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<CarFormData>({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    fuel_type: "Petrol",
    engine: {
      engine_size: 1.5,
      cylinders: 4,
      horsepower: 150,
      torque: 200,
      transmission: "Automatic",
    },
    location_city: "",
    location_state: "",
    location_country: "",
    rental_price: 50,
    status: "active",
    is_available: true,
    features: {},
    description: "",
    images: [],
    mileage: 0,
  });

  const fetchCar = useCallback(async () => {
    if (!carId) return;

    try {
      setIsFetchingCar(true);
      const car = await apiClient.getCarById(carId);

      // Check if user owns this car
      if (car.owner_id !== user?.id) {
        toast.error("You don't have permission to edit this car");
        router.push("/cars/my-cars");
        return;
      }

      // Populate form with existing data
      setFormData({
        name: car.name,
        brand: car.brand,
        model: car.model,
        year: car.year,
        fuel_type: car.fuel_type,
        engine: car.engine,
        location_city: car.location_city,
        location_state: car.location_state,
        location_country: car.location_country,
        rental_price: car.rental_price,
        status: car.status,
        is_available: car.is_available,
        features: car.features as Record<string, boolean>,
        description: car.description,
        images: car.images,
        mileage: car.mileage,
      });

      setExistingImages(car.images);
    } catch (error) {
      console.error("Error fetching car:", error);
      toast.error("Failed to load car details");
      router.push("/cars/my-cars");
    } finally {
      setIsFetchingCar(false);
    }
  }, [carId, user?.id, router]);

  useEffect(() => {
    fetchCar();
  }, [fetchCar]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.startsWith("engine.")) {
      const engineField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        engine: {
          ...prev.engine,
          [engineField]: type === "number" ? parseFloat(value) || 0 : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith("engine.")) {
      const engineField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        engine: {
          ...prev.engine,
          [engineField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages =
      existingImages.length + imagePreviews.length + files.length;
    if (totalImages > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("You must be logged in to update a car");
      return;
    }

    // Validation
    if (!formData.name || !formData.brand || !formData.model) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.rental_price <= 0) {
      toast.error("Rental price must be greater than 0");
      return;
    }

    if (existingImages.length + imagePreviews.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      setIsLoading(true);

      // Convert new images to base64
      const newBase64Images: string[] = [];
      for (const file of imageFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newBase64Images.push(base64);
      }

      // Combine existing images with new base64 images
      const allImages = [...existingImages, ...newBase64Images];

      const carData = {
        ...formData,
        owner_id: user.id,
        images: allImages,
      };

      console.log("Updating car data:", carData);

      await apiClient.updateCar(carId, carData);

      toast.success("Car updated successfully!");
      router.push("/cars/my-cars");
    } catch (error: unknown) {
      console.error("Error updating car:", error);
      if (error instanceof Error) {
        toast.error(`Failed to update car: ${error.message}`);
      } else {
        toast.error("Failed to update car. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingCar) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-4 mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="p-4 bg-primary/10 rounded-2xl"
              >
                <Settings className="h-10 w-10 text-primary" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold text-foreground"
                >
                  Edit Car
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground mt-2 text-lg"
                >
                  Update your car listing details
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Essential details about your car
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Car Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Luxury Tesla Model 3"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="e.g., Tesla"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="e.g., Model 3"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        value={formData.year}
                        onChange={handleInputChange}
                        min={1900}
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="fuel_type">Fuel Type *</Label>
                      <Select
                        value={formData.fuel_type}
                        onValueChange={(value) =>
                          handleSelectChange("fuel_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FUEL_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mileage">Mileage (km)</Label>
                      <Input
                        id="mileage"
                        name="mileage"
                        type="number"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        min={0}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Engine Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    Engine Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="engine.engine_size">
                        Engine Size (L)
                      </Label>
                      <Input
                        id="engine.engine_size"
                        name="engine.engine_size"
                        type="number"
                        step="0.1"
                        value={formData.engine.engine_size}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="engine.cylinders">Cylinders</Label>
                      <Input
                        id="engine.cylinders"
                        name="engine.cylinders"
                        type="number"
                        value={formData.engine.cylinders}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="engine.horsepower">Horsepower (HP)</Label>
                      <Input
                        id="engine.horsepower"
                        name="engine.horsepower"
                        type="number"
                        value={formData.engine.horsepower}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="engine.torque">Torque (Nm)</Label>
                      <Input
                        id="engine.torque"
                        name="engine.torque"
                        type="number"
                        value={formData.engine.torque}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="engine.transmission">
                        Transmission *
                      </Label>
                      <Select
                        value={formData.engine.transmission}
                        onValueChange={(value) =>
                          handleSelectChange("engine.transmission", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSMISSION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="location_city">City *</Label>
                      <Input
                        id="location_city"
                        name="location_city"
                        value={formData.location_city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location_state">State *</Label>
                      <Input
                        id="location_state"
                        name="location_state"
                        value={formData.location_state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location_country">Country *</Label>
                      <Input
                        id="location_country"
                        name="location_country"
                        value={formData.location_country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing & Availability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    Pricing & Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="rental_price">
                        Daily Rental Price ($) *
                      </Label>
                      <Input
                        id="rental_price"
                        name="rental_price"
                        type="number"
                        step="0.01"
                        value={formData.rental_price}
                        onChange={handleInputChange}
                        min={0}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleSelectChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_available"
                        name="is_available"
                        checked={formData.is_available}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-border"
                        aria-label="Available for rent"
                      />
                      <Label htmlFor="is_available" className="cursor-pointer">
                        Available for Rent
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Gauge className="h-5 w-5 text-primary" />
                    </div>
                    Features
                  </CardTitle>
                  <CardDescription>
                    Select the features available in your car
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {FEATURE_OPTIONS.map((feature) => (
                      <div
                        key={feature}
                        onClick={() => handleFeatureToggle(feature)}
                        className={`
                          p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${
                            formData.features[feature]
                              ? "border-primary bg-primary/10 shadow-md scale-105"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }
                        `}
                      >
                        <span
                          className={`text-sm font-medium ${
                            formData.features[feature]
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your car, its condition, unique features, etc."
                    rows={5}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    Images
                  </CardTitle>
                  <CardDescription>
                    Upload images of your car (Max 10 images)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Current Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={image}
                              alt={`Car ${index + 1}`}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={`Remove existing image ${index + 1}`}
                              title="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {imagePreviews.length > 0 && (
                    <div>
                      <Label className="mb-2 block">New Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={preview}
                              alt={`New ${index + 1}`}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={`Remove new image ${index + 1}`}
                              title="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div>
                    <Label
                      htmlFor="images"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-foreground">
                          Click to upload more images
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 10MB each
                        </p>
                      </div>
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex gap-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 hover:bg-muted transition-all"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Updating Car...
                  </>
                ) : (
                  "Update Car"
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function EditCarPage() {
  return (
    <ProtectedRoute>
      <EditCarPageContent />
    </ProtectedRoute>
  );
}
