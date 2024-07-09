import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user_name:{
        type: mongoose.Types.ObjectId,
        ref:'User',
        required: true
    },
    image:[{
        type: String
    }],
    category:[{
        type: String,
        required: true
    }],
    caption:{
        type: String,
        required: true
    },
    stars:{
        type: Number,
        default:0
    },
    no_peo_liked:[{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    links:[{
     type: String
    }],
    commentla:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }],

     
},
{
    timestamps: true
});

const Post = mongoose.model('post', postSchema);
export default Post;