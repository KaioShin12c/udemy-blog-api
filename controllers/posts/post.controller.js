const Post = require("../../models/Post/Post");
const User = require("../../models/User/User");
const { appErr } = require("../../utils/appErr");

const createPostCtrl = async (req, res, next) => {
  const { title, description } = req.body;
  try {
    // Find the user
    const author = await User.findById(req.userAuth);
    // Create the post
    const postCreated = await Post.create({
      title,
      description,
      user: author._id,
    });
    // Associate user to a post Push the post into the user posts field
    author.posts.push(postCreated);
    author.save();
    res.json({
      status: "success",
      data: postCreated,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const fetchPostsCtrl = async (req, res) => {};
const toggleDisLikesPostCtrl = async (req, res) => {};
const toggleLikesPostCtrl = async (req, res) => {};
const postDetailsCtrl = async (req, res) => {};
const deletePostCtrl = async (req, res) => {};
const updatePostCtrl = async (req, res) => {};

module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  toggleDisLikesPostCtrl,
  toggleLikesPostCtrl,
  postDetailsCtrl,
  deletePostCtrl,
  updatePostCtrl,
};
