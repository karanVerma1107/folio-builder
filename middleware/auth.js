import  jwt  from "jsonwebtoken";
import user from '../datamodels/userSchema.js'
import asyncHandler from "../Utlis/asyncHandler.js";
import ErrorHandler from "../Utlis/apierror.js";



const verifyAccess = asyncHandler( async (token, next) =>{
    try {

        if(!token){
            return next(new ErrorHandler('loggin to access this resource', 401));
        }

       const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET );
       
if(!decodedData || decodedData == undefined){
    return next(new ErrorHandler('user not found, login to access this resource', 401))
}

       const User = await user.findById(decodedData._id);

       if(!User || User == undefined){
return next(new ErrorHandler('user not found', 401))
       }

       return {User, decodedData}
    } catch (error) {
        console.log('ultimate error: ', error)
        if(error instanceof jwt.JsonWebTokenError){
            return next(new ErrorHandler('kindly login to access this resource', 401))
        }
     return next(new ErrorHandler('invalidToken', 402))
    }
}
)
export const isAuthenticatedUser = asyncHandler(async(req,res,next)=>{
    const  token  = req.cookies.accessToken;

    if(!token){
        return next(new ErrorHandler('loggin to access this resource', 401));
    }
    
   try {
    const {User, decodedData} = await verifyAccess(token, next);
      

if(!User || !decodedData || User == undefined){
    return next(new ErrorHandler('login to access this resource', 400));
}

    req.user = User;
console.log("decoded data : ", decodedData)
    req.tokenData = decodedData;
    next();
   } catch (error) {
    console.log('auth error is', error);

    if(error instanceof ErrorHandler){
        res.status(error.statuscode).json({
            error: error.message,
            message: 'hululi'
        })
    }


    return next(new ErrorHandler('unnauthorized', 400))
   }
})

