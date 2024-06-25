import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required:true
    },
    name: {
        type: String,
        required:true
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true
    },
    OTP:{
        type: String,
        required: true
    },
    profilePicture:{//cloud
        type: String,
    },
    bio:{
        type:String
    },
    profession:{
     type: String,
     required: true
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
    email:{
    type: String,
    
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
    required: true,
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
    jwt.sign({
        _id: this._id,
        username: this.username,
        name: this.name,
        phoneNumber: this.phoneNumber
    }, 
process.env.ACCESS_TOKEN_SECRET,{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE
})
}