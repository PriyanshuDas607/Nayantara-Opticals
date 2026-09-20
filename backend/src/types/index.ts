export type ProductCategory =
  | "Eyeglasses"
  | "Sunglasses"
  | "Contact Lenses"
  | "Vision Aids"
  | "Hearing Aids";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  frameShape?: string;
  material?: string;
  color?: string;
  size?: "Small" | "Medium" | "Large" | "Universal";
  inStock: boolean;
  description: string;
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  phone: string;
  prescriptionType: "manual" | "file";
  fileUrl?: string;
  sphereOD?: string;
  cylinderOD?: string;
  axisOD?: string;
  sphereOS?: string;
  cylinderOS?: string;
  axisOS?: string;
  addition?: string;
  notes?: string;
  createdAt: string;
}
