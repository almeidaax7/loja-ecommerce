import pool from "../database/connection";
import { User } from "../types";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const users = rows as User[];
    return users[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    const users = rows as User[];
    return users[0] || null;
  }

  async create(name: string, email: string, hashedPassword: string, role: "admin" | "user" = "user"): Promise<User> {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );
    const insertResult = result as { insertId: number };
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [insertResult.insertId]);
    const users = rows as User[];
    return users[0];
  }
}