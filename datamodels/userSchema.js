import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required:true
    },
    Name: {
        type: String,
        required:true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    OTP:{
        type: String,
        
    },
    OTP_EXPIRE:{
        type: Date,
        
    },
    profilePicture:{//cloud
        type: String,
    },
    bio:{
        type:String
    },
    profession:{
     type: String,
     
    },
    education: {
        type: [String]
},
skills:{
    type: [String]
},
projects:{
    type:[String]
},
achievments:{
    type: [String]
},
contacts:{
    phoneNumber:{
    type: Number,
    
    },
    Github: {
        type: String
    },
    whatsapp:{
        type: String
    }
},
country:{
    type: String,

},
experience:{
    type: [String]
},
stars: {
    type: Number,
    default: 0
},
refreshToken: {
    type: String
}

},{
    timestamps: true
})

userSchema.pre('save', async function(next){
    if(this.isModified('OTP') || this.isNew){
        const saltRounds = 10;
      this.OTP = await  bcrypt.hash(this.OTP, saltRounds)
    }
    next();
});

userSchema.methods.isOTPcorrect = async function(OTP){
    return await bcrypt.compare(OTP, this.OTP)
}

userSchema.methods.generateAccessToken = function(){
 return   jwt.sign({
        _id: this._id,
        username: this.username,
        name: this.name,
        email: this.email
    }, 
process.env.ACCESS_TOKEN_SECRET,{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE
})
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    },
process.env.REFRESH_TOKEN_SECRET,{
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE
})
}
const user = mongoose.model('User', userSchema);
export default user