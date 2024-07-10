import { Router } from "express";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { likeComment, makeAcomment } from "../controllers/commentController.js";

const crouter = Router();

crouter.route("/makeComment/:postID").post(isAuthenticatedUser, makeAcomment);
crouter.route("/likeComment/:commentId").put(isAuthenticatedUser, likeComment);



export default crouter;