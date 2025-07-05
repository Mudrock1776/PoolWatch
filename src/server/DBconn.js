const mongoose = require("mongoose");
if (process.env.MONGOURL == null){
    process.env.MONGOURL = 'mongodb://localhost:27017';
}
const DB = mongoose.connect(process.env.MONGOURL, {useNewUrlParser: true});
console.log("connected to database")