const express = require("express");

const router = express.Router();

const User = require("../models/users");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");

const { preprocessing } = require("../utils/textpreprocess")

const { authorization } = require("../server");
const { route } = require("./question");


// Function to check if mod.
const checkMod = async (uid) => {
    try {
        let user = await User.findOne({ _id: uid });
        if (!user) {
            return false;
        }
        return !(user.userRole.localeCompare("moderator"));
    }
    catch (err) {
        return false;
    }
}
// Note: Find a better try catch maybe? Have to check again.

// View flagged questions.
const viewFlaggedQuestions = async (req, res) => {
    try {
        let modid = preprocessing(req.body.uid);
        if (await checkMod(modid)) {
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
        let modid = preprocessing(req.body.uid);
        if (await checkMod(modid)) {
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
        let modid = preprocessing(req.body.uid);
        if (await checkMod(modid)) {
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
        let modid = preprocessing(req.body.uid);
        let qid = preprocessing(req.body.qid);
        if(qid == "") {
            res.status(422).json({error: "Bad input received. Cannot receive empty qid."});
        }
        if (await checkMod(modid)) {
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

// Yet to solve this
// Delete flagged answer.
const deleteFlaggedAnswer = async (req, res) => {
    try {
        let modid = preprocessing(req.body.uid);
        let qid = preprocessing(req.body.qid);
        let aid = preprocessing(req.body.aid);
        if(qid == "" || aid == "") {
            res.status(422).json({error: "Bad input received. Cannot receive empty qid/aid."});
        }
        if (await checkMod(modid)) {
            await Question.updateOne(
                {_id: qid},
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
// Note: may have to store qid in answer to make it easier to delete and keep reference to question.

// Delete flagged comment.
const deleteFlaggedComment = async (req, res) => {
    try {
        let modid = preprocessing(req.body.uid);
        let qid = preprocessing(req.body.qid);
        let aid = preprocessing(req.body.aid);
        let cid = preprocessing(req.body.cid);
        if(qid != ""  && aid != "") {
            res.status(422).json({error: "Bad input received. Cannot receive both qid and aid."});
        }
        if(qid == "" && aid == "") {
            res.status(422).json({error: "Bad input received. Cannot receive both empty qid and aid."});
        }
        if(cid == "") {
            res.status(422).json({error: "Bad input received. Cannot receive both empty cid."});
        }
        if (await checkMod(modid)) {
            if(qid != "") {
                await Question.updateOne(
                    {_id: qid},
                    { $pull: { comments: {$eq: cid} } },
                    {new: true}
                );
            }
            else if(aid != "") {
                await Answer.updateOne(
                    {_id: aid},
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
// Note: may have to store qid and aid in comment to make it easier to delete and keep reference to question/answer.
// Note: Error comes when any 400 error is sent. Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client.

// add appropriate HTTP verbs and their endpoints to the router

router.post('/viewFlaggedQuestions', viewFlaggedQuestions);
router.post('/viewFlaggedAnswers', viewFlaggedAnswers);
router.post('/viewFlaggedComments', viewFlaggedComments);
router.post('/deleteFlaggedQuestion', deleteFlaggedQuestion);
router.post('/deleteFlaggedAnswer', deleteFlaggedAnswer);
router.post('/deleteFlaggedComment', deleteFlaggedComment);

module.exports = router;