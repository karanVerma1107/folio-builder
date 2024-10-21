import { Router } from "express";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { getreplyComment, likereply, make_reply_to_comment, reply_to_a_reply, replyreplyget } from "../controllers/replyControllers.js";

const rrouter = Router();

//rrouter.route('/replyComment/:commentId').post(isAuthenticatedUser, make_reply_to_comment);
rrouter.route('/replyComment/:id').post(isAuthenticatedUser, make_reply_to_comment);

rrouter.route("/replyreply/:replyId").post(isAuthenticatedUser,reply_to_a_reply);
rrouter.route("/getreplies/:commentId").get(getreplyComment);
rrouter.route("/getreplyreply/:replyId").get(replyreplyget);
rrouter.route("/like/:replyId").post(isAuthenticatedUser, likereply);

export default rrouter