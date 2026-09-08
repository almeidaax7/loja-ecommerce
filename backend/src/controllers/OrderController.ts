import { Response } from "express";
import { OrderService } from "../services/OrderService";
import { AuthRequest } from "../types";

const orderService = new OrderService();

export class OrderController {
  async checkout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { items } = req.body;
      const result = await orderService.checkout(userId, items);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async myOrders(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const orders = await orderService.getByUser(userId);
    res.status(200).json(orders);
  }

  async getAll(_req: AuthRequest, res: Response): Promise<void> {
    const orders = await orderService.getAll();
    res.status(200).json(orders);
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const result = await orderService.updateStatus(id, status);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}