import { Router } from "express";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import { likepost, makePost } from "../controllers/postControllers.js";

const prouter = Router();

prouter.route("/addPost").post(isAuthenticatedUser,upload.any(),makePost);
prouter.route("/likepost").post(isAuthenticatedUser, likepost);




export default prouter