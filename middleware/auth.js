import  jwt  from "jsonwebtoken";
import user from '../datamodels/userSchema.js'
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";



const verifyAccess = async (token) =>{
    try {
       const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET );
       
       const User = await user.findById(decodedData._id);

       if(!User){
return next(new ErrorHandler('user not found', 400))
       }

       return {User, decodedData}
    } catch (error) {
     return next(new ErrorHandler('invalidToken', 402))
    }
}

export const isAuthenticatedUser = asyncHandler(async(req,res,next)=>{
    const  token  = req.cookies.accessToken;
    
   try {
    const {User, decodedData} = await verifyAccess(token);

    req.user = User;
console.log("decoded data : ", decodedData)
    req.tokenData = decodedData;
    next();
   } catch (error) {
    return next(new ErrorHandler('unnauthorized', 400))
   }
})

