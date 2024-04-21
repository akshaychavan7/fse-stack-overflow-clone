const express = require("express");
const Answer = require("../models/answers");
const Question = require("../models/questions");


const { ansDelete } = require("../utils/answer");
const sanitizeParams = require("../middleware/sanitizeParams");
const {
  authorization,
  adminAuthorization,
} = require("../middleware/authorization");
const { preprocessing, textfiltering } = require("../utils/textpreprocess");

const { ANSWERTYPE } = require("../utils/constants");

const { reportPost } = require("../utils/user");

const router = express.Router();

// Adding answer
// Method to add answer to a question.
const addAnswer = async (req, res) => {

  try {
    let flag = false;

    if (textfiltering(req.body.ans.description)) {
      flag = true;
    }
    let answer = await Answer.create({
      ...req.body.ans,
      ans_by: req.userId,
      flag: flag
      // ans_date_time: new Date(),
      // Note: check if this is required or no since in DB already setting Date.now
    });

    let qid = req.body.qid;
    await Question.findOneAndUpdate(
      { _id: qid },
      { $push: { answers: { $each: [answer._id], $position: 0 } } },
      { new: true }
    );
    return res.status(200).json(answer);
  }
  catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }

};

const getReportedAnswers = async (req, res) => {
  try {
    let answers = await Answer.find({ flag: true }).populate({
      path: "ans_by",
      select: "username firstname lastname profilePic",
    });
    return res.status(200).json(answers);
  } catch (error) {
    return res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

const reportAnswer = async (req, res) => {
  try {
    let answer = await Answer.exists({ _id: req.body.aid });
    if (!answer) {
      return res.status(404).send({ status: 404, message: "Answer not found" });
    }

    let report = await reportPost(req.body.aid, ANSWERTYPE);
    let message;
    if (report) {
      message = "Answer reported successfully.";
    }
    else {
      message = "Successfully removed report from answer."
    }
    return res
      .status(200)
      .send({ status: 200, message: message, reportBool: report });
  } catch (error) {
    return res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

const resolveAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.params.answerId);
    let answer = await Answer.exists({ _id: aid });
    if (!answer) {
      return res.status(404).send("Answer not found");
    }

    await Answer.findByIdAndUpdate(
      aid,
      { flag: false },
      { new: true }
    );
    return res.status(200).send("Answer resolved successfully");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

const deleteAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.params.answerId);
    
    let question = await Question.exists({answers: aid})
    if(!question) {
      return res.status(404).send("Question of the answer not found");
    }
    question = await Question.findOne({answers: aid});
    let answer = await Answer.exists({ _id: aid });
    if (!answer) {
      return res.status(404).send("Answer not found");
    }
  
    let response = await ansDelete(question._id.toString(), aid);
    return res.status(response.status).send(response.message);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

// add appropriate HTTP verbs and their endpoints to the router.
router.get(
  "/getReportedAnswers",
  adminAuthorization,
  sanitizeParams,
  getReportedAnswers
);
router.post("/addAnswer", authorization, sanitizeParams, addAnswer);
router.post("/reportAnswer/", authorization, sanitizeParams, reportAnswer);
router.post(
  "/resolveAnswer/:answerId",
  adminAuthorization,
  sanitizeParams,
  resolveAnswer
);
router.delete(
  "/deleteAnswer/:answerId",
  adminAuthorization,
  sanitizeParams,
  deleteAnswer
);

module.exports = router;
