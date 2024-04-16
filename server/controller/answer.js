const express = require("express");
const Answer = require("../models/answers");
const Question = require("../models/questions");
const User = require("../models/users");
const {
  authorization,
  adminAuthorization,
} = require("../middleware/authorization");
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
  let answer = await Answer.create({
    ...req.body.ans,
    ans_by: req.userId,
    ans_date_time: new Date(),
  });
  res.status(200);
  let qid = req.body.qid;
  await Question.findOneAndUpdate(
    { _id: qid },
    { $push: { answers: { $each: [answer._id], $position: 0 } } },
    { new: true }
  );
  res.json(answer);
};

const getReportedAnswers = async (req, res) => {
  try {
    let answers = await Answer.find({ flag: true }).populate({
      path: "ans_by",
      select: "username firstname lastname profilePic",
    });
    res.status(200).json(answers);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

// To upvote a answer
const upvoteAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.body.aid);
    let uid = preprocessing(req.userId);
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
      await updateReputation(false, answer["ans_by"].toString());
      res
        .status(200)
        .json({ message: "Removed previous upvote of user", upvote: false });
    } else {
      addUpvote(aid, uid);
      await updateReputation(true, answer["ans_by"].toString());
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

// To flag or unflag an answer.
const flagAnswer = async (req, res) => {
  try {
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

const reportAnswer = async (req, res) => {
  try {
    let answer = await Answer.exists({ _id: req.body.aid });
    if (!answer) {
      return res.status(404).send({ status: 404, message: "Answer not found" });
    }

    await Answer.findByIdAndUpdate(req.body.aid, { flag: true }, { new: true });
    res.status(200).send({ status: 200, message: "Answer reported" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

const resolveAnswer = async (req, res) => {
  try {
    let answer = await Answer.exists({ _id: req.params.answerId });
    if (!answer) {
      return res.status(404).send("Answer not found");
    }

    await Answer.findByIdAndUpdate(
      req.params.answerId,
      { flag: false },
      { new: true }
    );
    res.status(200).send("Answer resolved successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteAnswer = async (req, res) => {
  try {
    let answer = await Answer.exists({ _id: req.params.answerId });
    if (!answer) {
      return res.status(404).send("Answer not found");
    }

    await Answer.findByIdAndDelete(req.params.answerId);
    res.status(200).send("Answer deleted successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// add appropriate HTTP verbs and their endpoints to the router.
router.get("/getReportedAnswers", adminAuthorization, getReportedAnswers);
router.post("/addAnswer", authorization, addAnswer);
router.post("/reportAnswer/", authorization, reportAnswer);
router.post("/resolveAnswer/:answerId", adminAuthorization, resolveAnswer);
router.delete("/deleteAnswer/:answerId", adminAuthorization, deleteAnswer);

module.exports = router;
