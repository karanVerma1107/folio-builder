import { Router } from "express";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import { makePost } from "../controllers/postControllers.js";

const prouter = Router();

prouter.route("/addPost").post(isAuthenticatedUser,upload.any(),makePost)




export default prouter