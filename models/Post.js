const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const postSchema = new Schema({
  postedBy: String,
  message: String,
  likes: Number,
  time: Date,
  imagePath: String,
  category: String,

  comments: [
    {
      user: String,
      message: String,
      likes: Number,
    },
  ],
});

const Post = model("MyPost", postSchema);

function addNewPost(userID, post, imageFile) {
  let myPost = {
    postedBy: userID,
    message: post.message,
    imagePath: imageFile,
    category: post.category,
    likes: 0,
    time: Date.now(),
  };
  Post.create(myPost).catch((err) => {
    console.log("Error:" + err);
  });
}

//needs to be an async function so we can pause execution awaiting for data
async function getPosts(n = 3) {
  let data = [];
  await Post.find({})
    .sort({ time: -1 })
    .limit(n)
    .exec()
    .then((mongoData) => {
      data = mongoData;
    })
    .catch((err) => {
      console.log("Error:" + err);
    });
  return data;
}

async function getPost(postid) {
  let data = null;
  await Post.findById(postid)
    .exec()
    .then((mongoData) => {
      data = mongoData;
    })
    .catch((err) => {
      console.log("Error:" + err);
    });
  return data;
}

async function likePost(likedPostID, likedByUser) {
  // await Post.findByIdAndUpdate(likedPostID,{$inc: { likes: 1 }})
  let found;
  await Post.findByIdAndUpdate(likedPostID, { $inc: { likes: 1 } })
    .exec()
    .then((foundData) => (found = foundData));
  // console.log(found)
}

async function commentOnPost(commentedPostID, commentByUser, comment) {
  // await Post.findByIdAndUpdate(likedPostID,{$inc: { likes: 1 }})
  let found;
  let newComment = {
    user: commentByUser,
    message: comment,
    likes: 0,
  };
  await Post.findByIdAndUpdate(commentedPostID, {
    $push: { comments: newComment },
  })
    .exec()
    .then((foundData) => (found = foundData));
  // console.log(found)
}

async function searchPostsByCategory(category) {
  let data = [];
  await Post.find({ category })
    .exec()
    .then((mongoData) => {
      data = mongoData;
    })
    .catch((err) => {
      console.log("Error:", err);
    });
  return data;
}

// module.exports = Post;
module.exports = {
  addNewPost,
  getPosts,
  getPost,
  likePost,
  commentOnPost,
  searchPostsByCategory,
};
