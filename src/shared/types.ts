// src/types/index.ts

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClothesMeasurement {
  id: string;
  customerId: string;
  name: string; // e.g., "Wedding clothe 2025"
  type: 'clothes';
  // Clothes specific fields
  length: number; // قد
  sleeve: number; // استین
  shoulder: number; // شانه
  armhole: number; // یخن
  chest: number; // سینه
  side: number; // بغل
  skirt: number; // دامن
  trousers: number; // تمبان
  legOpening: number; // پاچه
  cuff: number; // پټۍ
  sleeveDesign: string; // استین ډیزاین
  bottom: number; // کف
  neck: number; // غاړه
  pocketTop: string; // روی جیب
  pocketSide: string; // بغل جیب
  skirtDesign: string; // دامن ډیزاین
  trousersDesign: string; // تمبان ډیزاین
  trousersPocket: string; // تمبان جیب
  button: string; // تکمه
  stitching: string; // دوخت
  createdAt: Date;
  updatedAt: Date;
}

export interface WaistcoatMeasurement {
  id: string;
  customerId: string;
  name: string; // e.g., "Wedding waistcoat 2025"
  type: 'waistcoat';
  // Waistcoat specific fields
  length: number; // قد
  shoulder: number; // شانه
  side: number; // بغل
  waist: number; // کمر
  tureen: number; // تورین
  armhole: number; // یخن
  neck: string; // غاړه
  createdAt: Date;
  updatedAt: Date;
}

export type Measurement = ClothesMeasurement | WaistcoatMeasurement;

export interface Order {
  id: string;
  customerId: string;
  measurementId: string;
  measurementType: 'clothes' | 'waistcoat';
  orderDate: Date;
  deliveryDate: Date;
  status: string;
  advancePayment: number;
  totalCost: number;
  paid: number;
  unpaid: number;
  balanceDue: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fabric {
  id: string;
  type: string;
  color: string;
  quantity: number; // in meters/yards
  unit: 'meters' | 'yards';
  pricePerUnit: number;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trim {
  id: string;
  type: 'button' | 'zipper' | 'thread' | 'other';
  color: string;
  quantity: number;
  size?: string;
  pricePerUnit: number;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  orderId: string;
  customerId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  overdueOrders: number;
  todayRevenue: number;
  pendingDeliveries: number;
  workloadStatus: {
    inProgress: number;
    ready: number;
    draft: number;
  };
  weeklyRevenue: { day: string; amount: number }[];
}