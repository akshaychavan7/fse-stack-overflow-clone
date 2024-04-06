const express = require("express");
const Answer = require("../models/answers");
const Question = require("../models/questions");
const { preprocessing } = require("../utils/textpreprocess");

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
    res.status(200);
    let qid = preprocessing(req.body.qid);
    await Question.findOneAndUpdate(
      { _id: qid },
      { $push: { answers: { $each: [newanswer._id], $position: 0 } } },
      { new: true }
    );
    res.json(newanswer);
  }
  catch (err) {
    res.status(500);
    res.json({ 'error': `Answer could not be added: ${err}` });
  }
};

// add appropriate HTTP verbs and their endpoints to the router.
router.post("/addAnswer", addAnswer);

module.exports = router;
