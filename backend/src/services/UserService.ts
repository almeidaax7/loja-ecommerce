import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository";
import { isValidEmail, isValidPassword } from "../utils/validators";

const userRepository = new UserRepository();

export class UserService {
  async register(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      throw new Error("Todos os campos são obrigatórios");
    }
    if (!isValidEmail(email)) throw new Error("Email inválido");
    if (!isValidPassword(password)) {
      throw new Error("Senha deve ter no mínimo 6 caracteres");
    }

    const exists = await userRepository.findByEmail(email);
    if (exists) throw new Error("Email já cadastrado");

    const hashed = await bcrypt.hash(password, 10);
    // Novas contas sempre nascem como 'user' — só um admin já existente promove alguém a admin.
    const user = await userRepository.create(name, email, hashed, "user");

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Credenciais inválidas");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Credenciais inválidas");

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async me(id: number) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("Usuário não encontrado");
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}