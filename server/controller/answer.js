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

const { constants } = require("../utils/constants");

const { reportPost } = require("../utils/user");

const router = express.Router();

/**
 * Adds a new answer to a question.
 * 
 * This function handles the addition of a new answer to a question.
 * The answer is created and the corresponding question is updated with the
 * answer id.
 * The answer is flagged if description contains any profane content.
 * 
 * The callback function for the POST route /answer/addAnswer.
 * 
 * 
 * @param {Object} req - The HTTP request object containing the answer data and question id in the body.
 * @param {Object} res - The HTTP response object used to send the result of adding the answer.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the addition process.
 */
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

/**
 * Flags an answer.
 * 
 * This function reports an answer identified by its ID.
 * It checks if the answer exists in the database, and if found,
 * it reports the answer using the 'reportPost' function.
 * It sends a success message indicating whether the answer was successfully reported or the report was removed.
 * 
 * The callback function for the POST route /answer/reportAnswer.
 * 
 * @param {Object} req - The HTTP request object containing the answer ID in the body.
 * @param {Object} res - The HTTP response object used to send the result of reporting the answer.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the reporting process.
 */
const reportAnswer = async (req, res) => {
  try {
    let answer = await Answer.exists({ _id: req.body.aid });
    if (!answer) {
      return res.status(404).send({ status: 404, message: "Answer not found" });
    }

    let report = await reportPost(req.body.aid, constants.ANSWERTYPE);
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

/**
 * Retrieves flagged answers from the database.
 * 
 * This function retrieves answers that have been flagged as reported from the database.
 * It populates additional information about the answer's author, including their username,
 * firstname, lastname, and profile picture information.
 * 
 * The callback function for the GET route answer/getReportedAnswers.
 * 
 * @param {Object} req - The HTTP request object does not contain any body.
 * @param {Object} res - The HTTP response object used to send the reported answers.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
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

/**
 * Resolution of a false positive flag by the moderator.
 * 
 * This function resolves an answer by setting its flag status to false,
 * indicating that the reported issue has been resolved. Only accessible by
 * the moderators.
 * 
 * The callback function for the POST route answer/resolveAnswer.
 * 
 * @param {Object} req - The HTTP request object containing the answer ID in the URL parameters.
 * @param {Object} res - The HTTP response object used to send the result of resolving the answer.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the resolution process.
 */
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

/**
 * Deletes an answer.
 * 
 * This function deletes an answer identified by its ID.
 * It first checks if the associated question exists and if the answer itself exists.
 * If both the question and the answer are found, it deletes the answer and updates the question accordingly.
 * Accessible only by the moderators.
 * 
 * The callback function for the DELETE route answer/deleteAnswer.
 * 
 * @param {Object} req - The HTTP request object containing the answer ID in the URL parameters.
 * @param {Object} res - The HTTP response object used to send the result of deleting the answer.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the deletion process.
 */
const deleteAnswer = async (req, res) => {
  try {
    let aid = preprocessing(req.params.answerId);

    let question = await Question.exists({ answers: aid })
    if (!question) {
      return res.status(404).send("Question of the answer not found");
    }
    question = await Question.findOne({ answers: aid });
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

router.post("/addAnswer", authorization, sanitizeParams, addAnswer);
router.post("/reportAnswer/", authorization, sanitizeParams, reportAnswer);
router.get(
  "/getReportedAnswers",
  adminAuthorization,
  sanitizeParams,
  getReportedAnswers
);
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
