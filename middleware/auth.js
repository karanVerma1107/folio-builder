import  jwt  from "jsonwebtoken";
import user from '../datamodels/userSchema.js'
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";



const verifyAccess =  async (token) =>{
    try {

        if(!token){
            throw new ErrorHandler('loggin to access this resource', 401);
        }

       const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET );
       
if(!decodedData || decodedData === undefined){
    throw new ErrorHandler('user not found, login to access this resource', 401)
}

       const User = await user.findById(decodedData._id);

       if(!User || User == undefined){
throw new ErrorHandler('user not found', 401)
       }

       return { User, decodedData };
    } catch (error) {
        console.log('ultimate error: ', error)
    
     throw new ErrorHandler('invalidToken', 402)
    }
}



export const isAuthenticatedUser = asyncHandler(async(req,res,next)=>{
    const  token  = req.cookies.accessToken;


    
   try {
    const { User, decodedData} = await verifyAccess(token);
      

if(!User || !decodedData || User == undefined){
    return next(new ErrorHandler('login to access this resource', 400));
}

    req.user =  User;

console.log("decoded data : ", decodedData)
    req.tokenData = decodedData;
    next();
   } catch (error) {
    console.log('auth error is', error);

    


    return next(new ErrorHandler('unnauthorized', 400))
   }
})

