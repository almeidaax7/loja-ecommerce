import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();
const categoryController = new CategoryController();

router.get("/", (req, res) => categoryController.getAll(req, res));
router.post("/", authMiddleware, adminMiddleware, (req, res) => categoryController.create(req, res));
router.put("/:id", authMiddleware, adminMiddleware, (req, res) => categoryController.update(req, res));
router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => categoryController.delete(req, res));

export default router;