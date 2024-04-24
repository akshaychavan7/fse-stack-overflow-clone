const express = require("express");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");
const sanitizeParams = require("../middleware/sanitizeParams");
const router = express.Router();
const { commentDelete } = require("../utils/comment");
const { reportPost } = require("../utils/user");
const {
  constants,
} = require("../utils/constants");
const { preprocessing, textfiltering } = require("../utils/textpreprocess");

const {
  authorization,
  adminAuthorization,
} = require("../middleware/authorization");
const { validateId } = require("../utils/validator");

/**
 * Adds a comment and updates the corresponding parent object.
 * 
 * This function creates a comment in the database. 
 * It flags the comment if the description contains any profanity.
 * The associated parent object is updated with the comment id.
 * 
 * The callback function for the POST route comment/addComment.
 * 
 * @param {Object} req - The HTTP request object containing the comment data in the body.
 * @param {Object} res - The HTTP response object used to send the result of adding the comment.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the comment addition process.
 */
const addComment = async (req, res) => {
  try {
    let flag = textfiltering(req.body.description);
    let comment = await Comment.create({
      description: req.body.description,
      commented_by: req.userId,
      flag: flag,
    });

    let parentId = req.body.parentId;
    let parentType = req.body.parentType;

    if (!validateId(parentId)) {
      return res.status(400).send({ status: 400, message: "Invalid parent id" });
    }

    let parentModel;
    if (parentType === constants.QUESTIONTYPE) {
      parentModel = Question;
    } else if (parentType === constants.ANSWERTYPE) {
      parentModel = Answer;
    } else {
      return res.status(400).send({ status: 400, message: "Invalid parent" });
    }

    let parentObject = await parentModel.exists({ _id: parentId });

    if (!parentObject) {
      return res.status(404).send({ status: 404, message: "Parent not found" });
    }

    await parentModel.findByIdAndUpdate(
      parentId,
      { $push: { comments: { $each: [comment._id], $position: 0 } } },
      { new: true }
    );

    return res.status(200).json({ status: 200, body: comment });
  } catch (error) {
    return res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

/**
 * Flags a comment.
 * 
 * This function reports a comment identified by its ID.
 * It checks if the comment exists in the database, and if found,
 * it reports the comment using the 'reportPost' function.
 * It sends a success message indicating whether the comment was successfully reported or the report was removed.
 * 
 * The callback function for the POST route comment/reportComment.
 * 
 * @param {Object} req - The HTTP request object containing the comment ID in the body.
 * @param {Object} res - The HTTP response object used to send the result of reporting the comment.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the reporting process.
 */
const reportComment = async (req, res) => {
  try {
    let comment = await Comment.exists({ _id: req.body.cid });
    if (!comment) {
      return res
        .status(404)
        .send({ status: 404, message: "Comment not found" });
    }
    let report = await reportPost(req.body.cid, constants.COMMENTTYPE);
    let message;
    if (report) {
      message = "Comment reported successfully.";
    } else {
      message = "Successfully removed report from comment.";
    }
    return res.status(200).send({ status: 200, message: message, reportBool: report });
  } catch (error) {
    return res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

/**
 * Retrieves reported comments from the database.
 * 
 * This function retrieves comments that have been flagged as reported from the database.
 * It populates additional information about the comment's author, including their username,
 * firstname, lastname, and profile picture. Only accessible by the moderators.
 * 
 * The callback function for the GET route comment/getReportedComments.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object used to send the reported comments.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getReportedComments = async (req, res) => {
  try {
    let comments = await Comment.find({ flag: true }).populate({
      path: "commented_by",
      select: "username firstname lastname profilePic",
    });
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * Resolution of a false positive flag by the moderator.
 * 
 * This function resolves a comment by setting its flag status to false,
 * indicating that the reported issue has been resolved. Only accessible by
 * the moderators.
 * 
 * The callback function for the POST route comment/resolveComment.
 * 
 * @param {Object} req - The HTTP request object containing the comment ID in the URL parameters.
 * @param {Object} res - The HTTP response object used to send the result of resolving the comment.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the resolution process.
 */
const resolveComment = async (req, res) => {
  try {
    let cid = preprocessing(req.params.commentId);
    let comment = await Comment.exists({ _id: cid });
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    await Comment.findByIdAndUpdate(cid, { flag: false }, { new: true });
    return res.status(200).send("Comment resolved successfully");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * Deletes a comment.
 * 
 * This function deletes a comment identified by its ID.
 * It first determines the parent object of the comment,
 * validates the comment existence, and then deletes the comment.
 * Also updates the parent object's comments field.
 * Accessible only by the moderators.
 * 
 * The callback function for the DELETE route comment/deleteComment.
 * 
 * @param {Object} req - The HTTP request object containing the comment ID in the URL parameters.
 * @param {Object} res - The HTTP response object used to send the result of deleting the comment.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the deletion process.
 */
const deleteComment = async (req, res) => {
  try {
    let cid = preprocessing(req.params.commentId);
    let parentType;

    let question = await Question.exists({ comments: cid });
    let answer = await Answer.exists({ comments: cid });
    let parentObj;
    if (question) {
      parentObj = await Question.findOne({ comments: cid });
      parentType = constants.QUESTIONTYPE;
    }
    else if (answer) {
      parentObj = await Answer.findOne({ comments: cid });
      parentType = constants.ANSWERTYPE;
    }
    else {
      return res.status(404).send("Invalid parent id");
    }
    let comment = await Comment.exists({ _id: cid });
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    let parentId = parentObj._id.toString()
    let response = await commentDelete(parentId, parentType, cid);
    return res.status(response.status).send(response.message);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

router.post("/addComment", authorization, sanitizeParams, addComment);
router.post("/reportComment", authorization, sanitizeParams, reportComment);
router.get(
  "/getReportedComments",
  adminAuthorization,
  getReportedComments
);
router.post(
  "/resolveComment/:commentId",
  adminAuthorization,
  sanitizeParams,
  resolveComment
);
router.delete(
  "/deleteComment/:commentId",
  adminAuthorization,
  sanitizeParams,
  deleteComment
);

module.exports = router;
