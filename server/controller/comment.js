const express = require("express");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");
const sanitizeParams = require("../middleware/sanitizeParams");
const router = express.Router();
const { reportPost } = require("../utils/user");
const {
  QUESTIONTYPE,
  ANSWERTYPE,
  COMMENTTYPE,
  constants,
} = require("../utils/constants");
const { preprocessing, textfiltering } = require("../utils/textpreprocess");

const {
  authorization,
  adminAuthorization,
} = require("../middleware/authorization");
const { validateId } = require("../utils/validator");

const addComment = async (req, res) => {
  try {
    let flag = false;

    if (textfiltering(req.body.description)) {
      flag = true;
    }
    let comment = await Comment.create({
      description: req.body.description,
      commented_by: req.userId,
      flag: flag,
      // comment_date_time: new Date(),
      // not needed since internally date created for comment schema
    });

    let parentId = req.body.parentId;
    let parentType = req.body.parentType;

    if (!validateId(parentId)) {
      return res
        .status(400)
        .send({ status: 400, message: "Invalid parent id" });
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

    res.status(200).json({ status: 200, body: comment });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

const reportComment = async (req, res) => {
  try {
    let comment = await Comment.exists({ _id: req.body.cid });
    if (!comment) {
      return res
        .status(404)
        .send({ status: 404, message: "Comment not found" });
    }
    let report = await reportPost(req.body.cid, COMMENTTYPE);
    let message;
    if (report) {
      message = "Comment reported successfully.";
    } else {
      message = "Successfully removed report from comment.";
    }
    res.status(200).send({ status: 200, message: message, reportBool: report });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
};

const getReportedComments = async (req, res) => {
  try {
    let comments = await Comment.find({ flag: true }).populate({
      path: "commented_by",
      select: "username firstname lastname profilePic",
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteComment = async (req, res) => {
  try {
    let cid = preprocessing(req.params.commentId);
    let comment = await Comment.exists({ _id: cid });
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    await Comment.findByIdAndDelete(cid);
    res.status(200).send("Comment deleted successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const resolveComment = async (req, res) => {
  try {
    let cid = preprocessing(req.params.commentId);
    let comment = await Comment.exists({ _id: cid });
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    await Comment.findByIdAndUpdate(cid, { flag: false }, { new: true });
    res.status(200).send("Comment resolved successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

router.get("/getReportedComments", authorization, getReportedComments);
router.post("/addComment", authorization, sanitizeParams, addComment);
router.post("/reportComment", authorization, sanitizeParams, reportComment);
router.delete(
  "/deleteComment/:commentId",
  authorization,
  sanitizeParams,
  deleteComment
);
router.post(
  "/resolveComment/:commentId",
  adminAuthorization,
  sanitizeParams,
  resolveComment
);

module.exports = router;
