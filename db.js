const mongoose = require('mongoose')
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL

function connectToMongo (){
    mongoose.connect(MONGODB_URL)

    mongoose.connection.on('connected', () =>{
        console.log('mongoose connected successfully')
    })
    mongoose.connection.on('err',()=>{
        console.log('an error occurred during conection', err)
    })

}
module.exports = { connectToMongo }
