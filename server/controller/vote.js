const express = require("express");
const Comment = require("../models/comments");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const router = express.Router();
const { authorization } = require("../middleware/authorization");
const { validateId } = require("../utils/validator");
const sanitizeParams = require("../middleware/sanitizeParams");
const { updateUpvote, updateDownvote } = require("../utils/vote");
const { updateReputation } = require("../utils/user");
const { constants } = require("../utils/constants");

/**
 * Handles the upvoting of a post (question, answer, or comment).
 * 
 * This function allows users to upvote a post identified by its ID and type of object. Additionally, 
 * the reputation of the user who made the post is updated based on the upvote action. 
 * Finally, the updated status of the upvote, downvote, and vote count, along with a message indicating 
 * the success of the upvote action is returned. This function toggles the upvote value.
 * 
 * The callback function for the POST route vote/upvote.
 * 
 * @param {Object} req - The HTTP request object containing the ID and type of the post to be upvoted.
 * @param {Object} res - The HTTP response object used to send the upvote status and message.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the upvoting process.
 */
const upvote = async (req, res) => {
  try {
    var voteObject;
    var id = req.body.id;
    var voteType = req.body.type;

    if (!validateId(id)) {
      return res.status(400).send({ status: 400, message: "Invalid id" });
    }

    switch (voteType) {
      case constants.QUESTIONTYPE:
        voteObject = await Question;
        break;
      case constants.ANSWERTYPE:
        voteObject = await Answer;
        break;
      case constants.COMMENTTYPE:
        voteObject = await Comment;
        break;
      default:
        return res.status(400).send({ status: 400, message: "Invalid type" });
    }

    const obj = await voteObject.findById(id);
    if (!obj) {
      return res.status(404).send({ status: 404, message: "Object not found" });
    }

    let post_by;
    let result = await updateUpvote(voteObject, obj, req.userId, id);
    switch (voteType) {
      case constants.QUESTIONTYPE:
        post_by = obj.asked_by.toString();
        break;
      case constants.ANSWERTYPE:
        post_by = obj.ans_by.toString();
        break;
      case constants.COMMENTTYPE:
        post_by = obj.commented_by.toString();
        break;
    }
    let userrep = await updateReputation(
      result["upvote"],
      result["downvote"],
      post_by,
      "upvote"
    );
    res.status(200).send({
      status: 200,
      upvote: result["upvote"],
      downvote: result["downvote"],
      vote_count: result["vote_count"],
      message: result["message"],
    });
  } catch (error) {
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

/**
 * Handles the downvoting of a post (question, answer, or comment).
 * 
 * This function allows users to downvote a post identified by its ID and type of object. Additionally, 
 * the reputation of the user who made the post is updated based on the downvote action. 
 * Finally, the updated status of the upvote, downvote, and vote count, along with a message indicating 
 * the success of the downvote action is returned. This function toggles the downvote value.
 * 
 * The callback function for the POST route vote/downvote.
 * 
 * @param {Object} req - The HTTP request object containing the ID and type of the post to be downvoted.
 * @param {Object} res - The HTTP response object used to send the downvote status and message.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the upvoting process.
 */
const downvote = async (req, res) => {
  try {
    var voteObject;
    var id = req.body.id;
    var voteType = req.body.type;

    if (!validateId(id)) {
      return res.status(400).send({ status: 400, message: "Invalid id" });
    }

    switch (voteType) {
      case constants.QUESTIONTYPE:
        voteObject = await Question;
        break;
      case constants.ANSWERTYPE:
        voteObject = await Answer;
        break;
      case constants.COMMENTTYPE:
        voteObject = await Comment;
        break;
      default:
        throw new Error("Invalid type");
    }

    const obj = await voteObject.findById(id);
    if (!obj) {
      return res.status(404).send({ status: 404, message: "Object not found" });
    }

    let result = await updateDownvote(voteObject, obj, req.userId, id);

    let post_by;
    switch (voteType) {
      case constants.QUESTIONTYPE:
        post_by = obj.asked_by.toString();
        break;
      case constants.ANSWERTYPE:
        post_by = obj.ans_by.toString();
        break;
      case constants.COMMENTTYPE:
      post_by = obj.commented_by.toString();
      break;
    }

    let userrep = await updateReputation(
      result["upvote"],
      result["downvote"],
      post_by,
      "downvote"
    );

    res.status(200).send({
      status: 200,
      upvote: result["upvote"],
      downvote: result["downvote"],
      vote_count: result["vote_count"],
      message: result["message"],
    });
  } catch (error) {
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

router.post("/upvote", authorization, sanitizeParams, upvote);
router.post("/downvote", authorization, sanitizeParams, downvote);

module.exports = router;


// Note: refactor this code.