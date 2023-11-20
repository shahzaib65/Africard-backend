const mongoose = require('mongoose');
require("dotenv").config();

mongoose.set("strictQuery", false);
const connectToMongo = () => {
    mongoose.connect(process.env.MONGO_URI,{
       
    }).then(()=> {
        console.log(`connection established`);
    }).catch((err) => console.log(err));
}

module.exports = connectToMongo

//https://github.com/shahzaib65/Africard.git