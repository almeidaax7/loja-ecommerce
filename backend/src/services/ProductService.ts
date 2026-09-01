import fs from "fs";
import path from "path";
import { ProductRepository, ProductFilters } from "../repositories/ProductRepository";

const productRepository = new ProductRepository();
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "products");

export class ProductService {
  async getAll(filters: ProductFilters) {
    return productRepository.findAll(filters);
  }

  async getById(id: number) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("Produto não encontrado");
    return product;
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category_id?: number | null;
    image_filename?: string | null;
  }) {
    if (!data.name) throw new Error("Nome é obrigatório");
    if (!data.price || data.price <= 0) throw new Error("O preço precisa ser maior que zero");
    if (data.stock === undefined || data.stock < 0) throw new Error("O estoque não pode ser negativo");

    return productRepository.create(data);
  }

  async update(
    id: number,
    data: { name?: string; description?: string; price?: number; stock?: number; category_id?: number | null },
    newImageFilename?: string | null
  ) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new Error("Produto não encontrado");

    if (data.price !== undefined && data.price <= 0) throw new Error("O preço precisa ser maior que zero");
    if (data.stock !== undefined && data.stock < 0) throw new Error("O estoque não pode ser negativo");

    const updateData: Record<string, string | number | null> = { ...data };

    if (newImageFilename) {
      updateData.image_filename = newImageFilename;
      if (existing.image_filename) {
        fs.unlink(path.join(UPLOAD_DIR, existing.image_filename), () => {});
      }
    }

    return productRepository.update(id, updateData);
  }

  async delete(id: number) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new Error("Produto não encontrado");

    await productRepository.delete(id);

    if (existing.image_filename) {
      fs.unlink(path.join(UPLOAD_DIR, existing.image_filename), () => {});
    }
  }
}