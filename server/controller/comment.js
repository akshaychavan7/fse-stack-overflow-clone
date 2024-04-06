const express = require("express");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");

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

// add appropriate HTTP verbs and their endpoints to the router.
router.post("/addQuestionComment", addQuestionComment);
router.post("/addAnswerComment", addAnswerComment);

module.exports = router;