const express = require("express");
const router = express.Router();
const {
  videos,
  allVideos,
  autocompleteSearch,
  WatchedVideos,
  getVideo,
  deleteVideo,
  updateVideo,
  like,
  dislike,
  addComment,
  comments,
  getVideobyCategory,
  checkLiked,
  removeDislike,
  removeLike,
  checkDisliked,
  getFollowedVideos,
  trending,
  searchResults,
  featured,
} = require("../controller/videoController");
const authenticateMiddleware = require("../middleware/auth");

router.route("/").post(authenticateMiddleware, videos);
router.route("/").get(authenticateMiddleware, allVideos); // here
router.route("/options").get(authenticateMiddleware,autocompleteSearch);
router.route("/trending").get(authenticateMiddleware, trending);
router.route("/featured").get(authenticateMiddleware, featured);
router.route("/watchedhistory").get(authenticateMiddleware, WatchedVideos); // working properly in postman
router.route("/search/:searchWord").get(authenticateMiddleware, searchResults);
router
  .route("/categories/:category")
  .get(authenticateMiddleware, getVideobyCategory); //if i use only "/:category"  {line 19}  then the get videos showing object cast error
router.route("/following").get(authenticateMiddleware, getFollowedVideos);
router.route("/:videoId").get(authenticateMiddleware, getVideo);
router.route("/:videoId").delete(authenticateMiddleware, deleteVideo);
router.route("/:videoId").put(authenticateMiddleware, updateVideo);
router.route("/:videoId/like").get(authenticateMiddleware, like);
router.route("/:videoId/liked").get(authenticateMiddleware, checkLiked);
router.route("/:videoId/disliked").get(authenticateMiddleware, checkDisliked);
router.route("/:videoId/dislike").get(authenticateMiddleware, dislike);
router.route("/:videoId/dislike").get(authenticateMiddleware, dislike);
router.route("/:videoId/removeLike").get(authenticateMiddleware, removeLike);
router
  .route("/:videoId/removeDislike")
  .get(authenticateMiddleware, removeDislike);
router.route("/:videoId/comments").post(authenticateMiddleware, addComment);
router.route("/:videoId/comments").get(authenticateMiddleware, comments);

module.exports = router;
