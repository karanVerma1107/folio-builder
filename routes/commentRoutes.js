import { Router } from "express";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { getComment_post, likeComment, makeAcomment } from "../controllers/commentController.js";

const crouter = Router();

crouter.route("/makeComment/:postID").post(isAuthenticatedUser, makeAcomment);
crouter.route("/likeComment/:commentId").put(isAuthenticatedUser, likeComment);
crouter.route("/getcomments/:postId").get(getComment_post);



export default crouter;