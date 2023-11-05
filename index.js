const express = require('express')
const cors = require('cors')
const app = express();
app.use(express.json());
app.use(cors())
require('dotenv').config();
const connectMongo = require('./db');
connectMongo()
