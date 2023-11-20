const router = require('express').Router();
const dotenv = require("dotenv");
dotenv.config();
router.post("/user-provisioning/:UUID",async(req,res)=>{
    try {  

  
    } catch (error) {
        res.status(500).send({success: false,error: error.message})
    }
})

module.exports = router;