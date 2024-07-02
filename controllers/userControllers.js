import  user  from "../datamodels/userSchema.js";
import sendEmail from "../helpers/sendEmail.js";
import ErrorHandler from "../Utlis/apierror.js";

import asyncHandler from "../Utlis/asyncHandler.js";
import {v2 as cloudinary} from 'cloudinary';

import fs from 'fs'

cloudinary.config({
    cloud_name: 'dwpdxuksp',
    api_key: '611646721796323',
    api_secret: 'ejsJOwHcdFugMNDFy88WXPtPMd8'
})

//function that generate OTP
const generateOTP = ()=>{
    return Math.floor(100000 + Math.random()*900000).toString();
}

//generate and save tokens 
const generateAndsaveTokens = async(user, res)=>{
    try {
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;

        await user.save();


        const accessToken =  await user.generateAccessToken();
        
        res.cookie('accessToken',
            accessToken,{
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                expires: new Date( Date.now() + 15*24*60*60*1000 ),
                path:'/'

            }
        )

        console.log('refreshToken: ', refreshToken);
        console.log('accessToken: ', accessToken);

        return {refreshToken, accessToken};


    } catch (error) {
        console.log('error of token is:', error)
        throw new Error('error in generating tokens')
    }
}





// to send otp for signup
export const otpSendToVerify = asyncHandler( async (req,res, next)=>{
    const { name, email} =  req.body;

    try{
        let existingUser = await user.findOne({email});
        if(existingUser){
            return next(new ErrorHandler('user already exist with this email', 400))
        }

        const otp  = generateOTP();
        const otpexpire = Date.now() + 10*60*1000; 
        

        const tempUser = await new user({
          
          Name: name,
         Email: email,
         OTP: otp,
         OTP_EXPIRE: otpexpire,
         profilePicture:"jhjjhjggj"
        })

        await tempUser.save();
      
        const text = `Your  OTP for signUP in Stage with username: ${tempUser.Name} is: ${otp}`;
        
        await sendEmail({
            email: tempUser.Email,
            subject: 'Stage otp verificationn for sign UP',
            text
        });

        return res.status(200).json({
            success: true,
            message:"OTP has successfully sent to your email"
        })

    }catch(error){
     console.log('error while sending otp is: ', error);
     return next(new ErrorHandler('something went wrong, please try again', 500))
    }

} )


// Verify Otp for signup
export const verifyOtp = asyncHandler(async (req,res,next)=>{
    const {Email, otp } = req.body;
    try {
        const tempUser = await user.findOne({Email: Email});

       if(!tempUser){
        return next(new ErrorHandler('Invalid User'))
       }
       if(tempUser.OTP_EXPIRE < Date.now()){
        return next(new ErrorHandler('invalid otp or timeout', 400));
    }

        const isCorrect = await tempUser.isOTPcorrect(otp)

        if(!isCorrect){
            await tempUser.deleteOne({Email});
            return  res.status(400).json({
                success: false,
                message: 'invalid otp or otp expired, please try again'
            })
           
        }

       
        const User = await new user({
            Name: tempUser.Name,
            Email: tempUser.Email,

        })

        await User.save();
        await tempUser.deleteOne({Email});
        await generateAndsaveTokens(User, res);

        return res.status(201).json({
            success: true,
            message: 'otp is verified'
        })
    } catch (error) {
        console.log('error hhhhhh is: ', error)
        return next(new ErrorHandler('internal server error', 500))
    }
})



//verify otp for login
export const verifyLoginOtp = asyncHandler(async (req,res,next)=>{
    const {Email, otp } = req.body;
    try {
        const User = await user.findOne({Email});

        if(!User){
            return next(new ErrorHandler('user not found', 404));
        }

        if(User.OTP_EXPIRE < Date.now()){
            return next(new ErrorHandler('invalid otp or timeout', 400));
        }

        const isCorrect = await User.isOTPcorrect(otp)

        if(!isCorrect){
            return  res.status(400).json({
                success: false,
                message: 'invalid otp or otp expired'
            })
        }

        const alp = User.profilePicture;
        console.log('profile pic is :', alp);
        await generateAndsaveTokens(User, res);

        return res.status(201).json({
            success: true,
            message: 'otp is verified',
            User,
            alp
        })
    } catch (error) {
        console.log('error is: ', error)
        return next(new ErrorHandler('internal server error', 500))
    }
})


//Get unique name 
 export const getUnique = asyncHandler( async(req, res, next)=>{

    try{
    const { username } = req.body;

    const isAvialable = await user.findOne({userName: username});

    if(isAvialable){
        return res.status(400).json({
            success: false,
            message: 'this username already exists'
        })
    }
     const {_id} = await req.user;

    const User = await user.findById(_id);

    if(!User){
   return next( new ErrorHandler('please login to acccess this resource', 402))
        }

        User.userName = username;
        await User.save();
return res.status(200).json({
    success: true,
    User
})

    }catch(error){
        console.log('your error is: ', error)
return next(new ErrorHandler('internal server error', 500))
    }



    
})




