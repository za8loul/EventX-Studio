import { z } from "zod";

// MongoDB ObjectId type
export type ObjectId = string;

// User schema matching backend
export interface User {
  _id: ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

// Event schema matching backend
export interface Event {
  _id: ObjectId;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  currentBookings: number;
  price: number;
  category: "conference" | "workshop" | "seminar" | "concert" | "sports" | "other";
  status: "draft" | "published" | "cancelled" | "completed" | "sold_out";
  createdBy: ObjectId;
  isActive: boolean;
  bookingDeadline: Date;
  refundPolicy?: string;
  seatingLayout: {
    type: "theater" | "stadium" | "banquet" | "conference" | "custom";
    rows: number;
    seatsPerRow: number;
    customLayout?: Array<{
      rowNumber: number;
      seatsInRow: number;
    }>;
  };
  availableSeats?: number;
  isSoldOut?: boolean;
  bookingPercentage?: number;
}

// Seat schema matching backend
export interface Seat {
  _id: ObjectId;
  event: ObjectId;
  rowNumber: number;
  seatNumber: number;
  status: "available" | "reserved" | "paid" | "blocked";
  basePrice: number;
  finalPrice: number;
  category: "standard" | "premium" | "vip" | "accessible";
  priceMultiplier: number;
  isActive: boolean;
  isAccessible: boolean;
  features: string[];
  reservedBy?: ObjectId;
  reservedAt?: Date;
  reservationExpiry?: Date;
  seatIdentifier?: string;
  statusColor?: string;
}

// Ticket schema matching backend
export interface Ticket {
  _id: ObjectId;
  event: ObjectId;
  user: ObjectId;
  seat: ObjectId;
  status: "active" | "used" | "cancelled" | "refunded";
  purchasePrice: number;
  qrCode?: string;
  bookingReference: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Booking interface for frontend use
export interface Booking {
  _id: ObjectId;
  event: ObjectId;
  user: ObjectId;
  seats: ObjectId[];
  totalAmount: number;
  status: "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// Event booking request
export interface EventBookingRequest {
  eventId: ObjectId;
  seatIds: ObjectId[];
  totalAmount: number;
}

// Create event request
export interface CreateEventRequest {
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  price: number;
  category: "conference" | "workshop" | "seminar" | "concert" | "sports" | "other";
  bookingDeadline: Date;
  refundPolicy?: string;
  seatingLayout: {
    type: "theater" | "stadium" | "banquet" | "conference" | "custom";
    rows: number;
    seatsPerRow: number;
    customLayout?: Array<{
      rowNumber: number;
      seatsInRow: number;
    }>;
  };
}

// Update event request
export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: "draft" | "published" | "cancelled" | "completed" | "sold_out";
  isActive?: boolean;
}

// Zod schemas for validation
export const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  date: z.date(),
  location: z.string().min(1),
  capacity: z.number().min(1),
  price: z.number().min(0),
  category: z.enum(["conference", "workshop", "seminar", "concert", "sports", "other"]),
  bookingDeadline: z.date(),
  refundPolicy: z.string().max(500).optional(),
  seatingLayout: z.object({
    type: z.enum(["theater", "stadium", "banquet", "conference", "custom"]),
    rows: z.number().min(1),
    seatsPerRow: z.number().min(1),
    customLayout: z.array(z.object({
      rowNumber: z.number(),
      seatsInRow: z.number()
    })).optional()
  })
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(["draft", "published", "cancelled", "completed", "sold_out"]).optional(),
  isActive: z.boolean().optional()
});

export const eventBookingSchema = z.object({
  eventId: z.string(),
  seatIds: z.array(z.string()),
  totalAmount: z.number().min(0)
});

export const createTicketSchema = z.object({
  eventId: z.string(),
  seatId: z.string(),
  purchasePrice: z.number().min(0)
});

export const paymentSchema = z.object({
  amount: z.number().min(0),
  paymentMethod: z.string(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional()
});
