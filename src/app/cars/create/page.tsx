"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/hooks/redux";
import Image from "next/image";
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
  Car,
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

export default function CreateCarPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Limit to 5 images
    const remainingSlots = 5 - imageFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);

    setImageFiles((prev) => [...prev, ...filesToAdd]);

    // Create previews
    const newPreviews = await Promise.all(
      filesToAdd.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const convertImagesToBase64 = async (): Promise<string[]> => {
    return Promise.all(
      imageFiles.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a car");
      return;
    }

    // Validation
    if (!formData.name || formData.name.length < 3) {
      toast.error("Car name must be at least 3 characters long");
      return;
    }

    if (!formData.brand || formData.brand.length < 2) {
      toast.error("Brand must be at least 2 characters long");
      return;
    }

    if (!formData.model) {
      toast.error("Model is required");
      return;
    }

    if (formData.year < 1886 || formData.year > new Date().getFullYear()) {
      toast.error("Please enter a valid year");
      return;
    }

    if (
      !formData.location_city ||
      !formData.location_state ||
      !formData.location_country
    ) {
      toast.error("Location information is required");
      return;
    }

    if (formData.rental_price <= 0) {
      toast.error("Rental price must be greater than 0");
      return;
    }

    if (isNaN(formData.rental_price)) {
      toast.error("Rental price must be a valid number");
      return;
    }

    if (formData.engine.engine_size <= 0 || formData.engine.engine_size > 12) {
      toast.error("Engine size must be between 0.1 and 12.0 liters");
      return;
    }

    if (formData.engine.cylinders <= 0 || formData.engine.cylinders > 16) {
      toast.error("Cylinders must be between 1 and 16");
      return;
    }

    if (formData.engine.horsepower < 0 || formData.engine.horsepower > 2000) {
      toast.error("Horsepower must be between 0 and 2000");
      return;
    }

    if (formData.mileage < 0 || formData.mileage > 1000000) {
      toast.error("Mileage must be between 0 and 1,000,000");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsLoading(true);

    try {
      // Convert images to base64
      const base64Images = await convertImagesToBase64();

      // Prepare car data with explicit field mapping
      const carData = {
        owner_id: user.id,
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        fuel_type: formData.fuel_type,
        engine: {
          engine_size: formData.engine.engine_size,
          cylinders: formData.engine.cylinders,
          horsepower: formData.engine.horsepower,
          torque: formData.engine.torque,
          transmission: formData.engine.transmission,
        },
        location_city: formData.location_city,
        location_state: formData.location_state,
        location_country: formData.location_country,
        rental_price: Number(formData.rental_price), // Ensure it's a number
        status: formData.status,
        is_available: formData.is_available,
        features: formData.features,
        description: formData.description,
        images: base64Images,
        mileage: formData.mileage,
      };

      console.log("Submitting car data:", carData); // Debug log

      await apiClient.createCar(carData);

      toast.success("Car created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating car:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create car"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 hover:bg-muted"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-4 mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="p-4 bg-primary/10 rounded-2xl"
              >
                <Car className="h-10 w-10 text-primary" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold text-foreground"
                >
                  Add New Car
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground mt-2 text-lg"
                >
                  Fill in the details to list your car for rental
                </motion.p>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="mb-6 hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic details of your car
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Car Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Tesla Model 3 Long Range"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        name="brand"
                        placeholder="e.g., Tesla"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        name="model"
                        placeholder="e.g., Model 3"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        min="1886"
                        max={new Date().getFullYear()}
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="mileage">Mileage (km) *</Label>
                      <Input
                        id="mileage"
                        name="mileage"
                        type="number"
                        min="0"
                        max="1000000"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        required
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
              <Card className="mb-6 hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    Engine Specifications
                  </CardTitle>
                  <CardDescription>
                    Provide engine and performance details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="engine.engine_size">
                        Engine Size (L) *
                      </Label>
                      <Input
                        id="engine.engine_size"
                        name="engine.engine_size"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="12"
                        value={formData.engine.engine_size}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="engine.cylinders">Cylinders *</Label>
                      <Input
                        id="engine.cylinders"
                        name="engine.cylinders"
                        type="number"
                        min="1"
                        max="16"
                        value={formData.engine.cylinders}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="engine.horsepower">Horsepower *</Label>
                      <Input
                        id="engine.horsepower"
                        name="engine.horsepower"
                        type="number"
                        min="0"
                        max="2000"
                        value={formData.engine.horsepower}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="engine.torque">Torque (Nm) *</Label>
                      <Input
                        id="engine.torque"
                        name="engine.torque"
                        type="number"
                        min="0"
                        max="3000"
                        value={formData.engine.torque}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="engine.transmission">Transmission *</Label>
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="mb-6 hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    Location
                  </CardTitle>
                  <CardDescription>
                    Where is your car located?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="location_city">City *</Label>
                      <Input
                        id="location_city"
                        name="location_city"
                        placeholder="e.g., San Francisco"
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
                        placeholder="e.g., California"
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
                        placeholder="e.g., USA"
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
              <Card className="mb-6 hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    Pricing & Availability
                  </CardTitle>
                  <CardDescription>
                    Set your rental price and availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rental_price">
                        Daily Rental Price ($) *
                      </Label>
                      <Input
                        id="rental_price"
                        name="rental_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.rental_price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status *</Label>
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
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_available"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Available for rent immediately"
                    />
                    <Label htmlFor="is_available" className="cursor-pointer">
                      Available for rent immediately
                    </Label>
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
              <Card className="mb-6 hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Gauge className="h-5 w-5 text-primary" />
                    </div>
                    Features
                  </CardTitle>
                  <CardDescription>
                    Select the features your car has
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
              <Card className="mb-6 hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    Description
                  </CardTitle>
                  <CardDescription>
                    Provide additional details about your car
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your car, its condition, special features, etc."
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
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
              <Card className="mb-6 hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    Images *
                  </CardTitle>
                  <CardDescription>
                    Upload up to 5 high-quality images of your car
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Button */}
                    {imageFiles.length < 5 && (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <label htmlFor="images" className="cursor-pointer">
                          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground mb-1">
                            Click to upload images
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG up to 10MB ({imageFiles.length}/5)
                          </p>
                          <input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={`Remove image ${index + 1}`}
                              title="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Car className="mr-2 h-4 w-4" />
                    Create Car
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
