const express = require("express");
const Question = require("../models/questions");
const {
  addTag,
  getQuestionsByOrder,
  filterQuestionsBySearch,
} = require("../utils/question");

const { preprocessing } = require("../utils/textpreprocess")

const router = express.Router();

// To get Questions by Filter
const getQuestionsByFilter = async (req, res) => {
  try {
    let qList = await getQuestionsByOrder(req.query.order);

    let filteredQuestionsList = filterQuestionsBySearch(
      qList,
      req.query.search
    );
    res.status(200);
    res.json(filteredQuestionsList);
  } catch (err) {
    res.json({ error: "Something went wrong", details: err.message });
  }
};

// To get Questions by Id
const getQuestionById = async (req, res) => {
  try {
    let question = await Question.findOneAndUpdate(
      { _id: preprocessing(req.params.questionId) },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("answers");
    res.status(200);
    res.json(question);
  } catch (err) {
    res.status(500);
    res.json({});
  }
};

// To add Question to database
const addQuestion = async (req, res) => {
  try {
    let tags = await Promise.all(
      req.body.tags.map(async (tag) => {
        return await addTag(preprocessing(tag));
      })
    );
    let question = await Question.create({
      title: preprocessing(req.body.title),
      description: preprocessing(req.body.description),
      asked_by: preprocessing(req.body.asked_by),
      ask_date_time: preprocessing(req.body.ask_date_time),
      tags: tags,
    });
    res.json(question);
  }
  catch (err) {
    res.status(500);
    res.json({ 'error': `Question could not be added: ${err}` });
  }
};

// add appropriate HTTP verbs and their endpoints to the router

router.get("/getQuestion", getQuestionsByFilter);
router.get("/getQuestionById/:questionId", getQuestionById);
router.post("/addQuestion", addQuestion);

module.exports = router;
