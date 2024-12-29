const dotenv = require('dotenv')
const mongoose = require('mongoose')
const fs = require('fs');
const Tour = require('../models/toursModels');
const { log } = require('console');
dotenv.config({path: '../.env'})

// console.log(process.env.DATABASE_URL);// if other file is not in same root file
//  you must give the path.

mongoose.connect(process.env.DATABASE_URL,{
})
    .then(()=>console.log('DB-Connection Succesfully ...'))
    .catch((err)=>console.log(err))


// Read JSON File
const tour = JSON.parse(fs.readFileSync(`tours-simple.json`, 'utf-8'));
// console.log(tour)

//  Import Data into Database.

const importData = async()=>{
    try {
        await Tour.create(tour)
        console.log('Tour Create Succesfully ...');
    } catch (error) {
        console.log("Error in Tour Create");
    }
    process.exit()
}

const deleteTour = async ()=>{
    try {
        await Tour.deleteMany();
        console.log('Data Delete Succesfully');
    } catch (error) {
        console.log('Error in Delete the Data ...');
    }
    process.exit()
}
// importData()
// console.log(process.argv);
if(process.argv[2] === '--import'){
    importData()
}
else if(process.argv[2] === '--delete'){
    deleteTour()
}
