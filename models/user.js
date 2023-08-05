const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { Video } = require('./video')

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    profileImage: {
      type: String,
      default:
        "https://st3.depositphotos.com/19428878/36416/v/450/depositphotos_364169666-stock-illustration-default-avatar-profile-icon-vector.jpg",
    },
    coverImage: {
      type: String,
      default:
        "https://st3.depositphotos.com/19428878/36416/v/450/depositphotos_364169666-stock-illustration-default-avatar-profile-icon-vector.jpg",
    },
    profileImagePid:{
      type: String,
    },
    coverImagePid:{
      type: String,
    },
    hash_password: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validateEmail, "Please fill a valid email address"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    following:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    followers: {
      type: Number,
      default: 0
    },
    liked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    disliked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    watched: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);
const userJoiSchema = Joi.object({
  username: Joi.string().required().trim().min(3).max(30),
  hash_password: Joi.string().min(6).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  liked: Joi.number().min(0),
  disliked: Joi.number().min(0),
  watched: Joi.number().min(0),
});
const validateUser = (user) => {
  return userJoiSchema.validate(user);
};
userSchema.methods.authenticate = async function (password) {
  try {
    const res = await bcrypt.compare(password, this.hash_password);
    return res
  } catch (error) {
    return false;
  }
};

userSchema.pre('findOneAndDelete',(next)=>{
  console.log('Deleting user')
  Video.deleteMany({ uploadedBy: this._id },(err,res)=>{
    if(err){
      console.error(err)
      next(err)
    }
    next()
    console.log(res)
    
    
  })
})

const User = mongoose.model("User", userSchema);
module.exports = { User, validateUser };
