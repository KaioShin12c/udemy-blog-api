const express = require("express");
const isLogin = require("../../middlewares/isLogin");
const {
  createCommentCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} = require("../../controllers/comments/comment.controller");

const commentRouter = express.Router();

//POST/api/v1/comments
commentRouter.post("/:id", isLogin, createCommentCtrl);

//DELETE/api/v1/comments/:id
commentRouter.delete("/:id", isLogin, deleteCommentCtrl);

//PUT/api/v1/comments/:id
commentRouter.put("/:id", isLogin, updateCommentCtrl);

module.exports = commentRouter;
