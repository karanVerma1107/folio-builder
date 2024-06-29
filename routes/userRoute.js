import { Router } from "express";
import {  getUserDetails, loginOtp, logout, otpSendToVerify, verifyOtp } from "../controllers/userControllers.js";
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = Router();

router.route('/sendOTP').get(otpSendToVerify);
router.route('/verifysignUpOtp').post(verifyOtp);
router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/logout').post(isAuthenticatedUser, logout);
router.route('/loginOtp').get(loginOtp);
router.route('/login').post(verifyOtp)


export default router;