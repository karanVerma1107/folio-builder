import Notification from "../datamodels/notificationModel.js";
import Post from "../datamodels/postmodel.js";
import ErrorHandler from "../Utlis/apierror.js";
import comment from "../datamodels/commentmodel.js";
import user from "../datamodels/userSchema.js";
import asyncHandler from "../Utlis/asyncHandler.js";
import Reply from "../datamodels/replyModel.js";

export const getNotification = asyncHandler(async(req,res,next)=>{
const notificationId = req.params.notificationId;
try {
    if(!notificationId){
        return next(new ErrorHandler("cannot get notification id", 400));
    };

    const notification = await  Notification.findById(notificationId);

    let result = null;

    if(notification.postid){
        result = await Post.findById(notification.postid).populate("user_name").exec();
    }else if(notification.commentid){
        result = await comment.findById(notification.commentid).populate("user_name").exec(); 
    }else if(notification.replyid){
        result = await Reply.findById(notification.replyid).populate("user_name").populate("commentw").exec();
    }else if(notification.userid){
        result =  await user.findById(notification.userid).exec();
    }

    if(!result){
        await notification.updateOne({
            isRead: true
        });
        
        res.status(200).json({
            message:"cannot proccess this request"
        })
    }

    await notification.updateOne({
        isRead: true
    });

    await notification.save();


res.status(200).json({
    result
})

} catch (error) {
    console.log("error in notification is: ", error);
    return next(new ErrorHandler("internal server error", 500));
}

});