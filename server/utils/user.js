const User = require("../models/users");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");
const { constants } = require("./constants");
const { preprocessing } = require("../utils/textpreprocess");


/**
 * Updates the reputation of a user based on the type of vote (upvote or downvote).
 * 
 * @param {boolean} upvoteBool - Boolean indicating whether the vote is an upvote.
 * @param {boolean} downvoteBool - Boolean indicating whether the vote is a downvote.
 * @param {string} uid - The user ID.
 * @param {string} typeVote - The type of vote (either "upvote" or "downvote").
 * @returns {object} An object containing the updated reputation of the user.
 * @throws {Error} If there is an error in updating the reputation of the user.
 */
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
    return { reputation: user["reputation"] };
  } catch (err) {
    return new Error(`Error in updating reputation of user: ${err}`);
  }
};


/**
 * Toggles the flag status of a post identified by its ID and type.
 * 
 * @param {string} id - The ID of the post.
 * @param {string} type - The type of the post (question, answer, or comment).
 * @returns {boolean} The new flag status of the post after toggling.
 * @throws {Error} If there is an error in reporting the post.
 */
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
  catch (err) {
    return Error(err);
  }
};

/**
 * Retrieves questions asked by a user identified by their user ID.
 * The question is populated with the information of the post creator,
 * tags, answers, comments, upvoted_by and downvoted_by.
 * 
 * @param {string} uid - The user ID of the user.
 * @returns {Array} An array of questions asked by the user.
 * @throws {Error} If there is an error in extracting questions.
 */
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

/**
 * Retrieves answers posted by a user identified by their user ID.
 * The answer is populated with the information of the post creator,
 * comments, upvoted_by and downvoted_by.
 * 
 * @param {string} uid - The user ID of the user.
 * @returns {Array} An array of answers posted by the user.
 * @throws {Error} If there is an error in extracting answers.
 */
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


/**
 * Retrieves comments posted by a user identified by their user ID.
 * The comment is populated with the information of the post creator,
 * upvoted_by and downvoted_by.
 * 
 * @param {string} uid - The user ID of the user.
 * @returns {Array} An array of comments posted by the user.
 * @throws {Error} If there is an error in extracting comments.
 */
const getCommentsByUser = async (uid) => {
  try {
    let comments = await Comment.find({ commented_by: preprocessing(uid) })
      .populate({ path: "commented_by", select: "username -_id" })
      .populate("upvoted_by")
      .populate("downvoted_by")
      .exec();

    return comments;
  } catch (err) {
    return Error(`Error in extracting comments: ${err}`);
  }
};

module.exports = { updateReputation, reportPost, getQuestionsByUser, getAnswersByUser, getCommentsByUser };
