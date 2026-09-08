import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();
const orderController = new OrderController();

router.use(authMiddleware);

router.post("/", (req, res) => orderController.checkout(req, res));
router.get("/me", (req, res) => orderController.myOrders(req, res));
router.get("/", adminMiddleware, (req, res) => orderController.getAll(req, res));
router.patch("/:id/status", adminMiddleware, (req, res) => orderController.updateStatus(req, res));

export default router;