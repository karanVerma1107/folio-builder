import  user  from "../datamodels/userSchema.js";
import sendEmail from "../helpers/sendEmail.js";
import ErrorHandler from "../Utlis/apierror.js";

import asyncHandler from "../Utlis/asyncHandler.js";


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
                secure: process.env.NODE_ENV === 'production'

            }
        )

        console.log('refreshToken: ', refreshToken);
        console.log('accessToken: ', accessToken);

        return {refreshToken, accessToken};


    } catch (error) {
        throw new Error('error in generating tokens')
    }
}





// to send otp
export const otpSendToVerify = asyncHandler( async (req,res, next)=>{
    const {username, name, email} =  req.body;

    try{
        let existingUser = await user.findOne({email});
        if(existingUser){
            return next(new ErrorHandler('user already exist with this email', 400))
        }

        const otp  = generateOTP();
        const otpexpire = Date.now() + 5*60*1000; 
        

        const tempUser = new user({
          userName: username,
          Name: name,
         Email: email,
         OTP: otp,
         OTP_EXPIRE: otpexpire
        })

        await tempUser.save();
      
        const text = `Your  OTP for signUP in Stage with username: ${tempUser.userName} is: ${otp}`;
        
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

export const verifyOtp = asyncHandler(async (req,res,next)=>{
    const {Email, otp } = req.body;
    try {
        const User = await user.findOne({Email});

        if(!User){
            return next(new ErrorHandler('user not found', 404));
        }

        if(!User.isOTPcorrect(otp)){
            return next( new ErrorHandler('Invalid OTP or otp expired ', 400))
        }

        await generateAndsaveTokens(User, res);

        return res.status(201).json({
            success: true,
            User
        })
    } catch (error) {
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