import { Request } from "express";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  created_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: number | null;
  category_name?: string;
  image_filename: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  total: number;
  status: "pendente" | "pago" | "cancelado";
  created_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface JwtPayload {
  id: number;
  name: string;
  role: "admin" | "user";
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}