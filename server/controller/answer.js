const express = require("express");
const Answer = require("../models/answers");
const Question = require("../models/questions");
const User = require("../models/users");
const authorization = require("../middleware/authorization");
const { preprocessing } = require("../utils/textpreprocess");

const {
  removeDownvote,
  removeUpvote,
  addDownvote,
  addUpvote,
} = require("../utils/answer");

const { updateReputation } = require("../utils/user");

const router = express.Router();

// Adding answer
// Method to add answer to a question.
const addAnswer = async (req, res) => {
  try {
    let answer = req.body.ans;
    const newanswer = await Answer.create({
      description: preprocessing(answer.description),
      ans_by: preprocessing(answer.ans_by),
      ans_date_time: preprocessing(answer.ans_date_time),
    });
    let qid = preprocessing(req.body.qid);
    await Question.findOneAndUpdate(
      { _id: qid },
      { $push: { answers: { $each: [newanswer._id], $position: 0 } } },
      { new: true }
    );
    res.status(200);
    res.json(newanswer);
  } catch (err) {
    res.status(500);
    res.json({ error: `Answer could not be added: ${err}` });
  }
};

// To upvote a answer
const upvoteAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.body.aid);
    let uid = preprocessing(req.userId);
    let user = await User.findOne({ _id: uid });
    if (!user) {
      res
        .status(401)
        .json({ error: `Unauthorized access: Unidentified userid.` });
    }
    let answer = await Answer.findOne({ _id: aid });
    if (!answer) {
      res
        .status(404)
        .json({ error: `Unavailable resource: Unidentified answerid.` });
    }
    // If the user id is in the downvote list, remove that and update count.
    const checkUserDownvote = answer.downvoted_by.includes(uid);
    if (checkUserDownvote) {
      removeDownvote(aid, uid);
    }
    // If the user id is in the upvote list, remove that and update count else upvote.
    const checkUserUpvote = answer.upvoted_by.includes(uid);
    if (checkUserUpvote) {
      removeUpvote(aid, uid);
      await updateReputation(false, answer['ans_by'].toString());
      res
        .status(200)
        .json({ message: "Removed previous upvote of user", upvote: false });
    } else {
      addUpvote(aid, uid);
      await updateReputation(true, answer['ans_by'].toString());
      res.status(200).json({ message: "Upvoted for the user", upvote: true });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: `Answer could not be upvoted at this time: ${err}` });
  }
};

// To downvote a answer
const downvoteAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.body.aid);
    let uid = preprocessing(req.userId);
    let user = await User.findOne({ _id: uid });
    if (!user) {
      res
        .status(401)
        .json({ error: `Unauthorized access: Unidentified userid.` });
    }
    let answer = await Answer.findOne({ _id: aid });
    if (!answer) {
      res
        .status(404)
        .json({ error: `Unavailable resource: Unidentified answerid.` });
    }
    // If the user id is in the upvote list, remove that and update count.
    const checkUserUpvote = answer.upvoted_by.includes(uid);
    if (checkUserUpvote) {
      removeUpvote(aid, uid);
    }
    // If the user id is in the downvote list, remove that and update count else downvote.
    const checkUserDownvote = answer.downvoted_by.includes(uid);
    if (checkUserDownvote) {
      removeDownvote(aid, uid);
      res
        .status(200)
        .json({ msg: "Removed previous downvote of user", downvote: false });
    } else {
      addDownvote(aid, uid);
      res.status(200).json({ msg: "Downvoted for the user", downvote: true });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: `Answer could not be downvoted at this time: ${err}` });
  }
};

// To get vote count of answer.
const getVoteCountAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.params.answerId);
    let answer = await Answer.findOne({ _id: aid });
    if (!answer) {
      res
        .status(404)
        .json({ error: `Unavailable resource: Unidentified answerid.` });
    }
    res.status(200).json({ vote_count: answer.vote_count });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Cannot fetch vote count of answer: ${err}` });
  }
};

// To flag or unflag an answer.
const flagAnswer = async (req, res) => {
  try {
    let uid = preprocessing(req.userId);
    let user = await User.findOne({ _id: uid });
    if (!user) {
      res
        .status(401)
        .json({ error: `Unauthorized access: Unidentified userid.` });
    }
    let answer = await Answer.findOne({ _id: preprocessing(req.body.aid) });
    if (!answer) {
      res
        .status(404)
        .json({ error: `Unavailable resource: Unidentified answerid.` });
    }
    answer.flag = !answer.flag;
    await answer.save();
    if (!answer.flag) {
      res.status(200).json({ message: "Unflagged answer from review." });
    } else {
      res.status(200).json({ message: "Flagged answer for review." });
    }
  } catch (err) {
    res.status(500).json({ error: `Cannot fetch flagged answer: ${err}` });
  }
};

// add appropriate HTTP verbs and their endpoints to the router.
router.post("/addAnswer", addAnswer);
router.post("/upvoteAnswer", authorization, upvoteAnswer);
router.post("/downvoteAnswer", authorization, downvoteAnswer)
router.get("/getVoteCountAnswer/:answerId", getVoteCountAnswer)
router.post("/flagAnswer", authorization, flagAnswer);

module.exports = router;
