const dotenv = require('dotenv')
const mongoose = require('mongoose')
const fs = require('fs');
const Tour = require('../models/toursModels');
dotenv.config({path: '../.env'})

// console.log(process.env.DATABASE_URL);// if other file is not in same root file
//  you must give the path.

console.log("Import File is Run");

mongoose.connect('mongodb://localhost:27017/tours',{
})
    .then(()=>console.log('DB-Connection Succesfully ...'))
    .catch((err)=>console.log(err))


// Read JSON File
const tour = JSON.parse(fs.readFileSync(`tours.json`, 'utf-8'));
// console.log(tour)

//  Import Data into Database.

const importData = async()=>{
    try {
        await Tour.create(tour)
        console.log('Tour Create Succesfully ...');
    } catch (error) {
        console.log("Error in Tour Create"+ error);
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
