const express = require("express");
const app = express();
const User = require("./models/User");

app.listen(3006, () => console.log("listening at port 3006"));

//serve unspecified static pages from our public dir
app.use(express.static("public"));
//make express middleware for json available
app.use(express.json());

//allows us to process post info in urls
app.use(express.urlencoded({ extended: false }));

const path = require("path");

//multer allows processing multipart forms with images
const multer = require("multer");

const upload = multer({ dest: "./public/uploads/" });

//consts to hold expiry times in ms
const threeMins = 1000 * 60 * 3;
const oneHour = 1000 * 60 * 60;

//use the sessions module and the cookie parser module
const sessions = require("express-session");
const cookieParser = require("cookie-parser");

//make cookie parser middleware available
app.use(cookieParser());

//load mongoose module and connect to MongoDB instance and database
require("dotenv").config();
const mongoDBPassword = process.env.MYMONGOPASSWORD;

const mongoose = require("mongoose");
mongoose.connect(`mongodb+srv://CCO6005-07:${mongoDBPassword}@cluster0.lpfnqqx.mongodb.net/JoeNewApp?retryWrites=true&w=majority`);

//importing our own node module
const users = require("./models/User");

//load our Post model
const postData = require("./models/Post");

//test that user is logged in with a valid session
function checkLoggedIn(request, response, nextAction) {
  if (request.session) {
    if (request.session.userid) {
      nextAction();
    } else {
      request.session.destroy();
      return response.redirect("/notloggedin.html");
    }
  }
}

app.use(cookieParser());

//load sessions middleware, with some config
app.use(
  sessions({
    secret: "joes secret",
    saveUninitialized: true,
    cookie: { maxAge: oneHour },
    resave: false,
  })
);

//controller for the main app view, depends on user logged in state
app.get("/app", checkLoggedIn, (request, response) => {
  response.sendFile(path.resolve(__dirname,'views/pages/viewposts.html')) //to make sure the user cant access the page without being logged in
});

app.get("/categories.html", checkLoggedIn, (request, response) => {
    response.sendFile(path.resolve(__dirname,'views/pages/categories.html')) //to make sure the user cant access the page without being logged in
    });

app.get("/profile.html", checkLoggedIn, (request, response) => {
    response.sendFile(path.resolve(__dirname,'views/pages/profile.html')) //to make sure the user cant access the page without being logged in
    });

app.get("/welcomepage.html", checkLoggedIn, (request, response) => {
    response.sendFile(path.resolve(__dirname,'views/pages/welcomepage.html')) //to make sure the user cant access the page without being logged in
    });
    


//--------------------- login and logout controllers -------------------//

app.post("/logout", async (request, response) => {
  await users.setLoggedIn(request.session.userid, false);
  request.session.destroy();
  await console.log(users.getUsers());
  response.redirect("./loggedout.html");
});

//controller for login
app.post("/login", async (request, response) => {
  console.log(request.body);
  let userData = request.body;
  console.log(userData);

  if (await User.findUser(userData.username)) {
    console.log("user found");
    if (await User.checkPassword(userData.username, userData.password)) {
      console.log("password matches");
      request.session.userid = userData.username; //something wrong with this line
      await users.setLoggedIn(userData.username, true);
      response.redirect("/welcomepage.html");
    } else {
      console.log("password wrong");
      response.redirect("/loginfailed.html"); //change to application to get through
    }
  } else {
    console.log("no such user");
    response.redirect("/loginfailed.html"); //change to application to get through
  }
});


//------------------ new code ------------------//
app.get("/welcomepage.html", checkLoggedIn, (request, response) => {});





app.post("/newpost", upload.single("myImage"), async (request, response) => {
  console.log(request.file);
  let filename = null;
  if (request.file && request.file.filename) {
    //check that a file was passes with a valid name
    filename = "uploads/" + request.file.filename;
  }
  await postData.addNewPost(request.session.userid, request.body, filename);
  response.redirect("/viewposts.html");
});

// async/await version of /getposts controller using Mongo
app.get("/getposts", async (request, response) => {
  response.json(
    { posts: await postData.getPosts(5) } // number of posts that will be retrieved
  );
});

//controller for handling a post being liked
app.post("/like", async (request, response) => {
  //function to deal with a like button being pressed on a post
  likedPostID = request.body.likedPostID;
  likedByUser = request.session.userid;
  await postData.likePost(likedPostID, likedByUser);
  // console.log(likedByUser+" liked "+likedPostID)
  response.json({ posts: await postData.getPosts(5) });
});

app.post("/comment", async (request, response) => {
  //function to deal with a like button being pressed on a post
  let commentedPostID = request.body.postid;
  let comment = request.body.message;
  let commentByUser = request.session.userid;
  await postData.commentOnPost(commentedPostID, commentByUser, comment);
  // response.json({post: await postData.getPost(commentedPostID)})
  response.redirect("/viewposts.html");
});

// controller for getting posts by category by searching --------------------

app.get("/search", (req, res) => {
  const category = req.query.category;

  postData
    .searchPostsByCategory(category)
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while searching for posts." });
    });
});

// --------------------------- cats ---------------------------------------

app.get("/search", (req, res) => {
  const category = "cats";

  postData
    .searchPostsByCategory(category)
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while searching for posts." });
    });
});

app.post("/like", (req, res) => {
  const likedPostID = req.body.likedPostID;
  const category = req.body.category;

  // Update the likes for the post with the given ID and category filter
  postData
    .likePostByID(likedPostID, category)
    .then(() => {
      // After updating the likes, retrieve the updated posts within the category
      return postData.searchPostsByCategory(category);
    })
    .then((posts) => {
      res.json({ posts });
    })
    .catch((error) => {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the like." });
    });
});

// ------------------------------------------------------------------------
// better update bio bit

app.post("/updatebio", async (req, res) => {
  console.log(req.file);
  let filename = null;
  if (req.file && req.file.filename) {
    //check that a file was passes with a valid name
    filename = "uploads/" + req.file.filename;
  }
  await users.updateBio(req.session.userid, req.body, filename);
  res.redirect("/profile.html");
});

//--------------------------------------------------------------------------

app.post("/getonepost", async (request, response) => {
  // console.log(request.file)
  let postid = request.body.post;
  console.log(request.body);
  response.json({ post: await postData.getPost(request.body.post) });
});

//controller for registering a new user
app.post("/register", async (request, response) => {
  console.log(request.body);
  let userData = request.body;
  // console.log(userData.username)
  if (await users.findUser(userData.username)) {
    console.log("user exists");
    response.json({
      status: "failed",
      error: "user exists",
    });
  } else {
    users.newUser(userData.username, userData.password);
    response.redirect("/login.html");
  }
  console.log(users.getUsers());
});

module.exports = app;
