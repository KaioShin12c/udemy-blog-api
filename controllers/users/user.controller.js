const User = require("../../models/User/User");
const bcrypt = require("bcryptjs");
const { AppErr, appErr } = require("../../utils/appErr");
const generateToken = require("../../utils/generateToken");
const Post = require("../../models/Post/Post");
const Comment = require("../../models/Comment/Comment");
const Category = require("../../models/Category/Category");

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
const whoViewedMyProfileCtrl = async (req, res, next) => {
  try {
    // Find the original
    const user = await User.findById(req.params.id);
    // Find the user who viewed the original user
    const userWhoViewed = await User.findById(req.userAuth);
    // Check if original and who viewed are found
    if (user && userWhoViewed) {
      const isUserAlreadyViewed = user.viewers.find(
        (viewed) => viewed.toString() === userWhoViewed._id.toJSON()
      );
      if (isUserAlreadyViewed) {
        return next(appErr("You already viewed this profile"));
      }
    } else {
      // Push the userWhoViewed to the user's viewers array
      user.viewers.push(userWhoViewed._id);
      // Save the user
      await user.save();
      res.json({
        status: "success",
        data: "You have successfully viewed this profile",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};
const followingCtrl = async (req, res, next) => {
  try {
    // Find the user to follow
    const userToFollow = await User.findById(req.params.id);
    // Find the user who is following
    const userWhoFollowed = await User.findById(req.userAuth);
    // Check if user and userWhoFollowed are found
    if (userToFollow && userWhoFollowed) {
      // Check if userWhoFollowed is already in the user's followed array
      const isUserAlreadyFollowed = userToFollow.following.find(
        (follower) => follower.toString() === userWhoFollowed._id.toJSON()
      );
      if (isUserAlreadyFollowed)
        return next(appErr("You ready followed this user"));
      // Push userWhoFollowed to the user's followed array
      userToFollow.followers.push(userWhoFollowed._id);
      // Push userToFollow to the userWhoFollowed's following array
      userWhoFollowed.following.push(userToFollow._id);
      // save
      await userWhoFollowed.save();
      await userToFollow.save();
      res.json({
        status: "success",
        data: "You have successfully this user",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};
const unFollowCtrl = async (req, res, next) => {
  try {
    // Find the user to unFollow
    const userToBeUnFollowed = await User.findById(req.params.id);
    // Find the user who is unFollowing
    const userWhoUnFollowed = await User.findById(req.userAuth);
    // Check if user and userWhoUnFollowed are found
    if (userToBeUnFollowed && userWhoUnFollowed) {
      // Check if userWhoUnFollowed is already in the user's followers array
      const isUserAlreadyFollowed = userToBeUnFollowed.followers.find(
        (follower) => follower.toString() === userWhoUnFollowed._id.toJSON()
      );
      if (!isUserAlreadyFollowed)
        return next(appErr("You have not followed this user"));
      // Remove userWhoUnFollowed from the user's followers array
      userToBeUnFollowed.followers = userToBeUnFollowed.followers.filter(
        (follower) => follower.toString() !== userWhoUnFollowed._id.toJSON()
      );
      await userToBeUnFollowed.save();

      userWhoUnFollowed.following ===
        userWhoUnFollowed.following.filter(
          (following) =>
            following.toString() !== userToBeUnFollowed._id.toJSON()
        );
      await userWhoUnFollowed.save();
      res.json({
        status: "success",
        data: "You have successfully unFollowed this user",
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};
const usersCtrl = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const userProfileCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.userAuth).populate("posts");
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const blockUsersCtrl = async (req, res, next) => {
  try {
    // Find the user to be blocked
    const userToBeBlocked = await User.findById(req.params.id);
    // Find the user who is blocking
    const userWhoBlocked = await User.findById(req.userAuth);
    // Check if userToBeBlocked and userWhoBlocked are found
    if (userToBeBlocked && userWhoBlocked) {
      // Check if userWhoBlocked is already in the user's blocked array
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
        (blocked) => blocked.toString() === userToBeBlocked._id.toString()
      );
      if (isUserAlreadyBlocked)
        return next(appErr("You already blocked this user"));
      // Push userToBeBlocked to the userWhoBlocked's blocked array
      userWhoBlocked.blocked.push(userToBeBlocked._id);
      await userWhoBlocked.save();
      res.json({
        status: "success",
        data: "You have successfully blocked this user",
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};
const unblockUserCtrl = async (req, res, next) => {
  try {
    const userToBeUnblocked = await User.findById(req.params.id);
    const user = await User.findById(req.req.userAuth);
    if (user && userToBeUnblocked) {
      const isUserAlreadyUnBlocked = user.blocked.find(
        (blocked) => blocked.toString() === userToBeUnblocked._id.toString()
      );
      if (!isUserAlreadyUnBlocked)
        return next(appErr("User already unblocked"));
      user.blocked.filter(
        (blocked) => blocked.toString() !== userToBeUnblocked._id.toString()
      );
      await user.save();
    }
  } catch (error) {
    next(appErr(error.message));
  }
};
const adminBlockUserCtrl = async (req, res, next) => {
  try {
    const userToBeBlocked = await User.findById(req.params.id);
    if (!userToBeBlocked) return next(appErr("User not found"));
    userToBeBlocked.blocked = true;
    userToBeBlocked.save();
    res.json({
      status: "success",
      data: "admin block user",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const adminUnblockUserCtrl = async (req, res, next) => {
  try {
    const userToBeUnblocked = await User.findById(req.params.id);
    if (!userToBeUnblocked) return next(appErr("User not found"));
    userToBeUnblocked.blocked = false;
    userToBeUnblocked.save();
    res.json({
      status: "success",
      data: "You have successfully unblocked this user",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const updateUserCtrl = async (req, res, next) => {
  const { email, lastname, firstname } = req.body;
  try {
    // Check if email is not taken
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) return next(appErr("Email is taken", 400));
    }
    // update the user
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      { firstname, lastname, email },
      { new: true, runValidators: true }
    );
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // update user
      await User.findByIdAndUpdate(
        req.userAuth,
        { password: hashedPassword },
        { new: true, runValidators: true }
      );
      res.json({
        status: "success",
        data: "Password has been changed successfully",
      });
    } else {
      next(appErr("Please provide password field"));
    }
  } catch (error) {
    next(appErr(error.message));
  }
};
const deleteUserAccountCtrl = async (req, res, next) => {
  try {
    // Find the user to be deleted
    // const userToBeDelete = await User.findById(req.userAuth);
    // Find all posts to be deleted
    await Post.deleteMany({ user: req.userAuth });
    // Delete all comments of the user
    await Comment.deleteMany({ user: req.userAuth });
    // Delete all category of the user
    await Category.deleteMany({ user: req.userAuth });
    await User.deleteOne({ _id: req.userAuth });
    res.json({
      status: "success",
      data: "Delete user account success",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const profilePhotoUploadCtrl = async (req, res, next) => {
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
