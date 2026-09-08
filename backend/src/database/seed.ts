import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import pool from "./connection";

async function seed() {
  console.log("Iniciando seed...");

  const adminEmail = "admin@loja.com";
  const adminPassword = "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('Administrador', ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [adminEmail, passwordHash]
  );
  console.log(`Admin criado -> login: ${adminEmail} / senha: ${adminPassword}`);

  const categories = ["Eletrônicos", "Casa e Cozinha", "Livros", "Moda"];
  for (const name of categories) {
    await pool.query("INSERT INTO categories (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)", [name]);
  }
  console.log("Categorias criadas.");

  const [rows] = await pool.query("SELECT id, name FROM categories");
  const categoryMap = new Map((rows as { id: number; name: string }[]).map((c) => [c.name, c.id]));

  const products = [
    { name: "Fone de Ouvido Bluetooth", description: "Fone sem fio com cancelamento de ruído.", price: 199.9, stock: 25, category: "Eletrônicos" },
    { name: "Cafeteira Elétrica", description: "Cafeteira 30 xícaras com desligamento automático.", price: 149.5, stock: 12, category: "Casa e Cozinha" },
    { name: "Livro: Introdução à Programação", description: "Guia prático para quem está começando a programar.", price: 59.9, stock: 40, category: "Livros" },
    { name: "Camiseta Básica", description: "Camiseta 100% algodão, várias cores.", price: 39.9, stock: 60, category: "Moda" },
    { name: "Smartwatch Sport", description: "Relógio inteligente com monitor cardíaco.", price: 349.0, stock: 8, category: "Eletrônicos" },
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)`,
      [p.name, p.description, p.price, p.stock, categoryMap.get(p.category) || null]
    );
  }
  console.log("Produtos de exemplo criados.");

  await pool.end();
  console.log("Seed concluído.");
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});