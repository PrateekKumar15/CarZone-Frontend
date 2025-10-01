import { Car } from "@/lib/api-client";

export interface PriceCalculation {
  dailyRate: number;
  numberOfDays: number;
  subtotal: number;
  taxes: number;
  total: number;
}

export const calculateRentalPrice = (
  car: Car,
  startDate: string,
  endDate: string
): PriceCalculation => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const numberOfDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Use the daily rental rate from the backend
  const dailyRate = car.rental_price;

  const subtotal = dailyRate * numberOfDays;
  const taxes = subtotal * 0.18; // 18% GST in India
  const total = subtotal + taxes;

  return {
    dailyRate,
    numberOfDays,
    subtotal,
    taxes,
    total,
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
