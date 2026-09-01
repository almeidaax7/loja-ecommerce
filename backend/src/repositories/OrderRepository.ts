import pool from "../database/connection";
import { Order, OrderItem, OrderItemInput } from "../types";

export class OrderRepository {
  /**
   * Cria um pedido de forma transacional: confere preço e estoque reais no banco
   * (nunca confia no valor enviado pelo cliente), decrementa o estoque de cada item
   * e desfaz tudo (rollback) se algum item não tiver estoque suficiente.
   */
  async createTransactional(userId: number, items: OrderItemInput[]): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let total = 0;
      const resolvedItems: { product_id: number; quantity: number; unit_price: number }[] = [];

      for (const item of items) {
        const [rows] = await connection.query(
          "SELECT id, name, price, stock FROM products WHERE id = ? FOR UPDATE",
          [item.product_id]
        );
        const products = rows as { id: number; name: string; price: number; stock: number }[];
        const product = products[0];

        if (!product) throw new Error(`Produto ${item.product_id} não encontrado`);
        if (product.stock < item.quantity) throw new Error(`Estoque insuficiente para o produto "${product.name}"`);

        const unitPrice = Number(product.price);
        total += unitPrice * item.quantity;
        resolvedItems.push({ product_id: item.product_id, quantity: item.quantity, unit_price: unitPrice });

        await connection.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.product_id]);
      }

      const [orderResult] = await connection.query(
        "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)",
        [userId, total, "pendente"]
      );
      const orderId = (orderResult as { insertId: number }).insertId;

      for (const item of resolvedItems) {
        await connection.query(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [orderId, item.product_id, item.quantity, item.unit_price]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findByUser(userId: number): Promise<Order[]> {
    const [rows] = await pool.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return rows as Order[];
  }

  async findAll(): Promise<Order[]> {
    const [rows] = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    return rows as Order[];
  }

  async findItemsByOrder(orderId: number): Promise<OrderItem[]> {
    const [rows] = await pool.query(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows as OrderItem[];
  }

  async updateStatus(orderId: number, status: Order["status"]): Promise<void> {
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  }
}