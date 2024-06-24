require('dotenv').config({path: 'o.env'});
const express = require('express');
const app = express();


app.get('/', (req, res)=>{
    res.send("hello first project")
})

console.log("port from env is: ", process.env.PORT);

const port  = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`app is runninng on port ${port}`)
})