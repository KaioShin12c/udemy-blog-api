const express = require("express");
const isLogin = require("../../middlewares/isLogin");
const {
  createPostCtrl,
  postDetailsCtrl,
  toggleLikesPostCtrl,
  toggleDisLikesPostCtrl,
  fetchPostsCtrl,
  deletePostCtrl,
  updatePostCtrl,
} = require("../../controllers/posts/post.controller");

const postRouter = express.Router();

//POST/api/v1/posts
postRouter.post("/", isLogin, createPostCtrl);

//GET/api/v1/posts/:id
postRouter.get("/:id", isLogin, postDetailsCtrl);

//GET/api/v1/posts/likes/:id
postRouter.get("/likes/:id", isLogin, toggleLikesPostCtrl);

//GET/api/v1/posts/dislikes:id
postRouter.get("/dislikes/:id", isLogin, toggleDisLikesPostCtrl);

//GET/api/v1/posts
postRouter.get("/", isLogin, fetchPostsCtrl);

//DELETE/api/v1/posts/:id
postRouter.delete("/:id", isLogin, deletePostCtrl);

//PUT/api/v1/posts/:id
postRouter.put("/:id", isLogin, updatePostCtrl);

module.exports = postRouter;
