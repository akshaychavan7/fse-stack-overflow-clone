const express = require("express");
const User = require("../models/users");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");

const { preprocessing } = require("../utils/textpreprocess");

const authorization = require("../middleware/authorization");

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

const ownUserDetails = async (req, res) => {
  try {
    let user = await User.findOne({ _id: preprocessing(req.userId) });
    // add authorization instead of this and authentication based on that.
    if (!user) {
      res.status(401).json({ error: `User not authorized.` });
    }
    let udetails = {
      username: user["username"],
      firstname: user["firstname"],
      lastname: user["lastname"],
      joiningDate: user["joiningDate"],
      profilePic: user["profilePic"],
      userRole: user["userRole"],
      reputation: user["reputation"],
    };
    res.status(200).json({ userDetails: udetails });
  } catch (err) {
    res.status(500).json({ error: `Error in fetching user details : ${err}` });
  }
};

const otherUserDetails = async (req, res) => {
  try {
    let user = await User.findOne({
      username: preprocessing(req.params.username),
    });
    let udetails = {
      username: user["username"],
      firstname: user["firstname"],
      lastname: user["lastname"],
      joiningDate: user["joiningDate"],
      profilePic: user["profilePic"],
      userRole: user["userRole"],
      reputation: user["reputation"],
    };
    res.status(200).json({ userDetails: udetails });
  } catch (err) {
    res.status(500).json({ error: `Error in fetching user details : ${err}` });
  }
};

const getQuestionsByUser = async (uid) => {
  try {
    let questions = await Question.find({ asked_by: preprocessing(uid) })
      .populate({ path: "asked_by", select: "username -_id" })
      .populate("tags")
      .populate("answers")
      .populate("comments")
      .populate("upvoted_by")
      .populate("downvoted_by")
      .exec();

    return questions;
  } catch (err) {
    return Error(`Error in extracting questions: ${err}`);
  }
};

const getAnswersByUser = async (uid) => {
  try {
    let answers = await Answer.find({ ans_by: preprocessing(uid) })
      .populate({ path: "ans_by", select: "username -_id" })
      .populate("comments")
      .populate("upvoted_by")
      .populate("downvoted_by")
      .exec();

    return answers;
  } catch (err) {
    return Error(`Error in extracting answers: ${err}`);
  }
};

const getCommentsByUser = async (uid) => {
  try {
    let comments = await Comment.find({ commented_by: preprocessing(uid) })
      .populate({ path: "commented_by", select: "username -_id" })
      .populate("upvoted_by")
      .exec();

    return comments;
  } catch (err) {
    return Error(`Error in extracting comments: ${err}`);
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

router.post("/getUsersList", authorization, getUsersList);
router.get("/ownUserDetails", authorization, ownUserDetails);
router.get("/otherUserDetails/:username", otherUserDetails);
router.get("/getUserPosts", authorization, getUserPosts);

module.exports = router;
