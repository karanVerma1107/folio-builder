import { user } from "../datamodels/userSchema.js";
import sendEmail from "../helpers/sendEmail.js";
import sendToken from "../helpers/jwtToken.js";


//function that generate OTP
const generateOTP = ()=>{
    return Math.floor(100000 + Math.random()*900000).toString();
}

export const otpSendToVerify = async (req,res)=>{
    const {username, name, email} =  req.body;

    try{
        let existingUser = await user.findOne({email});
        if(existingUser){
            return res.status(400).json({
                message: 'user already exist with this email'
            })
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
     return res.status(500).json({
        success: false,
        message: 'failed to send OTP, please try again'
     })
    }

} 