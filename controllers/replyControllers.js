import user from "../datamodels/userSchema.js";
import comment from "../datamodels/commentmodel.js";
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";
import Reply from "../datamodels/replyModel.js";

//make  a reply
export const make_reply_to_comment = asyncHandler(async(req,res,next)=>{
    const curr = req.user;
    const commentId = req.params.commentId;
    try {
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
        res.status(200).json({
            message:"replied successfully",
            reply
        })
    } catch (error) {
        console.log("error while makinf reply to a comment is: ", error);
        return next(new ErrorHandler("internal server error", 500));
    }
});

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
export const getreplyComment = asyncHandler(async(req,res,next)=>{
    const commentId = req.params.commentId;
    try {
        if(!commentId){
            return next(new ErrorHandler("cannot get comment", 400))
        }

        const Comment = await comment.findById(commentId).populate("replies");

       const populatedreplies = await Promise.all(Comment.replies.map(async(con)=>{
        const populated = await Reply.findById(con._id);
        return populated
       }))


        Comment.replies = populatedreplies;
        res.status(200).json({
            replies: Comment.replies
        })
    } catch (error) {
        console.log("error while getting replies", error);
        res.status(500).json({
            message:"internal server error"
        })
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