const User = require("../models/users");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");
const { constants } = require("./constants");
const { preprocessing } = require("../utils/textpreprocess");

const updateReputation = async (upvoteBool, downvoteBool, uid, typeVote) => {
  try {
    let user = await User.findOne({ _id: uid });
    if (upvoteBool || (typeVote == "downvote" && !downvoteBool)) {
      user["reputation"] = user["reputation"] + 10;
    } else {
      user["reputation"] =
        user["reputation"] <= 10 ? 0 : user["reputation"] - 10;
    }
    
    await user.save();
    return {reputation: user["reputation"]};
  } catch (err) {
    return new Error(`Error in updating reputation of user: ${err}`);
  }
};

const reportPost = async (id, type) => {
  try {
    let postType;
  switch (type) {
    case constants.QUESTIONTYPE:
      postType = await Question;
      break;
    case constants.ANSWERTYPE:
      postType = await Answer;
      break;
    case constants.COMMENTTYPE:
      postType = await Comment;
      break;
    default:
      return Error("Invalid type");
  }

  let post = await postType.findOne({ _id: id });
  post["flag"] = !post["flag"];
  post.save();
  return post["flag"];
  }
  catch(err) {
    return Error(err);
  }
  
};

const getQuestionsByUser = async (uid) => {
  try {
    let questions = await Question.find({ asked_by: preprocessing(uid) })
      .populate({ path: "asked_by", select: "username -_id" })
      .populate("tags")
      .populate("answers")
      .populate("comments")
      .populate("upvoted_by")
      .populate("downvoted_by")
      .exec();

    return questions;
  } catch (err) {
    return Error(`Error in extracting questions: ${err}`);
  }
};

const getAnswersByUser = async (uid) => {
  try {
    let answers = await Answer.find({ ans_by: preprocessing(uid) })
      .populate({ path: "ans_by", select: "username -_id" })
      .populate("comments")
      .populate("upvoted_by")
      .populate("downvoted_by")
      .exec();

    return answers;
  } catch (err) {
    return Error(`Error in extracting answers: ${err}`);
  }
};

const getCommentsByUser = async (uid) => {
  try {
    let comments = await Comment.find({ commented_by: preprocessing(uid) })
      .populate({ path: "commented_by", select: "username -_id" })
      .populate("upvoted_by")
      .exec();

    return comments;
  } catch (err) {
    return Error(`Error in extracting comments: ${err}`);
  }
};

module.exports = { updateReputation, reportPost, getQuestionsByUser, getAnswersByUser, getCommentsByUser };
