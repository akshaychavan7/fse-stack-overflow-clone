const express = require("express");

const router = express.Router();

const User = require("../models/users");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");

const { preprocessing } = require("../utils/textpreprocess")

const { authorization } = require("../server");


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

// add appropriate HTTP verbs and their endpoints to the router

router.post('/viewFlaggedQuestions', viewFlaggedQuestions);
router.post('/viewFlaggedAnswers', viewFlaggedAnswers);
router.post('/viewFlaggedComments', viewFlaggedComments);

module.exports = router;