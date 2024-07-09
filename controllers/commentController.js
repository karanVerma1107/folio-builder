import user from "../datamodels/userSchema.js";
import Post from "../datamodels/postmodel.js";
import comment from "../datamodels/commentmodel.js";
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";


// make a comment 
export const makeAcomment = asyncHandler(async(req,res,next)=>{
    const postID = req.params.postID;
    const curr = req.user;
    try {
        if(!curr){
            return next(new ErrorHandler("login to access this resources", 400))
        }
        const currID =  curr._id;
        const post = await Post.findById(postID).populate("user_name").populate("commentla");
        if(!post){
            return next(new ErrorHandler("cannot get post", 400));
        }
        const ID = post._id;
        const Content = req.body.Content;
        
        const Comment = await new comment(
            {
                user_name: currID,
                post: ID,
                content: Content
            }
        ).populate("post")  ;
        Comment.populate("user_name", "display_pic userName" );
        


        
        
        await Comment.save();
const CommentIID = Comment._id;
        post.commentla.push(CommentIID);
        await post.save();

        res.status(200).json({
            message: "comment successfully made", 
            Comment
        })

    } catch (error) {
        console.log("error in making comment is : ", error);
        return next(new ErrorHandler("internal server error", 500))
    }
});