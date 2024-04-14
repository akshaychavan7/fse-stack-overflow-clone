const express = require("express");
const Question = require("../models/questions");
const User = require("../models/users");
const authorization = require("../middleware/authorization");
const {
  addTag,
  getQuestionsByOrder,
  filterQuestionsBySearch,
  removeDownvote,
  removeUpvote,
  addDownvote,
  addUpvote,
  getTop10Questions,
  showQuesUpDown,
} = require("../utils/question");

const { showAnsUpDown } = require("../utils/answer");

const { preprocessing } = require("../utils/textpreprocess");

const { updateReputation } = require("../utils/user");

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
      { _id: req.params.questionId },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate({
        path: "answers",
        populate: {
          path: "ans_by",
          select: "username firstname lastname profilePic",
        },
      })
      .populate({ path: "answers", populate: { path: "comments" } })
      .populate({ path: "asked_by", select: "-password" })
      .populate("tags")
      .populate("comments")
      .exec();
    let jsonQuestion = question.toJSON();
    jsonQuestion = showQuesUpDown(req.userId, jsonQuestion);
    res.status(200).json(jsonQuestion);
  } catch (err) {
    res.status(500);
    res.json({ error: "Something went wrong", details: err.message });
  }
};

// const getQuestionById = async (req, res) => {
//   try {
//     let question = await Question.findOneAndUpdate(
//       { _id: req.params.questionId },
//       { $inc: { views: 1 } },
//       { new: true }
//     )
//       .populate({
//         path: "answers",
//         populate: {
//           path: "ans_by",
//           select: "username firstname lastname profilePic",
//         },
//       })
//       .populate({
//         path: "answers",
//         populate: {
//           path: "comments",
//           populate: {
//             path: "commented_by",
//             select: "username firstname lastname profilePic",
//           },
//         },
//       })
//       .populate("asked_by")
//       .populate("comments");
//     res.status(200);
//     res.json(question);
//   } catch (err) {
//     res.status(500);
//     res.json({});
//   }
// };

// To add Question to database
// Note: Convert it to taking asked_by directly from token
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
  } catch (err) {
    res.status(500).json({ error: `Question could not be added: ${err}` });
  }
};

// To upvote a question
const upvoteQuestion = async (req, res) => {
  try {
    let qid = preprocessing(req.body.qid);
    let uid = preprocessing(req.userId);
    let user = await User.findOne({ _id: uid });
    if (!user) {
      res
        .status(401)
        .json({ error: `Unauthorized access: Unidentified userid.` });
    }
    let question = await Question.findOne({ _id: qid });
    if (!question) {
      res
        .status(404)
        .json({ error: `Unavailable resource: Unidentified questionid.` });
    }
    // If the user id is in the downvote list, remove that and update count.
    const checkUserDownvote = question.downvoted_by.includes(uid);
    if (checkUserDownvote) {
      removeDownvote(qid, uid);
    }
    // If the user id is in the upvote list, remove that and update count else upvote.
    const checkUserUpvote = question.upvoted_by.includes(uid);
    if (checkUserUpvote) {
      removeUpvote(qid, uid);
      await updateReputation(false, question["asked_by"].toString());
      res
        .status(200)
        .json({ message: "Removed previous upvote of user", upvote: false });
    } else {
      addUpvote(qid, uid);
      await updateReputation(true, question["asked_by"].toString());
      res.status(200).json({ message: "Upvoted for the user", upvote: true });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: `Question could not be upvoted at this time: ${err}` });
  }
};

// To downvote a question
const downvoteQuestion = async (req, res) => {
  try {
    let qid = preprocessing(req.body.qid);
    let uid = preprocessing(req.userId);
    let user = await User.findOne({ _id: uid });
    if (!user) {
      res
        .status(401)
        .json({ error: `Unauthorized access: Unidentified userid.` });
    }
    let question = await Question.findOne({ _id: qid });
    if (!question) {
      res
        .status(404)
        .json({ error: `Unavailable resource: Unidentified questionid.` });
    }
    // If the user id is in the upvote list, remove that and update count.
    const checkUserUpvote = question.upvoted_by.includes(uid);
    if (checkUserUpvote) {
      removeUpvote(qid, uid);
    }
    // If the user id is in the downvote list, remove that and update count else downvote.
    const checkUserDownvote = question.downvoted_by.includes(uid);
    if (checkUserDownvote) {
      removeDownvote(qid, uid);
      res.status(200).json({
        message: "Removed previous downvote of user",
        downvote: false,
      });
    } else {
      addDownvote(qid, uid);
      res
        .status(200)
        .json({ message: "Downvoted for the user", downvote: true });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: `Question could not be downvoted at this time: ${err}` });
  }
};

// To flag or unflag a question.
const flagQuestion = async (req, res) => {
  try {
    // let uid = preprocessing(req.body.uid);
    let uid = preprocessing(req.userId);
    let user = await User.findOne({ _id: uid });
    if (!user) {
      res
        .status(401)
        .json({ error: `Unauthorized access: Unidentified userid.` });
    }
    let question = await Question.findOne({ _id: preprocessing(req.body.qid) });
    if (!question) {
      res
        .status(404)
        .json({ error: `Unavailable resource: Unidentified questionid.` });
    }
    question.flag = !question.flag;
    await question.save();
    if (!question.flag) {
      res
        .status(200)
        .json({ message: "Unflagged question from review.", flag: false });
    } else {
      res
        .status(200)
        .json({ message: "Flagged question for review.", flag: true });
    }
  } catch (err) {
    res.status(500).json({ error: `Cannot fetch flagged question: ${err}` });
  }
};

const getTrendingQuestions = async (req, res) => {
  try {
    let questions = await getTop10Questions();
    res.status(200).json({ questions: questions });
  } catch (err) {
    res.status(500).json({ error: `Cannot fetch treding questions: ${err}` });
  }
};

// add appropriate HTTP verbs and their endpoints to the router

router.get("/getQuestion", authorization, authorization, getQuestionsByFilter);
router.get(
  "/getQuestionById/:questionId",
  authorization,
  authorization,
  getQuestionById
);
router.post("/addQuestion", authorization, authorization, addQuestion);
router.post("/upvoteQuestion", authorization, authorization, upvoteQuestion);
router.post(
  "/downvoteQuestion",
  authorization,
  authorization,
  downvoteQuestion
);
router.post("/flagQuestion", authorization, authorization, flagQuestion);
router.get("/getTrendingQuestions", authorization, getTrendingQuestions);

module.exports = router;
