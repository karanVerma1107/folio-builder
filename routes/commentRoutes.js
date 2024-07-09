import { Router } from "express";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { makeAcomment } from "../controllers/commentController.js";

const crouter = Router();

crouter.route("/makeComment/:postID").post(isAuthenticatedUser, makeAcomment);



export default crouter;