import { CategoryRepository } from "../repositories/CategoryRepository";

const categoryRepository = new CategoryRepository();

export class CategoryService {
  async getAll() {
    return categoryRepository.findAll();
  }

  async create(name: string) {
    if (!name || !name.trim()) throw new Error("Nome da categoria é obrigatório");
    return categoryRepository.create(name.trim());
  }

  async update(id: number, name: string) {
    if (!name || !name.trim()) throw new Error("Nome da categoria é obrigatório");
    const exists = await categoryRepository.findById(id);
    if (!exists) throw new Error("Categoria não encontrada");
    return categoryRepository.update(id, name.trim());
  }

  async delete(id: number) {
    const exists = await categoryRepository.findById(id);
    if (!exists) throw new Error("Categoria não encontrada");
    await categoryRepository.delete(id);
  }
}