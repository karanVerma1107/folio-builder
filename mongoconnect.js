import mongoose from "mongoose";
import { DB_NAME } from "./constants/dbname.js";


const connectDB = async() =>{
    try{
        const connectionbase = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`mongoDB has connected with DB HOST !! ${connectionbase.connection.host}`);
    }catch(error){
console.log(`mongodb connection error: `, error);
process.exit(1);
    }
}

export default connectDB;