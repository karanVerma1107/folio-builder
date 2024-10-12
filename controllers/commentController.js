import user from "../datamodels/userSchema.js";
import Post from "../datamodels/postmodel.js";
import comment from "../datamodels/commentmodel.js";
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";
import Notification from "../datamodels/notificationModel.js";

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


//like any comment 
export const likeComment = asyncHandler(async(req,res,next)=>{
    const curr = req.user;
    const  commentId = req.params.commentId;
    try {
        if(!curr){
            return next(new ErrorHandler("kindly login to access this resource", 400));
        }

    if(!commentId){
        return next(new ErrorHandler("invalid comment", 400));
    }
        const Comment = await comment.findById(commentId).populate("user_name").populate("stars").populate("replies");


if(!Comment.no_of_peo_liked.includes(curr._id)){
 Comment.stars = Comment.stars + 1;
   await  Comment.no_of_peo_liked.push(curr._id);
    await Comment.save();
}else{
  Comment.stars = Comment.stars -1;
  await Comment.updateOne({
    $pull: {no_of_peo_liked: curr._id}
  })
await Comment.save();

const text = `${curr.userName} liked your comment .`;
const Commentid = Comment._id;
const newNotification = await new Notification({
   message: text,
   commentid: Commentid,
   expiryAt: new Date(Date.now() + 5*24*60*60*1000)       
});

await newNotification.save();

const userid = Comment.user_name;
const User = await user.findById(userid);

await User.notifications.push(newNotification);
await User.save();




const al = Comment.stars;
return res.status(200).json({
    message:"unliked successfully",
    al
})
}

const ul = Comment.stars;
res.status(200).json({
    message:"liked successfully",
    ul
})
}catch (error) {
      console.log("error while liking comment", error);
      return next(new ErrorHandler("internal server error", 500));  
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
