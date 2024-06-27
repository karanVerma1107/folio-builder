import dotenv from 'dotenv';
import express from 'express';
import connectDB from './mongoconnect.js';
import cookieParser from 'cookie-parser';
const app = express();

app.use(express.json());
app.use(cookieParser());

dotenv.config({path: "o.env"})



//connect from routr file
import userRoutes from './routes/userRoute.js'
app.use("/api/v1", userRoutes);

connectDB();
console.log("port from env is: ", process.env.PORT);

const port  = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`app is runninng on port ${port}`)
})