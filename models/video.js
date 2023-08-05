const mongoose = require("mongoose");
const { Comment } = require("./comment")

require('dotenv').config()

const cloudinary = require('cloudinary').v2;


const videoSchema = new mongoose.Schema({
  video : {
    type: String,
    required : true,
    trim : true,
  },
  pid:{
    type: String,
    required : true,
    trim: true
  },
  videoName: {
    type: String,
    required : true,
    trim: true,
  },
  videoDescription: {
    type: String,
    require: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  thumbnail: {
    type: String,
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNZ83BbR2y_f7WBuCErrGMtkxLsEPs-149w7Cz2wYe&s"
  },
  thumbnailPid:{
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  eval: {
    type: Number,
    default: 1,
  },
  category : {
    type: String,
    default: 'Miscellaneous',
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
}, { timestamps: true });


videoSchema.post('findOneAndDelete', async (doc)=>{
  
  cloudinary.uploader
    .destroy(doc.pid, {resource_type: 'video'})
    .then(result=>console.log(result));

  cloudinary.uploader
    .destroy(doc.thumbnailPid)
    .then(res=>console.log(res))

  await Comment.deleteMany({ _id: doc.comments })
})

const Video = mongoose.model("Video", videoSchema);

module.exports = { Video };
