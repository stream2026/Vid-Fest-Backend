const mongoose=require("mongoose");
const commentSchema = new mongoose.Schema({
    postedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    video : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
    text :{
        type : String,
        trim : true,
        required : true
    },
    date: {
        type: Date,
        default: Date.now
     },
})

module.exports = mongoose.model('Comment', commentSchema);
