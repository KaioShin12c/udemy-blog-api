const User = require("../models/User/User");
const { appErr } = require("../utils/appErr");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

const isAdmin = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  const decodedUser = verifyToken(token);
  req.userAuth = decodedUser.id;
  // Find the user in DB
  const user = await User.findById(decodedUser.id);
  // Check if admin
  if (user.isAdmin) return next();
  return next(appErr("Access denied, Admin only", 403));
};

module.exports = isAdmin;
