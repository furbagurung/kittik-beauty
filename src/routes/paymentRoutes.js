import express from "express";
import {
  handleEsewaCallback,
  initiateEsewaPayment,
  renderEsewaPaymentPage,
  verifyEsewaPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/esewa/initiate", protect, initiateEsewaPayment);
router.get("/esewa/redirect/:transactionUuid", renderEsewaPaymentPage);
router.all("/esewa/callback/:transactionUuid", handleEsewaCallback);
router.post("/esewa/verify", protect, verifyEsewaPayment);

export default router;
