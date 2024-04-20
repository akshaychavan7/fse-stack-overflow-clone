const express = require("express");
const User = require("../models/users");


const { preprocessing } = require("../utils/textpreprocess");

const { authorization } = require("../middleware/authorization");
const sanitizeParams = require("../middleware/sanitizeParams");

const {getQuestionsByUser, getAnswersByUser, getCommentsByUser} = require("../utils/user");

const router = express.Router();

// get list of all users
const getUsersList = async (req, res) => {
  let usersList = await User.find({});
  // remove password from the response
  usersList = usersList.map((user) => {
    return {
      username: user.username,
      name: user.firstname + " " + user.lastname,
      profilePic: user.profilePic,
      location: user.location,
      technologies: user.technologies,
    };
  });
  res.json(usersList);
};

const getUserDetails = async (req, res) => {
  try {
    let user = await User.findOne({
      username: preprocessing(req.params.username),
    });
    let questions = await getQuestionsByUser(user._id.toString());
    let answers = await getAnswersByUser(user._id.toString());
    let comments = await getCommentsByUser(user._id.toString());
    let udetails = {
      username: user["username"],
      firstname: user["firstname"],
      lastname: user["lastname"],
      joiningDate: user["joiningDate"],
      profilePic: user["profilePic"],
      userRole: user["userRole"],
      reputation: user["reputation"],
      location: user["location"],
      technologies: user["technologies"],
      questions: questions,
      answers: answers,
      comments: comments,
    };
    res.status(200).json({ userDetails: udetails });
  } catch (err) {
    res.status(500).json({ error: `Error in fetching user details : ${err}` });
  }
};

const getUserPosts = async (req, res) => {
  try {
    let uid = preprocessing(req.userId);
    let questions = await getQuestionsByUser(uid);
    let answers = await getAnswersByUser(uid);
    let comments = await getCommentsByUser(uid);

    res
      .status(200)
      .send({ questions: questions, answers: answers, comments: comments });
  } catch (err) {
    res.status(500).send(`Error in fetching user contributed posts: ${err}`);
  }
};
// have to make route to update user details.

router.post("/getUsersList", authorization, sanitizeParams, getUsersList);
router.get(
  "/getUserDetails/:username",
  authorization,
  sanitizeParams,
  getUserDetails
);
router.get("/getUserPosts", authorization, sanitizeParams, getUserPosts);

module.exports = router;
