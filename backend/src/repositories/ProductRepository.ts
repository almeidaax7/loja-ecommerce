import pool from "../database/connection";
import { Product } from "../types";

export interface ProductFilters {
  page: number;
  limit: number;
  category_id?: number;
  search?: string;
}

export class ProductRepository {
  async findAll(filters: ProductFilters): Promise<{ items: Product[]; total: number }> {
    const { page, limit, category_id, search } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (category_id) {
      conditions.push("p.category_id = ?");
      values.push(category_id);
    }
    if (search) {
      conditions.push("p.name LIKE ?");
      values.push(`%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM products p ${whereClause}`, values);
    const total = (countRows as { total: number }[])[0].total;

    return { items: rows as Product[], total };
  }

  async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [id]
    );
    const products = rows as Product[];
    return products[0] || null;
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category_id?: number | null;
    image_filename?: string | null;
  }): Promise<Product> {
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_filename)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.description || null, data.price, data.stock, data.category_id || null, data.image_filename || null]
    );
    const insertResult = result as { insertId: number };
    return (await this.findById(insertResult.insertId)) as Product;
  }

  async update(id: number, data: Record<string, string | number | null>): Promise<Product | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) return this.findById(id);

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f]);
    await pool.query(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    const deleteResult = result as { affectedRows: number };
    return deleteResult.affectedRows > 0;
  }
}