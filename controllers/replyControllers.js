import user from "../datamodels/userSchema.js";
import comment from "../datamodels/commentmodel.js";
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";
import Reply from "../datamodels/replyModel.js";
import Notification from "../datamodels/notificationModel.js";
import { createNotification } from "./notificationcontrollers.js";
//make  a reply
{/*export const make_reply_to_comment = asyncHandler(async(req,res,next)=>{
    const curr = req.user;
    const commentId = req.params.commentId;
    try {
          console.log('runned')


        if(!curr){
            return next(new ErrorHandler("please login to access this resource", 400));
        }
        if(!commentId){
            return next(new ErrorHandler("invalid comment no Id passesd", 400));
        }

        const Comment = await comment.findById(commentId);
        if(!Comment){
            return next(new ErrorHandler("invalid comment", 400));

        }
        const comId = Comment._id;
        const Content = req.body.Content;
        const CurrId = curr._id;

        const reply = await new Reply({
            user_name:CurrId,
            commentw:comId,
            content:Content
        });
       await Comment.replies.push(reply._id)

        await reply.save();
await Comment.save();


const text = `${curr.userName} replied to your comment.`;
const replyid = reply._id
const newNotification = await new Notification({
   message: text,
   replyid: replyid,
   expiryAt: new Date(Date.now() + 5*24*60*60*1000)       
});

await newNotification.save();

const userid = Comment.user_name;
const User = await user.findById(userid);

await User.notifications.push(newNotification._id);
await User.save();

        res.status(200).json({
            message:"replied successfully",
            reply
        })
    } catch (error) {
        console.log("error while makinf reply to a comment is: ", error);
        return next(new ErrorHandler("internal server error", 500));
    }
});
*/}





export const make_reply_to_comment = async (req, res) => {
    const { commentId, content, replyToId } = req.body;

    try {
        const Comment = await comment.findById(commentId);
        if (!Comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const replyContent = replyToId
            ? `@${replyToId.username} ${content}` // Format for reply
            : `@${Comment.user_name.userName} ${content}`; // Format for main comment

        const reply = new Reply({
            user_name: req.user.id,
            commentw: commentId,
            content: replyContent,
        });

        await reply.save();
        Comment.replies.push(reply._id);
        await Comment.save();

        // Create notification for the original comment's author
        const originalCommentUserId = comment.user_name; // Assuming this is the user who made the original comment
        await createNotification(
            `${req.user.userName} replied to your comment`,
            Comment.post,
            Comment._id,
            reply._id,
            originalCommentUserId
        );

        return res.status(200).json({ message: "Reply added", reply });
    } catch (error) {
        console.log('error is :' , error);
        return res.status(500).json({ message: "Server error", error });
    }
};



























//make a reply to reply
export const reply_to_a_reply = asyncHandler(async(req, res,next)=>{
    const curr = req.user;
    const replyId = req.params.replyId;
    try {
        if(!curr){
            return next(new ErrorHandler("please loggin to access this resource", 400));
        }
        if(!replyId){
            return next(new ErrorHandler("not able to get reply id", 400));
        }

        const rep = await Reply.findById(replyId);
        if(!rep){
            return next(new ErrorHandler("request failed because of invalid reply", 400));
        }
        const comId = rep.commentw;
      const CurId = curr._id;

      const Content = req.body.Content;

        const reply = await new Reply({
          user_name: CurId,
          commentw: comId,
          content: Content

        });

        
rep.replies.push(reply._id);
        await reply.save();
await rep.save();

const text = `${curr.userName} replied to you.`;
const currid = reply._id
const newNotification = await new Notification({
   message: text,
   replyid : currid,
   expiryAt: new Date(Date.now() + 5*24*60*60*1000)       
});

await newNotification.save();

const userid = rep.user_name;
const User = await user.findById(userid);

await User.notifications.push(newNotification._id);
await User.save();


        res.status(200).json({
            message:"replied successfully",
            reply
        })
    
    } catch (error) {
        console.log("error while makinf reply to a reply is: ", error);
        return next(new ErrorHandler("internal server error", 500));
    }
});



//get replies of comment
export const getreplyComment = asyncHandler(async (req, res, next) => {
    const commentId = req.params.commentId;
    try {
        if (!commentId) {
            return next(new ErrorHandler("Cannot get comment", 400));
        }

        const Comment = await comment.findById(commentId);
        if (!Comment) {
            return next(new ErrorHandler("Comment not found", 404));
        }

        const populatedReplies = await Promise.all(Comment.replies.map(async (replyId) => {
            const reply = await Reply.findById(replyId).populate('user_name', 'userName display_pic');
            return reply ? reply : null; // Return null if reply is not found
        }));

        // Filter out null values (replies not found)
        const filteredReplies = populatedReplies.filter(reply => reply !== null);

        res.status(200).json({
            replies: filteredReplies
        });
    } catch (error) {
        console.log("Error while getting replies:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});



//get reply reply
export const replyreplyget = asyncHandler(async(req,res,next)=>{
    const replyId = req.params.replyId;
try {

    console.log("reply id is: ", replyId)
    if(!replyId){
        return next(new ErrorHandler("not reply id", 400));
    }

    const reply = await Reply.findById(replyId).populate("replies");

    const populatedreplies = await Promise.all(reply.replies.map(async(con)=>{
        const populated = await Reply.findById(con._id);
return populated;
    }))

reply.replies = populatedreplies;

res.status(200).json({
    replies: reply.replies
})
} catch (error) {
    console.log("error while getting reply reply", error);
    return next(new ErrorHandler("internal server error", 500));
}
});



//like a reply
export const  likereply = asyncHandler(async(req,res,next)=>{
    const curr = req.user;
    const repyId = req.params.replyId;
    try {
        if(!curr){
            return next(new ErrorHandler("please login to access this resource", 400));
        }

        if(!repyId){
            return next(new ErrorHandler("cannot get reply id", 400));
        }

        const reply = await Reply.findById(repyId);
        if(!reply){
            return next(new ErrorHandler("cannot get reply", 400));
        }

        const currid = curr._id;

        if(!reply.no_of_peo_liked.includes(currid)){
            reply.stars = reply.stars + 1;
            reply.no_of_peo_liked.push(currid);
        }else{
            reply.stars = reply.stars - 1;
            await reply.updateOne({
                $pull: {no_of_peo_liked: currid}
            });

            await reply.save();
            const al = reply.stars;
        
          return  res.status(200).json({
               message:"unliked successfully",
               al:al
            })
        }
        
        await reply.save();



        const text = `${curr.userName} liked your reply.`;
        const replyid = reply._id;
        const newNotification = await new Notification({
           message: text,
           replyid: replyid,
           expiryAt: new Date(Date.now() + 5*24*60*60*1000)       
        });
        
        await newNotification.save();
         
        const userid =  reply.user_name;
        const User = await user.findById(userid);

        await User.notifications.push(newNotification._id);
        await User.save();


        const al = reply.stars;

        res.status(200).json({
            message:"liked successfully",
            al: al
        })

        
    } catch (error) {
        console.log("error while liking the posts: ", error);
        return next(new ErrorHandler("internal server error", 500));
    }
});