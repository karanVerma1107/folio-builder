import user from "../datamodels/userSchema.js";
import comment from "../datamodels/commentmodel.js";
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";
import Reply from "../datamodels/replyModel.js";
import Notification from "../datamodels/notificationModel.js";
import { createNotification } from "./notificationcontrollers.js";
//make  a reply




export const make_reply_to_comment = async (req, res, next) => {
    
    const { content } = req.body;
    const { id } = req.params; // This can be either a comment ID or a reply ID
    const currUser = req.user; // Current user making the reply
    const currUserId = currUser._id;

    try {
        let commentId; // To hold the associated comment ID for notifications
  
        // Check if the provided ID is a reply or a comment
        const existingReply = await Reply.findById(id);
        if (existingReply) {
            // If it's a reply, get the associated comment ID
            commentId = existingReply.commentw;
        } else {
            // If it's a comment, use the provided ID directly
            commentId = id;
        }

        // Create a new reply
        const newReply = new Reply({
            user_name: currUserId, // Reference to user._id
            commentw: commentId, // Associate with the comment
            content
        });

        await newReply.save();

        // Update the comment with the new reply
        await comment.findByIdAndUpdate(commentId, {
            $push: { replies: newReply._id }
        });

        // Notify the original comment owner
        const commentOwner = await comment.findById(commentId).select('user_name');
        if (commentOwner.user_name.toString() !== currUserId.toString()) {
            const notification = new Notification({
                message: `${currUser.userName} replied to your comment.`,
                userId: commentOwner.user_name,
                replyId: newReply._id,
                expiryAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
            });

            await notification.save();

            // Push the notification to the comment owner's notifications array
            const ownerUser = await user.findById(commentOwner.user_name);
            ownerUser.notifications.push(notification._id);
            await ownerUser.save();
        }

        // Notify the owner of the original reply if the reply is to a reply
        if (existingReply) {
            const replyOwner = existingReply.user_name;
            if (replyOwner.toString() !== currUserId.toString()) {
                const replyNotification = new Notification({
                    message: `${currUser.userName} replied to your reply.`,
                    userId: replyOwner,
                    replyId: newReply._id,
                    expiryAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
                });

                await replyNotification.save();

                // Push the notification to the reply owner's notifications array
                const replyOwnerUser = await user.findById(replyOwner);
                replyOwnerUser.notifications.push(replyNotification._id);
                await replyOwnerUser.save();
            }
        }

        res.status(201).json({
            message: "Reply added successfully",
            newReply
        });
    } catch (error) {
        console.log("Reply error:", error);
        return next(new ErrorHandler('Internal server error', 500));
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