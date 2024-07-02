import dotenv from 'dotenv';
import express from 'express';
import connectDB from './mongoconnect.js';
import cookieParser from 'cookie-parser';
import { upload } from './middleware/multer.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(express.json());
app.use(cookieParser());


//multer stuff
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("./uploads",
    express.static(path.join(__dirname, "uploads"))
)

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