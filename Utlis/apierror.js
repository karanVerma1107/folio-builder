class ErrorHandler extends Error{ 
    //make a constructor that take message and error status code 
    constructor(message, statuscode ){
super(message),
this.statuscode = statuscode,



Error.captureStackTrace(this,this.constructor);

    }

}

export default ErrorHandler;