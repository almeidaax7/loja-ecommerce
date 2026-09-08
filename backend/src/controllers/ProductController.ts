import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);
    const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const { items, total } = await productService.getAll({ page, limit, category_id, search });
    res.status(200).json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const product = await productService.getById(id);
      res.status(200).json(product);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stock, category_id } = req.body;
      const image_filename = req.file ? req.file.filename : null;

      const product = await productService.create({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category_id: category_id ? Number(category_id) : null,
        image_filename,
      });
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { name, description, price, stock, category_id } = req.body;

      const data: { name?: string; description?: string; price?: number; stock?: number; category_id?: number | null } = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = Number(price);
      if (stock !== undefined) data.stock = Number(stock);
      if (category_id !== undefined) data.category_id = category_id ? Number(category_id) : null;

      const newImageFilename = req.file ? req.file.filename : undefined;
      const product = await productService.update(id, data, newImageFilename);
      res.status(200).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await productService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}