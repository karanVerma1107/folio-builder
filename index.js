import dotenv from 'dotenv';
import express from 'express';
import connectDB from './mongoconnect.js';
const app = express();

dotenv.config({path: "o.env"})

app.get('/', (req, res)=>{
    res.send("hello first project")
})

connectDB();
console.log("port from env is: ", process.env.PORT);

const port  = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`app is runninng on port ${port}`)
})