import { OrderRepository } from "../repositories/OrderRepository";
import { OrderItemInput } from "../types";

const orderRepository = new OrderRepository();

export class OrderService {
  async checkout(userId: number, items: OrderItemInput[]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("O pedido precisa ter ao menos um item");
    }
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        throw new Error("Cada item precisa de product_id e quantity válidos");
      }
    }
    const orderId = await orderRepository.createTransactional(userId, items);
    return { id: orderId };
  }

  async getByUser(userId: number) {
    const orders = await orderRepository.findByUser(userId);
    return Promise.all(orders.map(async (order) => ({ ...order, items: await orderRepository.findItemsByOrder(order.id) })));
  }

  async getAll() {
    const orders = await orderRepository.findAll();
    return Promise.all(orders.map(async (order) => ({ ...order, items: await orderRepository.findItemsByOrder(order.id) })));
  }

  async updateStatus(orderId: number, status: string) {
    if (!["pendente", "pago", "cancelado"].includes(status)) {
      throw new Error("Status inválido");
    }
    await orderRepository.updateStatus(orderId, status as "pendente" | "pago" | "cancelado");
    return { id: orderId, status };
  }
}