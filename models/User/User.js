const mongoose = require("mongoose");
const Post = require("../Post/Post");

//create schema
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First Name is required"],
    },
    lastname: {
      type: String,
      required: [true, "Last Name is required"],
    },
    profilePhoto: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Editor"],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // plan: {
    //   type: String,
    //   enum: ["Free", "Premium", "Pro"],
    //   default: "Free",
    // },

    userAward: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true, // to get virtual in json response from server to client
    },
  }
);
// hooks
// pre-before record is saved
userSchema.pre("findOne", async function (next) {
  // get the user id
  const userId = this._conditions._id;
  // find the post created by the user
  const posts = await Post.find({ user: userId });
  // get the last post created by the user
  const lastPost = posts[posts.length - 1];
  // get the last post date
  const lastPostDate = new Date(lastPost?.createdAt);
  // get the last post date in string format
  const lastPostDateStr = lastPostDate.toDateString();
  userSchema.virtual("lastPostDate").get(function () {
    return lastPostDateStr;
  });

  // ---------------------- Check if user is inactive for 30 days ---------------------//
  // get current date
  const currentDate = new Date();
  // get the difference between the last post date and the current date
  const diff = currentDate - lastPostDate;
  // get the difference in days and return less than in day
  const diffInDays = diff / (1000 * 3600 * 24);
  if (diffInDays > 30) {
    // Add virtual isInactive to the schema to check if a user is inactive for 30 days
    userSchema.virtual("isInactive").get(function () {
      return true;
    });
    // Find the user by Id and update
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
  } else {
    userSchema.virtual("isInactive").get(function () {
      return false;
    });
    // Find the user by Id and update
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
  }
  // -------- Last active date -------
  const daysAgo = Math.floor(diffInDays);
  // add virtual lastActive in days to the schema
  userSchema.virtual("lastActive").get(function () {
    // check if daysAgo is less than 0
    if (daysAgo <= 0) return "Today";
    // check if daysAgo is equal to 1
    if (daysAgo === 1) return "Yesterday";
    // check if daysAgo is greater than 1
    if (daysAgo > 1) return `${daysAgo} days ago`;
  });

  // --------------- Update userAward based on the number of posts --------------
  // get the number of posts
  const numberOfPosts = posts.length;
  // check if the number of posts is less than 10
  if (numberOfPosts < 10) {
    await User.findByIdAndUpdate(
      userId,
      { userAward: "Bronze" },
      { new: true }
    );
  }
  // check if the number of posts is greater than 10 and less than 20
  if (numberOfPosts > 10 && numberOfPosts <= 20) {
    await User.findByIdAndUpdate(
      userId,
      { userAward: "Silver" },
      { new: true }
    );
  }
  // check if the number of posts is greater than 20
  if (numberOfPosts > 20) {
    await User.findByIdAndUpdate(userId, { userAward: "Gold" }, { new: true });
  }
  next();
});

// post -after saving
userSchema.post("save", function (next) {
  console.log("Post hook");
});

// Get fullName
userSchema.virtual("fullName").get(function () {
  return `${this.firstname} ${this.lastname}`;
});
// Get user initials
userSchema.virtual("initials").get(function () {
  return `${this.firstname[0]}${this.lastname[0]}`;
});
// Get posts count
userSchema.virtual("postCounts").get(function () {
  return this.posts.length;
});
// Get followers count
userSchema.virtual("followerCounts").get(function () {
  return this.followers.length;
});
// Get followings count
userSchema.virtual("followingCounts").get(function () {
  return this.following.length;
});
// Get viewers count
userSchema.virtual("viewerCounts").get(function () {
  return this.viewers.length;
});
// Get blocked count
userSchema.virtual("blockedCounts").get(function () {
  return this.blocked.length;
});
//Compile the user model
const User = mongoose.model("User", userSchema);

module.exports = User;
