const User = require("../../models/User/User");
const bcrypt = require("bcryptjs");
const { AppErr, appErr } = require("../../utils/appErr");
const generateToken = require("../../utils/generateToken");

const userRegisterCtrl = async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    //Check if email exist
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(new AppErr("User Already Exist", 500));
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //create the user
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const userLoginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    //Check if email exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(appErr("Invalid login credentials"));
    }
    //verify password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password
    );

    if (!isPasswordMatched) {
      if (!userFound) {
        return next(appErr("Invalid login credentials"));
      }
    }

    res.json({
      status: "success",
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const whoViewedMyProfileCtrl = async (req, res) => {};
const followingCtrl = async (req, res) => {};
const usersCtrl = async (req, res) => {};
const unFollowCtrl = async (req, res) => {};
const userProfileCtrl = async (req, res) => {};
const blockUsersCtrl = async (req, res) => {};
const unblockUserCtrl = async (req, res) => {};
const adminBlockUserCtrl = async (req, res) => {};
const adminUnblockUserCtrl = async (req, res) => {};
const updateUserCtrl = async (req, res) => {};
const updatePasswordCtrl = async (req, res) => {};
const deleteUserAccountCtrl = async (req, res) => {};
const profilePhotoUploadCtrl = async (req, res, next) => {
  console.log(req.file);
  try {
    // Find the user to be updated
    const userToUpdated = await User.findById(req.userAuth);
    // Check if user found
    if (!userToUpdated) return next(appErr("User not found", 403));
    // Check if user is blocked
    if (userToUpdated.isBlocked)
      return next(appErr("Action not allowed, your account is blocked", 403));
    // Check if a user is updating their photo
    if (req.file) {
      // Update profile
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        }
      );
      res.json({
        status: "success",
        data: "You have successfully updated your profile photo",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};
module.exports = {
  userRegisterCtrl,
  userLoginCtrl,
  whoViewedMyProfileCtrl,
  followingCtrl,
  usersCtrl,
  unFollowCtrl,
  userProfileCtrl,
  blockUsersCtrl,
  unblockUserCtrl,
  adminBlockUserCtrl,
  adminUnblockUserCtrl,
  updateUserCtrl,
  updatePasswordCtrl,
  deleteUserAccountCtrl,
  profilePhotoUploadCtrl,
};
