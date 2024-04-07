const express = require("express");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");
const User = require("../models/users");

const {
    removeUpvote,
    addUpvote
} = require("../utils/comment");

const { preprocessing } = require("../utils/textpreprocess")

const router = express.Router();

// To add question comments to the database.
const addQuestionComment = async (req, res) => {
    try {
        let comment = req.body.comment;
        let qid = preprocessing(req.body.qid);
        const newcomment = await Comment.create({
            description: preprocessing(comment.description),
            commented_by: preprocessing(comment.commented_by),
            comment_date_time: preprocessing(comment.comment_date_time),
        })
        res.status(200);
        await Question.findOneAndUpdate(
            { _id: qid },
            { $push: { comments: { $each: [newcomment._id], $position: 0 } } },
            { new: true }
        );
        res.json(newcomment);
    }
    catch (err) {
        res.status(500);
        res.json({ 'error': `Comment could not be added for the question: ${err}` });
    }
};


// To add answer comments to the database.
const addAnswerComment = async (req, res) => {
    try {
        let comment = req.body.comment;
        let aid = preprocessing(req.body.aid);
        const newcomment = await Comment.create({
            description: preprocessing(comment.description),
            commented_by: preprocessing(comment.commented_by),
            comment_date_time: preprocessing(comment.comment_date_time),
        })
        await Answer.findOneAndUpdate(
            { _id: aid },
            { $push: { comments: { $each: [newcomment._id], $position: 0 } } },
            { new: true }
        );
        res.status(200);
        res.json(newcomment);
    }
    catch (err) {
        res.status(500);
        res.json({ 'error': `Comment could not be added for the answer: ${err}` });
    }
};

// To upvote a answer
const upvoteComment = async (req, res) => {
    try {
        let cid = preprocessing(req.body.cid);
        let uid = preprocessing(req.body.uid);
        let user = User.findOne({ _id: uid });
        if (!user) {
            res.status(404).json({ 'error': `Unauthorized access: Unidentified userid.` });
        }
        let comment = await Comment.findOne({ _id: cid });
        if (!comment) {
            res.status(404).json({ 'error': `Unauthorized access: Unidentified commentid.` });
        }
        // If the user id is in the upvote list, remove that and update count else upvote.
        const checkUserUpvote = comment.upvoted_by.includes(uid);
        if (checkUserUpvote) {
            removeUpvote(cid, uid);
            res.status(200).json({'msg': "Removed previous upvote of user", 'upvote': false});
        }
        else {
            addUpvote(cid, uid);
            res.status(200).json({'msg': "Upvoted for the user", 'upvote': true});
        }
    }
    catch (err) {
        res.status(500).json({ 'error': `Answer could not be upvoted at this time: ${err}` });
    }
}

// To get vote count of comment.
const getVoteCountComment = async (req, res) => {
    try {
      let cid = preprocessing(req.params.commentId);
      let comment = await Comment.findOne({ _id: cid });
      if (!comment) {
        res.status(404).json({ 'error': `Unauthorized access: Unidentified commentid.` });
      }
      res.status(200).json({"vote_count": comment.vote_count});
    }
    catch (err) {
      res.status(500).json({ 'error': `Cannot fetch vote count of comment: ${err}` });
    }
  }

// add appropriate HTTP verbs and their endpoints to the router.
router.post("/addQuestionComment", addQuestionComment);
router.post("/addAnswerComment", addAnswerComment);
router.post("/upvoteComment", upvoteComment);
router.get("/getVoteCountComment/:commentId", getVoteCountComment)

module.exports = router;