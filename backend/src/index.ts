import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve as imagens de produto enviadas via upload (Tech Forge)
app.use("/uploads/products", express.static(path.join(__dirname, "..", "uploads", "products")));

app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// Handler central de erros — cobre erros do Multer (extensão/tamanho de imagem)
// que acontecem antes de chegar no controller, então não são pegos pelo try/catch dele.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: "Arquivo muito grande. Tamanho máximo excedido." });
      return;
    }
    res.status(400).json({ message: `Erro no upload: ${err.message}` });
    return;
  }
  if (err instanceof Error && err.message.startsWith("Extensão de arquivo")) {
    res.status(400).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Erro interno no servidor" });
});

export default app;