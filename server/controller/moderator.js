const express = require("express");

const router = express.Router();

const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");

const { preprocessing } = require("../utils/textpreprocess")

const authorization = require("../middleware/authorization");

// View flagged questions.
const viewFlaggedQuestions = async (req, res) => {
    try {
        console.log(req.userRole);
        let role = preprocessing(req.userRole);
        if (role == "moderator") {
            let questions = await Question.find({ flag: true }).sort({ ask_date_time: -1 });
            res.status(200).json({ flaggedQuestions: questions });

        }
        else {
            res.status(401).json({ error: `Unauthorized access to resource.` });
        }

    }
    catch (err) {
        res.status(500).json({ error: `Unable to view flagged questions: ${err}` });
    }
}

// View flagged answers.
const viewFlaggedAnswers = async (req, res) => {
    try {
        let role = preprocessing(req.userRole);
        if (role == "moderator") {
            let answers = await Answer.find({ flag: true }).sort({ ans_date_time: -1 });
            res.status(200).json({ flaggedAnswers: answers });
        }
        else {
            res.status(401).json({ error: `Unauthorized access to resource.` });
        }
    }
    catch (err) {
        res.status(500).json({ error: `Unable to view flagged answers: ${err}` });
    }
}

// View flagged comments.
const viewFlaggedComments = async (req, res) => {
    try {
        let role = preprocessing(req.userRole);
        if (role == "moderator") {
            let comments = await Comment.find({ flag: true }).sort({ comment_date_time: -1 });
            res.status(200).json({ flaggedComments: comments });
        }
        else {
            res.status(401).json({ error: `Unauthorized access to resource.` });
        }
    }
    catch (err) {
        res.status(500).json({ error: `Unable to view flagged comments: ${err}` });
    }
}

// Delete flagged question.
const deleteFlaggedQuestion = async (req, res) => {
    try {
        let role = preprocessing(req.userRole);
        let qid = preprocessing(req.body.qid);
        if(qid == "") {
            res.status(422).json({error: "Bad input received. Cannot receive empty qid."});
        }
        if (role == "moderator") {
            let question = await Question.findOne({_id: qid});
            for(let answer in question['answers']) {
                await Answer.deleteOne({_id: question['answers'][answer]});
            }
            for(let comment in question['comments']) {
                await Comment.deleteOne({_id: question['comments'][comment]});
            }
            await Question.deleteOne({_id: qid});
            res.status(200).json({ message: "Deleted flagged question." });
        }
        else {
            res.status(401).json({ error: `Unauthorized access to resource.` });
        }
    }
    catch(err) {
        res.status(500).json({ error: `Unable to delete flagged question: ${err}` });
    }
}

// Delete flagged answer.
const deleteFlaggedAnswer = async (req, res) => {
    try {
        let role = preprocessing(req.userRole);
        let aid = preprocessing(req.body.aid);
        if(aid == "") {
            res.status(422).json({error: "Bad input received. Cannot receive empty aid."});
        }
        if (role == "moderator") {
            let question = await Question.findOne({answers: aid});
            await Question.updateOne(
                {_id: question['_id'].toString()},
                { $pull: { answers: {$eq: aid} } },
                {new: true}
            );
            let answer = await Answer.findOne({_id: {$eq: aid}});
            for(let comment in answer['comments']) {
                await Comment.deleteOne({_id: answer['comments'][comment].toString()});
            }
            await Answer.deleteOne({_id: aid});
            res.status(200).json({ message: "Deleted flagged answer." });
        }
        else {
            res.status(401).json({ error: `Unauthorized access to resource.` });
        }
    }
    catch(err) {
        res.status(500).json({ error: `Unable to delete flagged answer: ${err}` });
    }
}

// Delete flagged comment.
const deleteFlaggedComment = async (req, res) => {
    try {
        let role = preprocessing(req.userRole);
        let cid = preprocessing(req.body.cid);
        if(cid == "") {
            res.status(422).json({error: "Bad input received. Cannot receive both empty cid."});
        }
        if (role == "moderator") {
            let question = await Question.findOne({comments: cid});
            let answer = await Answer.findOne({comments: cid});
            if(question) {
                await Question.updateOne(
                    {_id: question['_id'].toString()},
                    { $pull: { comments: {$eq: cid} } },
                    {new: true}
                );
            }
            else if(answer) {
                await Answer.updateOne(
                    {_id: answer['_id'].toString()},
                    { $pull: { comments: {$eq: cid} } },
                    {new: true}
                );
            }
            await Comment.deleteOne({_id: cid});
            res.status(200).json({ message: "Deleted flagged comment." });
        }
        else {
            res.status(401).json({ error: `Unauthorized access to resource.` });
        }
    }
    catch(err) {
        res.status(500).json({ error: `Unable to delete flagged comment: ${err}` });
    }
}
// Note: Shorten code

// add appropriate HTTP verbs and their endpoints to the router

router.get('/viewFlaggedQuestions', authorization, viewFlaggedQuestions);
router.get('/viewFlaggedAnswers', authorization, viewFlaggedAnswers);
router.get('/viewFlaggedComments', authorization, viewFlaggedComments);
router.post('/deleteFlaggedQuestion', authorization, deleteFlaggedQuestion);
router.post('/deleteFlaggedAnswer', authorization, deleteFlaggedAnswer);
router.post('/deleteFlaggedComment', authorization, deleteFlaggedComment);

module.exports = router;