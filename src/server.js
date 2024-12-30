require('dotenv').config();
const mongoose = require('mongoose')
const app = require('./index');

mongoose.connect(process.env.DATABASE_URL,{
})
    .then(()=>console.log('DB-Connection Succesfully ...'))
    .catch((err)=>console.log('Not Connect '))

app.listen(process.env.PORT, ()=>{
    console.log("app.js");
    console.log(`http://localhost:${process.env.PORT}`);
})