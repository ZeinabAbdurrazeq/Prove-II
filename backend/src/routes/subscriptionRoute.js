import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getMySubscription,
  simulatePayment,
  createPaypalCheckoutOrder,
  capturePaypalCheckoutOrder,
  cancelSubscription,
  checkAiInterviewLimit,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/me", protectRoute, getMySubscription);
router.post("/simulate-payment", protectRoute, simulatePayment);
router.post("/paypal/create-order", protectRoute, createPaypalCheckoutOrder);
router.post("/paypal/capture-order", protectRoute, capturePaypalCheckoutOrder);
router.post("/cancel", protectRoute, cancelSubscription);
router.get("/check-limit", protectRoute, checkAiInterviewLimit);

export default router;
