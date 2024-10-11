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





{/*//make a pssss.
export const makePost = asyncHandler(async(req,res,next)=>{
    try {
        const Files = req.files;
        if(Files){
           const curr = req.user;
           const currID = curr._id;
           const {Category, Caption} = req.body;
           const newPost = await new Post({
            user_name: currID,
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
            const currID = curr._id;
            const {Category, Caption} = req.body;
            const newPost = await new Post({
             user_name: currID,
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

*/}





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

    const posts = await Post.find().populate("user_name", "display_pic userName").populate("commentla").populate("no_peo_liked","display_pic userName" )
         

    if(posts.length == 0){
        return next(new ErrorHandler("be the first one to upload in this app", 400));
    }

    res.status(200).json({
        posts
    })
})