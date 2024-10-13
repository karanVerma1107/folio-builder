import user from "../datamodels/userSchema.js";
import Post from "../datamodels/postmodel.js";
import comment from "../datamodels/commentmodel.js";
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";
import Notification from "../datamodels/notificationModel.js";
import { createNotification } from "./notificationcontrollers.js";

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

 const text = `${curr.userName} commented on your post.`;
const commentid = Comment._id;
const newNotification = await new Notification({
   message: text,
   commentid: commentid,
   expiryAt: new Date(Date.now() + 5*24*60*60*1000)       
});

await newNotification.save();

const userid = post.user_name;
const User = await user.findById(userid);

await User.notifications.push(newNotification._id);

await User.save();

        res.status(200).json({
            message: "comment made successfully", 
            Comment
        })

    } catch (error) {
        console.log("error in making comment is : ", error);
        return next(new ErrorHandler("internal server error", 500))
    }
});

export const deleteComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId } = req.params; // Assuming you're sending both IDs in the URL
    const curr = req.user;

    try {
        if (!curr) {
            return next(new ErrorHandler("Login to access this resource", 400));
        }

        // Find the post
        const post = await Post.findById(postId).populate("commentla");
        if (!post) {
            return next(new ErrorHandler("Post not found", 404));
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return next(new ErrorHandler("Comment not found", 404));
        }

        // Check if the current user is the owner of the comment or has permission to delete it
        if (comment.user_name.toString() !== curr._id.toString()) {
            return next(new ErrorHandler("You are not authorized to delete this comment", 403));
        }

        // Remove comment from the post's commentla array
        post.commentla = post.commentla.filter(id => id.toString() !== commentId);
        await post.save();

        // Delete the comment from the database
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        console.log("Error in deleting comment: ", error);
        return next(new ErrorHandler("Internal server error", 500));
    }
});














// Like or unlike any comment
export const likeComment = asyncHandler(async (req, res, next) => {
    const curr = req.user;
    const commentId = req.params.commentId;
console.log("got reached")
    try {
        if (!curr) {
            return next(new ErrorHandler("Kindly login to access this resource", 400));
        }

        if (!commentId) {
            return next(new ErrorHandler("Invalid comment", 400));
        }

        const Comment = await comment.findById(commentId).populate("user_name");

        if (!Comment) {
            return next(new ErrorHandler("Comment not found", 404));
        }

        // Check if the user has already liked the comment
        if (!Comment.no_of_peo_liked.includes(curr._id)) {
            // Like the comment
            Comment.stars += 1;
            Comment.no_of_peo_liked.push(curr._id);
            await Comment.save();

            // Create notification if the current user is not the comment author
            if (Comment.user_name._id.toString() !== curr._id.toString()) {
                const text = `${curr.userName} liked your comment.`;
                await createNotification(text, null, Comment._id, null, Comment.user_name._id);
            }

            return res.status(200).json({
                message: "Liked successfully",
                stars: Comment.stars,
            });
        } else {
            // Unlike the comment
            Comment.stars -= 1;
            await Comment.updateOne({
                $pull: { no_of_peo_liked: curr._id }
            });
            await Comment.save();

            return res.status(200).json({
                message: "Unliked successfully",
                stars: Comment.stars,
            });
        }
    } catch (error) {
        console.log("Error while liking comment", error);
        return next(new ErrorHandler("Internal server error", 500));
    }
});













//get comment of a post
export const getComment_post = asyncHandler(async (req, res, next) => {
    const postId = req.params.postId;

    try {
        if (!postId) {
            return next(new ErrorHandler("Cannot receive post ID", 400));
        }

        // Fetch the post and populate comments along with user details
        const post = await Post.findById(postId).populate({
            path: 'commentla', // Populate the comments
            populate: {
                path: 'user_name', // Assuming user_name references the User model
                select: 'userName display_pic' // Select only userName and display_pic
            }
        });

        res.status(200).json({
            comments: post.commentla.reverse()// Only return the populated comments
        });

    } catch (error) {
        console.log("Getting comments error: ", error);
        return next(new ErrorHandler("Internal server error", 500));
    }
});
