import asyncHandler from "../Utlis/asyncHandler.js";
import user from "../datamodels/userSchema.js";
import {v2 as cloudinary} from 'cloudinary';
import Post from "../datamodels/postmodel.js";

import fs from 'fs'
import ErrorHandler from "../Utlis/apierror.js";

cloudinary.config({
    cloud_name: "dwpdxuksp",
    api_key: "611646721796323",
    api_secret: "ejsJOwHcdFugMNDFy88WXPtPMd8"
});





//make a post...
export const makePost = asyncHandler(async(req,res,next)=>{
    try {
        const Files = req.files;
        if(Files){
           const curr = req.user;
           const name = curr.userName;
           const {Category, Caption} = req.body;
           const newPost = await new Post({
            user_name: name,
            category: Category,
            caption: Caption
           });

         //upload files to cloudinary
         const uploadpromises = Files.map(file=>cloudinary.uploader.upload(file.path));

         const uploadresults = await Promise.all(uploadpromises);

         const ImageUrls = uploadresults.map(result => result.secure_url);

        newPost.image = ImageUrls;


        await newPost.save();
        
        const visat = newPost._id;

        if(curr){
            curr.posts.push(visat);
            await curr.save();
        }


        Files.forEach(file => {
            fs.unlink(file.path, (err)=>{
                if(err){
                    console.log(`fail to delete file: ${file.path}`, err)
                }else{
                    console.log("file deleted from local server")
                }
            })
        });

        res.status(200).json({
            message:"post made successfully",
            newPost
        })

        }else{
            const curr = req.user;
            const name = curr.userName;
            const {Category, Caption} = req.body;
            const newPost = await new Post({
             user_name: name,
             category: Category,
             caption: Caption
            });
            await newPost.save();


            const visat = newPost._id;

            if(curr){
                curr.posts.push(visat);
                await curr.save();
            }

            res.status(200).json({
                message:"post made successfully",
                newPost
            })
        }
        
    } catch (error) {
        console.log("post error is : ", error);
        return next( new ErrorHandler('internal server error', 500))
    }
});


//give post a like 
export const likepost = asyncHandler(async(req,res,next)=>{
    const postID = req.body.postID;
    const curr = req.user;
    try {
        const post = await Post.findById(postID);

        if(!post){
            return next(new ErrorHandler("post is deleted", 401));
        }
        if(!curr){
            return next(new ErrorHandler("cannot process it now, please login to acccess this resource", 400))
        }
        const currID = curr._id

        const name = post.user_name;

    

        if(!post.no_peo_liked.includes(currID)){
          post.stars = post.stars + 1;
          await post.no_peo_liked.push(currID)
          await post.save();
        }else{
            post.stars = post.stars - 1;
            await post.updateOne({
                $pull: {no_peo_liked: currID}
            })
            await post.save();
            const total = post.stars;
            return res.status(200).json({
                message:`unliked ${name}'s post`,
                total
            })
        }

        const totalLikes = post.stars;
        res.status(200).json({
        message: `you liked ${name}'s post` ,
        totalLikes
        })

    }catch (error) {
        console.log("error while liking the post is", error);
        return next(new ErrorHandler("internal server error", 500)
        )
    }
})