import pool from "../database/connection";
import { Category } from "../types";

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY name");
    return rows as Category[];
  }

  async findById(id: number): Promise<Category | null> {
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    const categories = rows as Category[];
    return categories[0] || null;
  }

  async create(name: string): Promise<Category> {
    const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [name]);
    const insertResult = result as { insertId: number };
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [insertResult.insertId]);
    const categories = rows as Category[];
    return categories[0];
  }

  async update(id: number, name: string): Promise<Category | null> {
    await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    const deleteResult = result as { affectedRows: number };
    return deleteResult.affectedRows > 0;
  }
}