import express from "express";
import {
  initiateEsewaPayment,
  renderEsewaPaymentPage,
  verifyEsewaPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/esewa/initiate", initiateEsewaPayment);
router.get("/esewa/redirect/:transactionUuid", renderEsewaPaymentPage);
router.post("/esewa/verify", verifyEsewaPayment);

export default router;
