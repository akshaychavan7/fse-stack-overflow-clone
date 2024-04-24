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
  questionDelete,
} = require("../utils/question");

const { constants } = require("../utils/constants");

const router = express.Router();

const {
  authorization,
  adminAuthorization,
} = require("../middleware/authorization");

/**
 * Retrieves questions filtered by order and search criteria.
 * 
 * This function retrieves questions from the database based on the specified order and search criteria.
 * 
 * This is the callback function for the GET route question/getQuestion.
 * 
 * @param {Object} req - The HTTP request object containing query parameters for order and search.
 * @param {Object} res - The HTTP response object used to send the filtered questions.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getQuestionsByFilter = async (req, res) => {
  try {
    let questions = await getQuestionsByOrder(preprocessing(req.query.order));
    questions = filterQuestionsBySearch(questions, preprocessing(req.query.search));

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).send(`Internal Server Error ${error}`);
  }
};

/**
 * Retrieves a question by its ID.
 * 
 * This function retrieves a question from the database based on the provided question ID.
 * It increments the view count of the question by 1 upon retrieval.
 * The retrieved question is populated with additional information such as 
 * populated answers, comments, tags, and user details.
 * 
 * The callback function for the GET route question/getQuestionById
 * 
 * @param {Object} req - The HTTP request object containing the question ID in the URL parameters.
 * @param {Object} res - The HTTP response object used to send the retrieved question.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getQuestionById = async (req, res) => {
  try {
    let qid = preprocessing(req.params.questionId);
    let question = await Question.findOneAndUpdate(
      { _id: qid },
      { $inc: { views: 1 } },
      { new: true }
    ).populate([{
        path: "answers",
        populate: [{ path: "ans_by", select: "username firstname lastname profilePic", },
        {
          path: "comments",
          populate: { path: "commented_by", select: "username firstname lastname profilePic", },
        },
        ],
        options: { sort: { vote_count: -1 } },
      },
      { path: "asked_by", select: "-password" },
      { path: "tags" },
      {
        path: "comments",
        populate: { path: "commented_by", select: "username firstname lastname profilePic", },
        //sort by votes
        options: { sort: { vote_count: -1 } },
      }
      ]).exec();
    let jsonQuestion = question.toJSON();
    jsonQuestion = await showQuesUpDown(req.userId, jsonQuestion);
    return res.status(200).json(jsonQuestion);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong", details: err.message })
  }
};

/**
 * Retrieves a list of trending top 10 questions.
 * 
 * This function retrieves the top 10 trending questions from the database.
 * Trending questions are determined based on number of views.
 * 
 * The callback function for the GET route question/getTrendingQuestions.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object used to send the trending questions.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getTrendingQuestions = async (req, res) => {
  try {
    let questions = await getTop10Questions();
    return res.status(200).json(questions);
  } catch (err) {
    return res.status(500).json({ error: `Cannot fetch trending questions: ${err}` });
  }
};

/**
 * Adds a new question.
 * 
 * This function adds a new question to the database. It first adds tags associated with the question
 * using the 'addTag' function. Then, it creates the question with the provided title, description,
 * and other details. If the title or the description contains profanity, it is flagged for 
 * moderator review.
 * 
 * The callback function of for the POST route question/addQuestion.
 * 
 * @param {Object} req - The HTTP request object containing the question details in the request body.
 * @param {Object} res - The HTTP response object used to send the result of adding the question.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the addition process.
 */
const addQuestion = async (req, res) => {
  try {
    let tags = await Promise.all(
      req.body.tags.map(async (tag) => {
        return await addTag(tag);
      })
    );

    let flag = false;

    if (textfiltering(req.body.title) || textfiltering(req.body.description)) {
      flag = true;
    }

    let question = await Question.create({
      title: req.body.title,
      description: req.body.description,
      asked_by: req.userId,
      tags: tags,
      flag: flag
    });
    return res.status(200).json(question);
  }
  catch (err) {
    return res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Flags a question.
 * 
 * This function reports a question identified by its ID. It checks if the question exists
 * in the database, and if found, it reports the question using the 'reportPost' function.
 * The reporting process involves marking the question as flagged or unflagged based on the report action.
 * 
 * The callback function for the POST route question/reportQuestion.
 * 
 * @param {Object} req - The HTTP request object containing the question ID in the request body.
 * @param {Object} res - The HTTP response object used to send the result of reporting the question.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the reporting process.
 */
const reportQuestion = async (req, res) => {
  try {
    let question = await Question.exists({ _id: req.body.qid });
    if (!question) {
      return res.status(404).send("Question not found");
    }

    let report = await reportPost(req.body.qid, constants.QUESTIONTYPE);
    let message;
    if (report) {
      message = "Question reported successfully.";
    }
    else {
      message = "Successfully removed report from question."
    }
    return res
      .status(200)
      .send({ status: 200, message: message, reportBool: report });
  } catch (error) {
    return res.status(500).send({ status: 500, message: `Internal Server Error ${error}` });
  }
};

/**
 * Retrieves reported questions.
 * 
 * This function retrieves questions that have been reported by users, indicating potential issues.
 * The retrieved questions are populated with additional information about the users who posted them.
 * Accessible only by the moderators.
 * 
 * The callback function for the GET route question/getReportedQuestions.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object used to send the reported questions.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getReportedQuestions = async (req, res) => {
  try {
    let questions = await Question.find({ flag: true }).populate({
      path: "asked_by",
      select: "username firstname lastname profilePic",
    });
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

/**
 * Resolution of a false positive flag by the moderator.
 * 
 * This function resolves a reported question by marking it as not flagged.
 * It first checks if the question exists in the database. If found, it updates the question's
 * 'flag' property to false, indicating that the question is no longer flagged.
 * Accessible only by the moderator.
 * 
 * The callback function for the POST route question/resolveQuestion.
 * 
 * @param {Object} req - The HTTP request object containing the question ID in the URL parameters.
 * @param {Object} res - The HTTP response object used to send the result of resolving the question.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the resolution process.
 */
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
    return res.status(200).send("Question resolved successfully");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * Deletes a question.
 * 
 * This function deletes a question identified by its ID. It first checks if the question exists
 * in the database. If the question is found, it proceeds to delete the question and its associated data.
 * Accessible only by the moderators.
 * 
 * The callback function for the DELETE route question/deleteQuestion.
 * 
 * @param {Object} req - The HTTP request object containing the question ID in the URL parameters.
 * @param {Object} res - The HTTP response object used to send the result of deleting the question.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the deletion process.
 */
const deleteQuestion = async (req, res) => {
  try {
    let qid = preprocessing(req.params.questionId);
    let question = await Question.exists({ _id: qid });
    if (!question) {
      return res.status(404).send("Question not found");
    }
    let response = await questionDelete(qid);
    return res.status(response.status).send(response.message);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};


router.get("/getQuestion", authorization, getQuestionsByFilter);
router.get("/getQuestionById/:questionId", authorization, getQuestionById);
router.get("/getTrendingQuestions", getTrendingQuestions);
router.post("/addQuestion", authorization, sanitizeParams, addQuestion);
router.post("/reportQuestion/", authorization, sanitizeParams, reportQuestion);
router.get(
  "/getReportedQuestions",
  adminAuthorization,
  getReportedQuestions);
router.post(
  "/resolveQuestion/:questionId",
  adminAuthorization,
  resolveQuestion
);
router.delete(
  "/deleteQuestion/:questionId",
  adminAuthorization,
  sanitizeParams,
  deleteQuestion
);

module.exports = router;
