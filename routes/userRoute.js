import { Router } from "express";
import {  getUnique, getUserDetails, loginOtp, logout, otpSendToVerify, verifyLoginOtp, verifyOtp } from "../controllers/userControllers.js";
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = Router();

router.route('/sendOTP').get(otpSendToVerify);
router.route('/verifysignUpOtp').post(verifyOtp);
router.route('/setUserName').post(isAuthenticatedUser, getUnique)
router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/logout').post(isAuthenticatedUser, logout);
router.route('/loginOtp').get(loginOtp);
router.route('/login').post(verifyLoginOtp)


export default router;