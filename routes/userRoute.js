import { Router } from "express";
import {  getUserDetails, otpSendToVerify, verifyOtp } from "../controllers/userControllers.js";
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = Router();

router.route('/sendOTP').get(otpSendToVerify);
router.route('/verifysignUpOtp').post(verifyOtp);
router.route('/me').get(isAuthenticatedUser, getUserDetails)

export default router;