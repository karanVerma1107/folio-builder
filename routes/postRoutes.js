import { Router } from "express";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import { deletepost, getAllposts, getFollowerPost, likepost, makePost } from "../controllers/postControllers.js";

const prouter = Router();

prouter.route("/addPost").post(isAuthenticatedUser,upload.any(),makePost);
prouter.route("/likepost/:postID").post(isAuthenticatedUser, likepost);
prouter.route("/getFollowPost").post(isAuthenticatedUser, getFollowerPost);
prouter.route("/getAllPost").post(getAllposts);
prouter.route("/deletepost/:postId").delete(isAuthenticatedUser, deletepost)



export default prouter;