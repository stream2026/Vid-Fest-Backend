const express = require("express");
const router = express.Router();
const { signUp, signIn, getProfile, editProfile, deleteUser, changePassword, followUser, checkIfFollowed, unFollowUser } = require("../controller/authController");
const authenticateMiddleware = require("../middleware/auth");

router.route('/user')
    .get(function (req, res) {
        console.log("GET request called");
        res.send("Hello buddy u are welcome");
    });


router.route("/signup").post(signUp);
router.route("/signin").post(signIn);
router.route("/profile").get(authenticateMiddleware,getProfile);
router.route('/profile').put(authenticateMiddleware,editProfile);
router.route('/profile').delete(authenticateMiddleware,deleteUser);
router.route('/profile/pass').put(authenticateMiddleware,changePassword);
router.route('/profile/follow').post(authenticateMiddleware,followUser);
router.route('/profile/unfollow').post(authenticateMiddleware,unFollowUser);
router.route('/profile/followed').post(authenticateMiddleware,checkIfFollowed);

module.exports = router;