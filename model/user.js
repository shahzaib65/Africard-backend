const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String
    },
    email: {
      type: String,
    },
    password: {
        type: String
    },
    deviceToken: {
      type: String,
      default: "",
    },
    token: {
      type: String,
      default: "",
    },
    account_number:{
        type: String,
        default: ""
    },
    mobile_number: {
        type: String,
        default: ""
    },
    current_balance_account: {
        type: String,
        default: ""
    },
    pin_pass: {
        type: String,
        default: ""
    },
    profile_picture: {
        type: String,
        default: ""
    },
    generation_cards: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    isActivated: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);