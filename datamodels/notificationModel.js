import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    message:{
        type: String,
        required: true
    },
    postid:{
        type: mongoose.Schema.ObjectId,
        ref:"post"
    },
    commentid:{
        type:mongoose.Schema.ObjectId,
        ref:"Comment"
    },
    replyid:{
        type:mongoose.Schema.ObjectId,
        ref:"reply"
    },
    userid:{
      type:mongoose.Schema.ObjectId,
      ref:"User"
    },
    isRead:{
   type: Boolean,
   default: false
    },
    expiryAt:{
        type: Date,
        required: true
    }
});


const Notification = mongoose.model("notification", notificationSchema);
export default Notification;