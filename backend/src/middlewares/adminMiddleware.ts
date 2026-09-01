import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

// Controle funcional de usuário: só deixa passar quem tem papel 'admin'.
// Deve ser usado sempre depois do authMiddleware (precisa de req.user já preenchido).
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Acesso restrito a administradores" });
    return;
  }
  next();
};