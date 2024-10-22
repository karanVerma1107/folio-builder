import { Router } from "express";
import {  clearProfilestuffs, editProfile, editobj, findUser, follow, getUnique, getUserDetails  , getUserPostsById, getfollowing, getotherUser, getuserskill, like, loginOtp, logout, otpSendToVerify, setProfile, usernameAvia, verifyLoginOtp, verifyOtp } from "../controllers/userControllers.js";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import { getNotification } from "../controllers/notificationcontrollers.js";
//import multer from "multer";
//const upload = multer({dest: "./backend/uploads"})


const router = Router();

router.route('/sendOTP').post(otpSendToVerify);
router.route('/verifysignUpOtp').post(verifyOtp);
router.route('/setUserName').post(isAuthenticatedUser, getUnique)
router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/logout').post(isAuthenticatedUser, logout);
router.route('/loginOtp').post(loginOtp);
router.route('/login').post(verifyLoginOtp)
router.route('/updateProfile').patch(isAuthenticatedUser, editProfile)
router.route('/editbj').patch(isAuthenticatedUser,editobj)
router.route('/setProfile').post(isAuthenticatedUser,upload.single("file"), setProfile)
router.route('/clearData').delete(isAuthenticatedUser, clearProfilestuffs)
router.route('/searchUser').get(findUser);
router.route('/like/:username').put(isAuthenticatedUser, like);
router.route('/connect/:username').put(isAuthenticatedUser, follow);
router.route('/:username').get(getotherUser);
router.route("/notification/:notificationId").get(isAuthenticatedUser, getNotification)
//router.route("/getfollowers/:userid").get(getfollowers);
router.route("/getfollowing/:userid").get(getfollowing);
router.route("/getuserbyskill").post(getuserskill);
router.route("/useravia").post(isAuthenticatedUser, usernameAvia);
router.route("/getUserPost").post(getUserPostsById);


export default router;