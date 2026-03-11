/* eslint-disable @typescript-eslint/no-empty-object-type */
// Prisma schema converted to TypeScript types

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export interface User {
  id: string;
  email: string;
  password: string;
  imageUrl?: string;
  fullName?: string;
  gender?: Gender;
  phoneNo?: string;
  address?: string;
  userRole: UserRole;
  enabled: boolean;
  Customer?: Customer;
  Admin?: Admin;
  createdAt: string;
  upstringdAt: string;
}

export interface Customer {
  id: string;
  user: User;
  userId: string;
  createdAt: string;
  upstringdAt: string;
}

export interface Admin {
  id: string;
  user: User;
  userId: string;
  createdAt: string;
  upstringdAt: string;
}

export interface Certificate {
  id: string;
  name: string;
  salons: Salon[];
  salonIds: string[];
  createdAt: string;
  upstringdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  salons: Salon[];
  salonIds: string[];
  createdAt: string;
  upstringdAt: string;
}

export type SalonService = {
  id: string;
  name: string;
  salons: Salon[];
  salonIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export interface SalonTimingDate {
  year?: number;
  month?: number;
  day?: number;
}

export interface SalonTiming {
  day?: number;
  hour?: number;
  minute?: number;
  date?: SalonTimingDate;
}

export interface SalonDayTiming {
  close?: SalonTiming;
  open?: SalonTiming;
}

export interface GeoJson {
  type: string; // Value Always "Point"
  coordinates: number[]; // [Longitude, Latitude]
}

export interface Salon {
  id: string;
  name?: string;
  phone?: string;
  logoUrl?: string;
  website?: string;
  address?: string;
  reservationLink?: string;
  rating?: number;
  ratingCount?: number;
  location?: GeoJson;
  placeId?: string;
  placeUrl?: string;
  placeCity?: string;
  salonTiming?: SalonDayTiming[];
  salonTimingWeekdayDescriptions?: string[];
  photos: string[];
  enabled: boolean;
  brands: Brand[];
  brandIds: string[];
  certificates: Certificate[];
  certificateIds: string[];
  offeredServices: SalonService[];
  offeredServicesIds: string[];
  createdAt: string;
  upstringdAt: string;
}

export interface Location {
  type: "Point";
  coordinates: [number, number];
}
