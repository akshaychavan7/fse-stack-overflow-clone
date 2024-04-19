const express = require("express");
const Question = require("../models/questions");
const { reportPost } = require("../utils/user");
const sanitizeParams = require("../middleware/sanitizeParams");
const { preprocessing, textfiltering } = require("../utils/textpreprocess");
const {
  addTag,
  getQuestionsByOrder,
  filterQuestionsBySearch,
  showQuesUpDown,
  getTop10Questions,
} = require("../utils/question");

const {QUESTIONTYPE} = require("../utils/constants");

const router = express.Router();

const {
  authorization,
  adminAuthorization,
} = require("../middleware/authorization");
const { text } = require("body-parser");

// To get Questions by Filter
const getQuestionsByFilter = async (req, res) => {
  try {
    let questions = await getQuestionsByOrder(req.query.order);
    questions = filterQuestionsBySearch(questions, req.query.search);

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).send(`Internal Server Error ${error}`);
  }
};

// To get Questions by Id
const getQuestionById = async (req, res) => {
  try {
    let qid = preprocessing(req.params.questionId);
    let question = await Question.findOneAndUpdate(
      { _id: qid },
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate([{
        path: "answers",
        populate: [{
          path: "ans_by",
          select: "username firstname lastname profilePic",
        },
        {
          path: "comments",
          populate: {
            path: "commented_by",
            select: "username firstname lastname profilePic",
          },
        },
      ],
      options: { sort: { vote_count: -1 } },
      },
      { path: "asked_by", select: "-password" },
      { path: "tags"},
      {
        path: "comments",
        populate: {
          path: "commented_by",
          select: "username firstname lastname profilePic",
        },
        //sort by votes
        options: { sort: { vote_count: -1 } },
      }
    ])
    .exec();
    let jsonQuestion = JSON.stringify(question);
    jsonQuestion = showQuesUpDown(req.userId, question);
    res.status(200).json(jsonQuestion);
  } catch (err) {
    res.status(500);
    res.json({ error: "Something went wrong", details: err.message });
  }
};

// To add Question
const addQuestion = async (req, res) => {
  let tags = await Promise.all(
    req.body.tags.map(async (tag) => {
      return await addTag(tag);
    })
  );

  let flag = false;

  if(textfiltering(req.body.title) || textfiltering(req.body.description)) {
    flag = true;
  }

  let question = await Question.create({
    title: req.body.title,
    description: req.body.description,
    asked_by: req.userId,
    tags: tags,
    flag: flag
  });
  res.json(question);
};

const reportQuestion = async (req, res) => {
  try {
    let question = await Question.exists({ _id: req.body.qid });
    if (!question) {
      return res.status(404).send("Question not found");
    }

    let report = await reportPost(req.body.qid, QUESTIONTYPE);
    let message;
    if(report) {
      message = "Question reported successfully.";
    }
    else {
      message = "Successfully removed report from question."
    }
    res
      .status(200)
      .send({ status: 200, message: message, reportBool: report });
  } catch (error) {
    res.status(500).send({ status: 500, message: `Internal Server Error ${error}` });
  }
};

const getReportedQuestions = async (req, res) => {
  try {
    let questions = await Question.find({ flag: true }).populate({
      path: "asked_by",
      select: "username firstname lastname profilePic",
    });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    let qid = preprocessing(req.params.questionId);
    let question = await Question.exists({ _id: qid });
    if (!question) {
      return res.status(404).send("Question not found");
    }

    await Question.findByIdAndDelete(qid);
    res.status(200).send("Question deleted successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const getTrendingQuestions = async (req, res) => {
  try {
    let questions = await getTop10Questions();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: `Cannot fetch treding questions: ${err}` });
  }
};

const resolveQuestion = async (req, res) => {
  try {
    let qid = preprocessing(req.params.questionId);
    let question = await Question.exists({ _id: qid });
    if (!question) {
      return res.status(404).send("Question not found");
    }

    await Question.findByIdAndUpdate(
      qid,
      { flag: false },
      { new: true }
    );
    res.status(200).send("Question resolved successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// add appropriate HTTP verbs and their endpoints to the router

router.get("/getQuestion", authorization, getQuestionsByFilter);
router.get(
  "/getQuestionById/:questionId",
  authorization,
  getQuestionById
);
router.get("/getReportedQuestions", adminAuthorization, getReportedQuestions);
router.post("/addQuestion", authorization, sanitizeParams, addQuestion);
router.post("/reportQuestion/", authorization, sanitizeParams, reportQuestion);
router.post(
  "/resolveQuestion/:questionId",
  adminAuthorization,
  resolveQuestion
);
router.delete(
  "/deleteQuestion/:questionId",
  authorization,
  sanitizeParams,
  deleteQuestion
);
router.get("/getTrendingQuestions", getTrendingQuestions);

module.exports = router;
