import mongoose from "mongoose";

const repliesModel = new mongoose.Schema({
    user_name:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required: true
    },
    commentw: {
        type: mongoose.Schema.ObjectId,
        ref:"Comment",
        required: true
    },
    content:{
        type:String,
        required: true
    },
    replies:[{
        type: mongoose.Schema.ObjectId,
        ref:"reply"
    }],
    stars:{
        type:Number,
        default: 0
    },
    no_of_peo_liked:[{
        type: mongoose.Schema.ObjectId,
        ref:"User"
    }]
})


const Reply = mongoose.model("reply", repliesModel);
export default Reply;