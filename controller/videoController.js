const { StatusCodes } = require("http-status-codes");
const { Video } = require("../models/video");
const { User } = require("../models/user");
const Comment = require("../models/comment");
const { populate } = require("dotenv");

/*Video object*/
const videos = async (req, res) => {
  const { video, videoName, videoDescription, thumbnail, category, pid, thumbnailPid } = req.body;
  const uploadedBy = req.user._id;
  if (!video || !videoName || !videoDescription || !uploadedBy || !category || !pid) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide Required Information",
    });
  }
  let data = {
    video: video,
    videoName: videoName,
    videoDescription: videoDescription,
    uploadedBy: uploadedBy,
    category: category,
    pid: pid
  };
  if (thumbnail) {
    data = {
      ...data,
      thumbnail: thumbnail,
      thumbnailPid: thumbnailPid
    };
  }
  try {
    const newVideo = new Video(data);
    await newVideo.save();

    return res.status(StatusCodes.OK).json({
      message: "Video successFully added.",
      newVideo,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};


const allVideos = async (req, res) => {
  const data = await Video.find({});
  return res.status(StatusCodes.OK).json({
    data: data,
  });
};

/*Fetching the video*/
const getVideo = async (req, res) => {
  const videoId = req.params.videoId;
  try {
    const video = await Video.findById(videoId)
      .populate({
        path: "comments",
        populate: {
          path: "postedBy",
          select: "username profileImage -_id",
        },
      })
      .populate({
        path: "uploadedBy",
        select: "username profileImage -_id",
      });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    let watched = false;
    for (ind in req.user.watched) {
      if (req.user.watched[ind].equals(video._id)) {
        watched = true;
        break;
      }
    }
    if (!watched) {
      video.views = video.views + 1;
      await video.save();
      const user = await User.findById(req.user._id);
      user.watched.push(video._id);
      await user.save();
    }

    return res.json(video);
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* Get Videos by categories */
const getVideobyCategory = async (req, res) => {
  const Category = req.params.category;
  // console.log(Category);
  try {
    const data = await Video.find({ category: Category });

    if (!data) {
      return res.status(404).json({ message: "Video not found" });
    }

    // return res.json(video);
    return res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* Delete the video */
const deleteVideo = async (req, res) => {
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndDelete({ videoId })
      .then(() => req.json({ message: "Video Successfully deleted" }))
      .then((error) => {
        throw new Error(error);
      });
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* updating the existing video */
const updateVideo = async (req, res) => {
  const videoId = req.params.videoId;
  const { updatedVideo } = req.body;

  try {
    const video = await Video.findById({ videoId });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.set(updatedVideo);
    await video.save();

    // Return the updated video
    return res.json(video);
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const like = async (req, res) => {
  const videoId = req.params.videoId;
  try {
    let video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const user = await User.findById(req.user._id);

    user.liked.push(video._id);
    await user.save();
    video.likes = video.likes + 1;
    await video.save();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
  return res.status(200).json({ message: "success" });
};
const dislike = async (req, res) => {
  const videoId = req.params.videoId;
  try {
    let video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const user = await User.findById(req.user._id);

    user.disliked.push(video._id);
    await user.save();

    video.dislikes = video.dislikes + 1;
    await video.save();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
  return res.status(200).json({ message: "Video disliked" });
};

const removeLike = async (req, res) => {
  const videoId = req.params.videoId;
  try {
    let video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const user = await User.findById(req.user._id);

    var liked = false;
    var ind = -1;
    for (vid in user.liked) {
      ind++;
      if (req.user.liked[vid].equals(video._id)) {
        liked = true;
        break;
      }
    }

    if (liked) {
      user.liked.splice(ind, 1);
      await user.save();
      video.likes = video.likes - 1;
      await video.save();
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Video not liked" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
  return res.status(200).json({ message: "success" });
};

const removeDislike = async (req, res) => {
  const videoId = req.params.videoId;
  try {
    let video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const user = await User.findById(req.user._id);

    var disliked = false;
    var ind = -1;
    for (vid in user.disliked) {
      ind++;
      if (req.user.disliked[vid].equals(video._id)) {
        disliked = true;
        break;
      }
    }

    if (disliked) {
      user.disliked.splice(ind, 1);
      await user.save();
      video.dislikes = video.dislikes - 1;
      await video.save();
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Video not disliked" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
  return res.status(200).json({ message: "success" });
};

//add Comment
const addComment = async (req, res) => {
  const videoId = req.params.videoId;
  const commentText = req.body.commentText;
  try {
    let video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    const comment = new Comment({
      postedBy: req.user._id,
      video: video._id,
      text: commentText,
    });
    await comment.save();

    video.comments.push(comment);
    await video.save();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
  return res.status(200).json({ message: "Comment added successfully" });
};

//view comments
const comments = async (req, res) => {
  const videoId = req.params.videoId;
  try {
    let video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    return res.json({
      comments: video.comments,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* fetching the watched history */
const WatchedVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("watched");

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User not found" });
    }

    return res.status(200).json({
      data: user.watched,
    });
  } catch (error) {
    console.error("Error fetching watched videos:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const checkLiked = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    let video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    for (vid in req.user.liked) {
      if (req.user.liked[vid].equals(video._id))
        return res.status(200).json({ data: true });
    }
    return res.status(200).json({ data: false });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const checkDisliked = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    let video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    for (vid in req.user.disliked) {
      if (req.user.disliked[vid].equals(video._id))
        return res.status(200).json({ data: true });
    }
    return res.status(200).json({ data: false });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getFollowedVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const followedUsers = user.following;

    const vids = await Video.find({ uploadedBy: followedUsers });

    return res.status(200).json({ data: vids });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

/* component for showing option in autocomplete search */
const autocompleteSearch = async (req, res) => {
  try {
    // Fetch all videos from the database
    const videos = await Video.find({});

    // Extract the videoName field from each video
    const videoNames = videos.reduce((acc, video) => {
      const words = video.videoName
        .split(" ")
        .filter((word) => word.length > 1);
      return acc.concat(words);
    }, []);

    // Return the list of video names
    return res.status(StatusCodes.OK).json(videoNames);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

//sort function
function GetSortOrder(prop) {
  return function (a, b) {
    if (a[prop] < b[prop]) {
      return 1;
    } else if (a[prop] > b[prop]) {
      return -1;
    }
    return 0;
  };
}

//trending videos
const trending = async (req, res) => {
  try {
    const videos = await Video.find({});
    if (!videos) {
      return res.status(404).json({ message: "Video not found" });
    }
    const newarr = [];
    for (let i = 0; i < videos.length; i++) {
      let obj = videos[i];
      const date = new Date();
      date.setDate(date.getDate() - 30);
      if (obj.createdAt > date) {
        newarr.push(obj);
      }
    }
    newarr.sort(GetSortOrder("eval"));
    return res.json({ data: newarr });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//results according to searchParams
const searchResults = async (req, res) => {
  try {
    const searchWord = req.params.searchWord.toLowerCase();
    const videos = await Video.find({});

    // Filter the videos whose videoName has the same prefix as the searchWord
    const matchedVideos = videos.filter((video) => {
      return video.videoName.toLowerCase().startsWith(searchWord);
    });

    return res.status(StatusCodes.OK).json({ data: matchedVideos });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
};

//featured
const featured = async (req, res) => {
    
  try {
    const videos = await Video.find({});
    if (!videos) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    videos.sort((v1,v2)=>{
      const now = new Date();
      const diff1 = (now - v1.createdAt)/(1000*60*60);
      const diff2 = (now - v2.createdAt)/(1000*60*60);
      const slope1 = v1.eval/diff1;
      const slope2 = v2.eval/diff2;

      return slope1 > slope2;
    })
    if(videos.length <= 10) {
      return res.status(200).json({data:videos});
    }
    return res.status(200).json({ data : videos.slice(0,10) })
  } 
  catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  videos,
  allVideos,
  autocompleteSearch,
  searchResults,
  WatchedVideos,
  trending,
  getVideo,
  deleteVideo,
  updateVideo,
  getVideobyCategory,
  like,
  dislike,
  addComment,
  comments,
  checkLiked,
  removeDislike,
  removeLike,
  checkDisliked,
  getFollowedVideos,
  featured,
};
