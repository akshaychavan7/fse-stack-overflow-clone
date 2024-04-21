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

    return res.status(200).json({ status: 200, body: comment });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ status: 500, message: "Internal Server Error" });
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

const getReportedComments = async (req, res) => {
  try {
    let comments = await Comment.find({ flag: true }).populate({
      path: "commented_by",
      select: "username firstname lastname profilePic",
    });
    return res.status(200).json(comments);
  } catch (error) {
    // console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const deleteComment = async (req, res) => {
  try {
    let cid = preprocessing(req.params.commentId);
    let parentType;

    let question = await Question.exists({comments: cid});
    let answer = await Answer.exists({comments: cid});
    let parentObj;
    if(question) {
      parentObj = await Question.findOne({comments: cid});
      parentType = constants.QUESTIONTYPE;
    }
    else if(answer) {
      parentObj = await Answer.findOne({comments: cid});
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
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

router.get("/getReportedComments", authorization, getReportedComments);
router.post("/addComment", authorization, sanitizeParams, addComment);
router.post("/reportComment", authorization, sanitizeParams, reportComment);
router.delete(
  "/deleteComment/:commentId",
  adminAuthorization,
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
