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
            res.status(200).json({
                message:"post made successfully",
                newPost
            })
        }
        
    } catch (error) {
        console.log("post error is : ", error);
        return next( new ErrorHandler('internal server error', 500))
    }
})