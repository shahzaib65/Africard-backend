const router = require('express').Router();
const User = require('../model/user');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = 'Shahzaibisagoodb$oy';
const nodemailer = require('nodemailer');
const randomString = require("randomstring");
const { body, validationResult } = require('express-validator');
const dotenv = require("dotenv");
dotenv.config();

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_MAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  });

//endpoint to create user
router.post("/createuser",[
    body('username', 'Enter a valid username').isLength({ min: 3 }),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
    body('email','email is not valid').isEmail()
],async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success: false, error: errors.array() });
    }
    try {
        let check_user = await User.findOne({ email: req.body.email });
        if (check_user) {
          return res.status(400).json({success: false, error: "Sorry a user with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        check_user = await User.create({
          username: req.body.username,
          password: secPass,
          email: req.body.email,
        });

   if(check_user){
    const token = jwt.sign({ userId: check_user._id },JWT_SECRET, { expiresIn: '1d' });
        let mailOption = {
          from: process.env.SMTP_MAIL,
          to: req.body.email,
          subject: "Account activation",
          text: `Click the following link to activate your account: http://localhost:5000/api/auth/activate/${token}`,
        };
        transporter.sendMail(mailOption, function (error) {
          if (error) {
            res.status(404).send(error);
          } else {
            res
              .status(200)
              .send({ successMessage: "Email sent successfully" });
          }
        });
   }
        res.json({success: true, message: "Your account have been created" })
      } catch (error) {
        res.status(500).send({success: false,error: error.message});
      }
});

//endpoint to verify the account
router.get("/activate/:token",async(req,res)=>{
jwt.verify(req.params.token,JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json('<h1>Token is invalid or expired</h1>');
    } else {
      const userId = decoded.userId;
     console.log(userId)
const data =  User.findOne({_id: userId});

const userData =  User.findByIdAndUpdate(
    { _id: data._id },
    { $set: { isActivated: true} },
    { new: true }
  );
  res.status(200).send("<h1>Account is activated</h1>")
    }
  });
});

//endpoint to login user
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success: false, errors:  errors.array() });
    }
    const { email, password } = req.body;
    console.log(req.body)
    try {
      let user = await User.findOne({ email});
      if (!user) {
        return res.status(400).json({success: false, error: "Please try to login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ success: false, error: "Please try to login with correct credentials" });
      }
     res.status(200).send({success: true,userInfo: user})
    // res.status(200).send({isAdmin,id: userId})
  
    } catch (error) {
      res.status(500).send({success: false,error: error.message});
    }
  
  });

 //endpoint to change username
router.post("/change-username/:id",
body('username', 'Enter a valid username').isLength({ min: 3 }),async(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success: false, error: errors.array() });
  }
  try {
    const data = await User.findOne({_id: req.params.id });
    console.log(data);
      const userData = await User.findByIdAndUpdate(
        { _id: data._id },
        { $set: { username: req.body.username} },
        { new: true }
      );
      res
        .status(200)
        .send({
            success: true,
          message: 'Your username has been updated'
        });
  } catch (error) {
    res.status(500).send({success: false, error: error.message })
  }
});

 //endpoint to change password
router.post('/change-password',[
  body('username', 'Enter a valid username').isLength({ min: 3 }),
  body('oldPassword', 'Old password must be atleast 5 characters').isLength({ min: 5 }),
  body('newPassword', 'New Password must be atleast 5 characters').isLength({ min: 5 }),
],async(req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  try {
    const { username, oldPassword, newPassword } = req.body;
   // const user = await User.findOne(user => user.username === username);
   const user = await User.findOne({username: username});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isValidPassword = bcrypt.compareSync(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({success: false, error: 'Invalid old password' });
    }
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(newPassword, salt);
    const userData = await User.findByIdAndUpdate(
      { _id: user._id },
      { $set: { password: securePass} },
      { new: true }
    );
    res
      .status(200)
      .send({
        success: true,
        message: 'Your password has been updated'
      });
  } catch (error) {
    res.status(400).send({success: false,error: error.message})
  }
});
//endpoint to delete the user
router.delete("/delete-user/:id",async(req,res)=>{
try {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(400).json({error: "User not found"});
  }
  res.status(200).json({message: "User deleted successfully"});

} catch (error) {
  res.status(400).send({error: error.message})
}
});
//endpoint
router.post("/checkEmail",async(req,res)=>{
    try {
      const userData = await User.findOne({ email: req.body.email });
      if (userData) {
    const  update = await User.findByIdAndUpdate(
                userData._id,
                { $set: {token: randomString.generate()}},
                { new: true }
              );
        res.status(200).json({sucess: true,message: 'Your token generated',token: update.token});
      } else {
        res.status(401).send({succcess: false, mssage: error.message});
      }
    } catch (error) {
      res.status(200).send({ succcess: false,error: error.message})
    }
    
    });
    
    router.post("/resetPassword",async (req, res) => {
        try {
          const tokenData = await User.findOne({ token: req.body.token });
          console.log(tokenData.token)
          if (tokenData) {
            const pass = req.body.password;
            const salt = await bcrypt.genSalt(10);
            const securePass = await bcrypt.hash(pass, salt);
            const userData = await Director.findByIdAndUpdate(
              { _id: tokenData._id },
              { $set: { password: securePass, token: "" } },
              { new: true }
            );
            res
              .status(200)
              .send({
                successMessage: "User password has been reset"
              });
          } else {
            res.status(200).send({errorMessage: {error: [error]}});
          }
        } catch (error) {
          res.status(400).send({errorMessage: {error: [error]}});
        }
      }
    );

   
 



module.exports = router