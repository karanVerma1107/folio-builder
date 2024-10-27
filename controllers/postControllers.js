import asyncHandler from "../Utlis/asyncHandler.js";
import user from "../datamodels/userSchema.js";
import {v2 as cloudinary} from 'cloudinary';
import Post from "../datamodels/postmodel.js";
import Notification from "../datamodels/notificationModel.js";
import fs from 'fs';
import ErrorHandler from "../Utlis/apierror.js";

cloudinary.config({
    cloud_name: "dwpdxuksp",
    api_key: "611646721796323",
    api_secret: "ejsJOwHcdFugMNDFy88WXPtPMd8"
});








{/*
//make a post new
export const makePost = asyncHandler(async (req, res, next) => {
    try {
        const Files = req.files;
        const curr = req.user;
        const currID = curr._id;
        const { Category, Caption, Links } = req.body;

        console.log('files are: ', Files)

        // Initialize links to an empty array if not provided
       
        const linksArray = Links ? (Array.isArray(Links) ? Links : [Links]) : []; 

        const newPost = new Post({
            user_name: currID,
            category: Category,
            caption: Caption,
            links: linksArray // Set links to the provided links or empty array
        });

        // Handle file uploads if files are present
        if (Files) {
            // Upload files to Cloudinary
           // const uploadPromises = Files.map(file => cloudinary.uploader.upload(file.path));


           const uploadPromises = Files.map(file => {
            const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'video';
            return cloudinary.uploader.upload(file.path, { resource_type: resourceType });
        });

        // Wait for all uploads to complete
        const uploadResults = await Promise.all(uploadPromises);
        const MediaUrls = uploadResults.map(result => result.secure_url);

        // Store all URLs in the image field
        newPost.image = MediaUrls;


           // const uploadResults = await Promise.all(uploadPromises);
           // const ImageUrls = uploadResults.map(result => result.secure_url);

           // newPost.image = ImageUrls;

            Files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.log(`Failed to delete file: ${file.path}`, err);
                    } else {
                        console.log("File deleted from local server");
                    }
                });
            });
        }

        await newPost.save();
        const visat = newPost._id;

        console.log('req.body for post add is: ', req.body);

        if (curr) {
            curr.posts.push(visat);
            await curr.save();
        }

        res.status(200).json({
            message: "Post made successfully",
            newPost
        });

    } catch (error) {
        console.log("Post error is:", error);
        return next(new ErrorHandler('Internal server error', 500));
    }
});





*/}










// Make a post new
export const makePost = asyncHandler(async (req, res, next) => {
    try {
        const Files = req.files;
        const curr = req.user;
        const currID = curr._id;
        const { Category, Caption, Links } = req.body;

        console.log('files are: ', Files);

        // Initialize links to an empty array if not provided
        const linksArray = Links ? (Array.isArray(Links) ? Links : [Links]) : []; 

        const newPost = new Post({
            user_name: currID,
            category: Category,
            caption: Caption,
            links: linksArray // Set links to the provided links or empty array
        });

        // Check for mentions in the Caption
        const mentionRegex = /\/(\w+)/g; // Regex to match /username format
        const mentions = Caption.match(mentionRegex); // Find all mentions
        const mentionedUserIds = []; // To store IDs of mentioned users

        if (mentions) {
            for (const mention of mentions) {
                const username = mention.slice(1); // Remove the leading slash
                const mentionedUser = await user.findOne({ userName: username });
                
                if (mentionedUser) {
                    mentionedUserIds.push(mentionedUser._id);

                    // Create a notification for the mentioned user
                    const notification = new Notification({
                        message: `${curr.userName} mentioned you in a post: ${Caption}`,
                        userid: mentionedUser._id,
                        postid: newPost._id,
                        expiryAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
                    });

                    await notification.save();

                    // Push the notification to the mentioned user's notifications array
                    mentionedUser.notifications.push(notification._id);
                    await mentionedUser.save(); // Save the updated user document
                }
            }
        }

        // Handle file uploads if files are present
        if (Files) {
            const uploadPromises = Files.map(file => {
                const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'video';
                return cloudinary.uploader.upload(file.path, { resource_type: resourceType });
            });

            const uploadResults = await Promise.all(uploadPromises);
            const MediaUrls = uploadResults.map(result => result.secure_url);

            // Store all URLs in the image field
            newPost.image = MediaUrls;

            Files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.log(`Failed to delete file: ${file.path}`, err);
                    } else {
                        console.log("File deleted from local server");
                    }
                });
            });
        }

        await newPost.save();
        const visat = newPost._id;

        console.log('req.body for post add is: ', req.body);

        if (curr) {
            curr.posts.push(visat);
            await curr.save();
        }

        res.status(200).json({
            message: "Post made successfully",
            newPost
        });

    } catch (error) {
        console.log("Post error is:", error);
        return next(new ErrorHandler('Internal server error', 500));
    }
});












//give post a like 
export const likepost = asyncHandler(async(req,res,next)=>{
    const postID = req.params.postID;
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
console.log('user id is: ', post.user_name);
        const nameid = post.user_name;
        const User = await user.findById(nameid);
        
    

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
            
            return res.status(200).json({
                message:`unliked ${User.userName}'s post`,
                
            })
        }
      

        const userid = post.user_name;
        console.log('userid is: ', userid)
        
        
 const text = `${curr.userName} liked your post.`;
const newNotification = await new Notification({
   message: text,
   postid: post._id,
   expiryAt: new Date(Date.now() + 5*24*60*60*1000)       
});

await newNotification.save();

await User.notifications.push(newNotification._id);
await  User.save();





    console.log(`you liked ${User.userName}'s post`);
        res.status(200).json({
        message: `you liked ${User.userName}'s post` ,
        
        })

    }catch (error) {
        console.log("error while liking the post is", error);
        return next(new ErrorHandler("internal server error", 500)
        )
    }
})

//get followers post 
export const getFollowerPost = asyncHandler(async(req,res,next)=>{
    const curr = req.user;

    try {
        if(!curr){
            return next(new ErrorHandler("loggin to access this resource", 400));
        }


        //legend line
        const followerPosts = await Post.find({user_name: {$in: curr.followers}}).populate("user_name").populate("commentla");

        
        

        if(followerPosts.length == 0){
            return next(new ErrorHandler("there is no post to show, kindly explore other posts", 400));
        }
       
        res.status(200).json({
           posts: followerPosts
        })

    } catch (error) {
        console.log("error while getting followers post is : ", error);
        return next(new ErrorHandler("internal server error", 500))
    }
})


//get all posts 
export const getAllposts = asyncHandler(async(req,res,next)=>{

    const post = await Post.find().populate("user_name", "display_pic userName").populate("commentla").populate("no_peo_liked","display_pic userName" )
         

    if(post.length == 0){
        return next(new ErrorHandler("be the first one to upload in this app", 400));
    }

    const posts = post.reverse();

    res.status(200).json({
        posts
    })
})












export const deletepost =  async (req, res, next) => {
    const curr = req.user; // Get the currently authenticated user
    const userId = curr._id; // Extract user ID
    const postId = req.params.postId; // Get post ID from request parameters

    try {
        // Find the post by ID
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user ID matches the user_name of the post
        if (!post.user_name.equals(userId)) {
            return res.status(403).json({ error: 'You are not authorized to delete this post' });
        }

        // Delete the post from the Post collection
        await Post.findByIdAndDelete(postId);

        // Remove the post reference from the user's posts array
        await user.findByIdAndUpdate(
            userId,
            { $pull: { posts: postId } },
            { new: true }
        );

        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
