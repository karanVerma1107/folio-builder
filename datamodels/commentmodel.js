import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user_name:{
        type: mongoose.Schema.ObjectId, 
        ref: 'User',
        required: true
    },
    post:{
        type: mongoose.Schema.ObjectId,
        ref: 'post',
        required: true
    },
    content:{
        type: String,
    },
    replies:[{
   type: mongoose.Schema.ObjectId,
   ref:"reply"
    }],
    stars:{
        type: Number,
        default:0
    },
    no_of_peo_liked:[{
        type: mongoose.Schema.ObjectId,
        ref:"User"
    }]



})

const comment = mongoose.model("Comment", commentSchema);
export default comment;