import { Router } from "express";
import {  editProfile, editobj, getUnique, getUserDetails, loginOtp, logout, otpSendToVerify, setProfile, verifyLoginOtp, verifyOtp } from "../controllers/userControllers.js";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
//import multer from "multer";
//const upload = multer({dest: "./backend/uploads"})


const router = Router();

router.route('/sendOTP').get(otpSendToVerify);
router.route('/verifysignUpOtp').post(verifyOtp);
router.route('/setUserName').post(isAuthenticatedUser, getUnique)
router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/logout').post(isAuthenticatedUser, logout);
router.route('/loginOtp').get(loginOtp);
router.route('/login').post(verifyLoginOtp)
router.route('/updateProfile').patch(isAuthenticatedUser, editProfile)
router.route('/editbj').patch(isAuthenticatedUser,editobj)
router.route('/setProfile').post(isAuthenticatedUser,upload.single("file"), setProfile)

export default router;