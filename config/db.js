const mongoose = require('mongoose');
const env = require('dotenv').config();

// locale database 
// mongoose.connect('mongodb://127.0.0.1:27017/LTE_AdminPanel');

// online database
mongoose.connect(process.env.MONGODB_CONNECT_URI);

const db = mongoose.connection;

db.once('open',err=>console.log(err?err:"Mongodb connected successfully..."));

module.exports = db;