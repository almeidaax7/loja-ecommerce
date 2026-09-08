import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { uploadProductImage } from "../middlewares/uploadMiddleware";

const router = Router();
const productController = new ProductController();

router.get("/", (req, res) => productController.getAll(req, res));
router.get("/:id", (req, res) => productController.getById(req, res));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadProductImage.single("image"),
  (req, res) => productController.create(req, res)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadProductImage.single("image"),
  (req, res) => productController.update(req, res)
);
router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => productController.delete(req, res));

export default router;