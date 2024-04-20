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
    await updateReputation(
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

    await updateReputation(
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