//Login user 
export const loginOtp = asyncHandler( async(req,res,next)=>{

    const {Email} = req.body;
    try {
        const otp  = generateOTP();
        const otpexpire = Date.now() + 5*60*1000; 

const User = await user.findOne({Email})

if(!User){
    return next(new ErrorHandler('user not found with this email id', 400))
}


  if(User){
    console.log('user found', User)
     User.OTP_EXPIRE = otpexpire;
     User.OTP = otp;
     
     await User.save()  ; 
  }else{
    return next(new ErrorHandler('user not found with this email', 404))
  }
        const text = `Your  OTP for Login in Stage with username: ${User.userName} is: ${otp}`;
        
        await sendEmail({
            email: User.Email,
            subject: 'Stage otp verificationn for sign UP',
            text
        });

        res.status(200).json({
            success: true,
            message: 'otp has been sent in your email'
        })

    } catch (error) {
        console.log('loginotp error: ', error)
        return next(new ErrorHandler('internal server error', 500))
    }
    
})




//togetuserDetails---- auth middleware apply here
export const getUserDetails = asyncHandler( async(req,res,next)=>{
   try{ 
const {_id} = req.user;


const User = await user.findById(_id);
if(!user){
    return next(new ErrorHandler("user not found", 400
    ))
}
    res.status(200).json({
        success:true,
        
        User
    })

}catch(error){
    console.log("error is : ", error)
    return next(new ErrorHandler('internal SERver error', 500))
}
})

//LogOut user by doing token null
export const logout = asyncHandler( async(req,res,next)=>{
try{
 
    const curr = req.user;

    if(!curr){
        return next(new ErrorHandler('user invalid', 400));
    }

    res.cookie('accessToken', null,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expireSIn: new Date(0),
        path:'/'
    })

    res.clearCookie('ascessToken',{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expireSIn: new Date(0),
        path:'/'

    })

if(curr){
    curr.refreshToken = null;
}

await curr.save();

    res.status(200).json({
        success: true,
        message: 'user logged out successfully'
    })
}catch(error){
    console.log('error is : ', error)
    return next(new ErrorHandler('logout failed', 500))
}
})

//uploadProfile picture
export const setProfile = asyncHandler( async(req,res,next)=>{
    try {
        console.log("reqq.file is : ", req.file);

        if(!req.file ){
        
        return res.status(400).json({
            message: 'no files have been uploaded'
        })
    }
    
     const filep = req.file.path;
     console.log('file is : ', filep)   
        const result = await cloudinary.uploader.upload(filep) ;
        //fs.unlinkSync(filep);
        const curr = req.user;
console.log('profile uploaded: ', result);

curr.display_pic = result.secure_url;
await curr.save();

return res.status(200).json({
    success: true,
    message: 'profile uploaded successfully',
    curr
})


    } catch (error) {
        console.log("error in uploading", error);
        return next(new ErrorHandler('something went wrong, please try again later', 500))
    }
})




//edit profile function === for objects
export const editobj = asyncHandler(async(req,res,next)=>{
    const usser = req.user;
    if(!usser){
        return next(new ErrorHandler('please login to access this resource', 400));
    }
    const updates = Object.keys(req.body);
    try{
        updates.forEach(update=>{usser[update] = req.body[update]})
        await usser.save();

         res.status(200).json({
usser
        })
    }catch(error){
        console.log('yur erorrr is: ', error);
        return next(new ErrorHandler('server error', 500));
    }
   
})


// edit profile function==== for Array
export const editProfile = asyncHandler(async(req,res,next)=>{
    const Usser = req.user;

    if(!Usser){
        return next(new ErrorHandler('please login to access this resource', 400));
    }

    const allowedUpdates = [ 'profession', 'education', 'skills', 'projects', 'achievments', 'experience' ];

    const updates = Object.keys(req.body);

    const isValidUpdate = updates.every(update=>allowedUpdates.includes(update));

    if(!isValidUpdate){
        return next(new ErrorHandler('invalid updates', 400))
    }

 try {
    updates.forEach(update=>{
        if(update === 'Name'|| update === 'bio'|| update === "profession" || update === "education" || update ==="skills"|| update ==="projects"|| update === "achievments"|| update ==="country"|| update=== "experience"){
if(Array.isArray(req.body[update])){
    req.body[update].forEach(item=>{
        if(!Usser[update].includes(item)){
            Usser[update].push(item)
        }
    })
}else{
    Usser[update]  = [...Usser[update], req.body[update]]
}

    }

    })

    await Usser.save();

    return res.status(200).json({
        success: true,
        Usser
    })
 } catch (error) {
    console.log('your erorrr is: ', error);
    return next(new ErrorHandler('server error', 500));
 }
})