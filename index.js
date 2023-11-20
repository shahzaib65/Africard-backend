const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors())
require('dotenv').config();
const connectMongo = require('./db');
connectMongo()


 const port = process.env.PORT || 5000
app.use('/api/auth', require('./routes/user'));
app.use('/api/mtn/',require('./routes/mtn'));

app.listen(port, ()=>{
    console.log("listening perfect",port);
  });