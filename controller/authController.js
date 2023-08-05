const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {Video} = require("../models/video");
require('dotenv').config()

const cloudinary = require('cloudinary').v2;


const signUp = async (req, res) => {
  const { username, password, email, profileImg, profileImagePid } = req.body;

  
  if (!username || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Please Provide Required Information.",
    });
  }
  const hash_password = await bcrypt.hash(password, 12);

  const userData = {
    username,
    hash_password,
    email
  };
  if(profileImg){
    userData.profileImage = profileImg
    userData.profileImagePid = profileImagePid
  }
  // console.log(profileImg);
  try {
    const user = await User.User.findOne({ username });
    if (user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "User already registered.",
      });
    } else {
      try {
        const newUser = new User.User(userData);
        await newUser.save();
        const token = jwt.sign(
          { _id: newUser._id, email: email },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );
        return res.status(StatusCodes.OK).json({
          message: "Data successFully entered into the database.",
          token,
        });
      } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error : error.message })
      }
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
const signIn = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Please Provide Required Information.",
    });
  }
  const user = await User.User.findOne({ username });

  if (user) {
    bcrypt.compare(password,user.hash_password,(err,result)=>{
      if(err){
        return res.status(StatusCodes.UNAUTHORIZED).json({error:"Password is incorrect"})
      }
      if(result){
        const token = jwt.sign(
          { _id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
        return res.status(StatusCodes.OK).json({
          message: "Signed in successfully.",
          token,
        });
      }else{
        return res.status(StatusCodes.UNAUTHORIZED).json({error:"Password is incorrect"})
      }
    })
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "User does not exist.",
    });
  }
};
const getProfile = async (req, res) => {
  const user = await User.User.findById(req.user._id).populate('liked')

  const data = {
    username : user.username,
    email : user.email,
    profileImage : user.profileImage,
    coverImage: user.coverImage,
    likedVideos : user.liked,
    followers: user.followers
  }
  return res.status(StatusCodes.OK).json({ profile : data});
}

const editProfile = async (req, res) => {
  try {
    const user = await User.User.findById(req.user._id);
    const { username, password, email, profileImage, coverImage, profileImagePid, coverImagePid } = req.body;

    if(!password || !user.authenticate(password)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error : 'Wrong password' })
    }

    if(username){
      user.username = username;
    }
    if(email){
      user.email = email;
    }
    if(profileImage){
      user.profileImage = profileImage
      user.profileImagePid = profileImagePid
    }
    if(coverImage){
      user.coverImage = coverImage
      user.coverImagePid = coverImagePid
    }
    await user.save();

    return res.status(StatusCodes.OK).json({ message : 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).json({ error : error.message })
  }
}
const deleteUser = async (req, res) => {
  try {
    const user = await User.User.findByIdAndDelete(req.user._id)
    if(user.profileImagePid) cloudinary.uploader
    .destroy(user.profileImagePid)
    .then(res=>console.log(res))
    
    if(user.coverImagePid) cloudinary.uploader
      .destroy(user.coverImagePid)
      .then(res=>console.log(res))

    const vids = await Video.find({ uploadedBy: user._id });
    for(let i=0; i<vids.length; i++){
      await Video.findByIdAndDelete(vids[i]._id)
    }
    return res.status(200).json({ message: 'Account deleted successfully' })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}


const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  try {
    const user = await User.User.findById(req.user._id)
    
    bcrypt.compare(oldPassword,user.hash_password,async (err,result)=>{
      if(err){
        return res.status(StatusCodes.UNAUTHORIZED).json({error:err.message})
      }
      if(result){
        const new_hash_password = await bcrypt.hash(newPassword, 12);

        user.hash_password = new_hash_password

        await user.save()
        return res.status(StatusCodes.OK).json({ message: 'Password updated successfully' })
      }else{
        return res.status(StatusCodes.UNAUTHORIZED).json({error:"Password is incorrect"})
      }
    })

  } catch (error) {
    console.err(error)
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message })
  }

}

const followUser = async (req, res) => {
  const { followingUsername } = req.body
  try {
    const followUser = await User.User.findOne({ username: followingUsername });
    const reqUser = await User.User.findById(req.user._id);

    reqUser.following.push(followUser._id)
    followUser.followers = followUser.followers + 1

    await followUser.save()
    await reqUser.save()

    return res.status(200).json({message: `User followed ${followingUsername}`})
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({error: error.message})
  }
}
const unFollowUser = async (req, res) => {
  const { followingUsername } = req.body
  try {
    const followUser = await User.User.findOne({ username: followingUsername });
    const reqUser = await User.User.findById(req.user._id);

    let followed = false;
    let pos = -1

    for(ind in reqUser.following){
      if(reqUser.following[ind].equals(followUser._id)){
        followed = true;
        pos = ind
        break;
      }
    }
    if(followed){
      reqUser.following.splice(pos,1);
      followUser.followers = followUser.followers - 1;
      return res.status(200).json({message: `User unfollowed ${followingUsername}`})
    }else{
      return res.status(StatusCodes.BAD_REQUEST).json({error: `User not following ${followingUsername}`})
    }
    
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({error: error.message})
  }
}
const checkIfFollowed = async (req, res) => {
  const { followingUsername } = req.body
  try {
    const followUser = await User.User.findOne({ username: followingUsername });
    const reqUser = await User.User.findById(req.user._id);


    let followed = false;

    for(ind in reqUser.following){
      if(reqUser.following[ind].equals(followUser._id)){
        followed = true;
        break;
      }
    }

    return res.status(200).json({ data: followed })
  } catch (error) {
    console.log(error)
    return res.status(StatusCodes.BAD_REQUEST).json({error: error.message})
  }
}

module.exports = { signUp, signIn, getProfile, editProfile, deleteUser, changePassword, followUser, checkIfFollowed, unFollowUser };
