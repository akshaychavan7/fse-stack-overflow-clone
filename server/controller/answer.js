const express = require("express");
const Answer = require("../models/answers");
const Question = require("../models/questions");
const User = require("../models/users");
const { preprocessing } = require("../utils/textpreprocess");

const {
  removeDownvote,
  removeUpvote,
  addDownvote,
  addUpvote
} = require("../utils/answer");

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
    })
    let qid = preprocessing(req.body.qid);
    await Question.findOneAndUpdate(
      { _id: qid },
      { $push: { answers: { $each: [newanswer._id], $position: 0 } } },
      { new: true }
    );
    res.status(200);
    res.json(newanswer);
  }
  catch (err) {
    res.status(500);
    res.json({ 'error': `Answer could not be added: ${err}` });
  }
};

// To upvote a answer
const upvoteAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.body.aid);
    let uid = preprocessing(req.body.uid);
    let user = User.findOne({ _id: uid });
    if (!user) {
      res.status(404).json({ 'error': `Unauthorized access: Unidentified userid.` });
    }
    let answer = await Answer.findOne({ _id: aid });
    if (!answer) {
      res.status(404).json({ 'error': `Unauthorized access: Unidentified answerid.` });
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
      res.status(200).json({'msg': "Removed previous upvote of user", 'upvote': false});
    }
    else {
      addUpvote(aid, uid);
      res.status(200).json({'msg': "Upvoted for the user", 'upvote': true});
    }
  }
  catch (err) {
    res.status(500).json({ 'error': `Answer could not be upvoted at this time: ${err}` })
  }
}


// To downvote a answer
const downvoteAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.body.aid);
    let uid = preprocessing(req.body.uid);
    let user = User.findOne({ _id: uid });
    if (!user) {
      res.status(404).json({ 'error': `Unauthorized access: Unidentified userid.` });
    }
    let answer = await Answer.findOne({ _id: aid });
    if (!answer) {
      res.status(404).json({ 'error': `Unauthorized access: Unidentified answerid.` });
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
      res.status(200).json({'msg': "Removed previous downvote of user", 'downvote': false});

    }
    else {
      addDownvote(aid, uid);
      res.status(200).json({'msg': "Downvoted for the user", 'downvote': true});
    }
  }
  catch (err) {
    res.status(500).json({ 'error': `Answer could not be downvoted at this time: ${err}` });
  }
}

// To get vote count of answer.
const getVoteCountAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.params.answerId);
    let answer = await Answer.findOne({ _id: aid });
    if (!answer) {
      res.status(404).json({ 'error': `Unauthorized access: Unidentified answerid.` });
    }
    res.status(200).json({"vote_count": answer.vote_count});
  }
  catch (err) {
    res.status(500).json({ 'error': `Cannot fetch vote count of answer: ${err}` });
  }
}


// add appropriate HTTP verbs and their endpoints to the router.
router.post("/addAnswer", addAnswer);
router.post("/upvoteAnswer", upvoteAnswer);
router.post("/downvoteAnswer", downvoteAnswer)
router.get("/getVoteCountAnswer/:answerId", getVoteCountAnswer)

module.exports = router;
