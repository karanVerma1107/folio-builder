import { Router } from "express";
import { otpSendToVerify } from "../controllers/userControllers.js";

const router = Router();

router.route('/sendOTP').get(otpSendToVerify);

export default router;