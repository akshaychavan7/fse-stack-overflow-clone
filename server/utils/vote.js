const Comment = require("../models/comments");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const { constants } = require("./constants");

/**
 * Updates the upvote status for a post by a user.
 * 
 * @param {Model} voteObject - The Mongoose model representing the type of post (Question, Answer, or Comment).
 * @param {Object} obj - The post object to update.
 * @param {string} uid - The user ID who is performing the upvote action.
 * @param {string} id - The ID of the post to update.
 * @returns {Object} An object containing the updated upvote status, downvote status, vote count, and a message.
 */
const updateUpvote = async (voteObject, obj, uid, id) => {
  let finalValue;
  if (obj.upvoted_by.includes(uid)) {
    finalValue = await voteObject.findByIdAndUpdate(id, {
      $pull: { upvoted_by: uid },
      $inc: { vote_count: -1 },
    },
      { new: true });
    return { upvote: false, downvote: false, vote_count: finalValue['vote_count'], message: "Removed previous upvote." }
  } else if (obj.downvoted_by.includes(uid)) {
    finalValue = await voteObject.findByIdAndUpdate(id, {
      $pull: { downvoted_by: uid },
      $addToSet: { upvoted_by: uid },
      $inc: { vote_count: 2 },
    },
      { new: true });
  } else {
    finalValue = await voteObject.findByIdAndUpdate(id, {
      $addToSet: { upvoted_by: uid },
      $inc: { vote_count: 1 },
    },
      { new: true });
  }
  return { upvote: true, downvote: false, vote_count: finalValue['vote_count'], message: "Upvoted successfully." }
}

/**
 * Updates the downvote status for a post by a user.
 * 
 * @param {Model} voteObject - The Mongoose model representing the type of post (Question, Answer, or Comment).
 * @param {Object} obj - The post object to update.
 * @param {string} uid - The user ID who is performing the downvote action.
 * @param {string} id - The ID of the post to update.
 * @returns {Object} An object containing the updated upvote status, downvote status, vote count, and a message.
 */
const updateDownvote = async (voteObject, obj, uid, id) => {
  let finalValue;
  if (obj.downvoted_by.includes(uid)) {
    finalValue = await voteObject.findByIdAndUpdate(id, {
      $pull: { downvoted_by: uid },
      $inc: { vote_count: 1 },
    },
      { new: true });
    return { upvote: false, downvote: false, vote_count: finalValue['vote_count'], message: "Removed previous downvote." }
  } else if (obj.upvoted_by.includes(uid)) {
    finalValue = await voteObject.findByIdAndUpdate(id, {
      $pull: { upvoted_by: uid },
      $addToSet: { downvoted_by: uid },
      $inc: { vote_count: -2 },
    },
      { new: true });
  } else {
    finalValue = await voteObject.findByIdAndUpdate(id, {
      $addToSet: { downvoted_by: uid },
      $inc: { vote_count: -1 },
    },
      { new: true });
  }
  return { upvote: false, downvote: true, vote_count: finalValue['vote_count'], message: "Downvoted successfully." }
}


/**
 * Assigns the appropriate Mongoose model based on the type of post for performing voting operations.
 * 
 * @param {string} voteType - The type of post (Question, Answer, or Comment).
 * @returns {Model} The Mongoose model representing the type of post.
 * @throws {Error} If an invalid type is provided.
 */
const assignVoteObject = async (voteType) => {
  try {
    let voteObj;
    switch (voteType) {
      case constants.QUESTIONTYPE:
        voteObj = await Question;
        break;
      case constants.ANSWERTYPE:
        voteObj = await Answer;
        break;
      case constants.COMMENTTYPE:
        voteObj = await Comment;
        break;
      default:
        throw new Error("Invalid type");
    }

    return voteObj;
  }
  catch (err) {
    throw new Error(err);
  }
}

/**
 * Retrieves the ID of the user who posted a specific type of content based on the provided vote type and object.
 * 
 * @param {string} voteType - The type of post (Question, Answer, or Comment).
 * @param {Object} obj - The object representing the post.
 * @returns {string} The ID of the user who posted the content.
 * @throws {Error} If there is an error in assigning contributor info.
 */
const assignPostBy = (voteType, obj) => {
  try {
    switch (voteType) {
      case constants.QUESTIONTYPE:
        return obj.asked_by.toString();
      case constants.ANSWERTYPE:
        return obj.ans_by.toString();
      case constants.COMMENTTYPE:
        return obj.commented_by.toString();
    }
  }
  catch(err) {
    throw new Error("Error in assigning contributor info.");
  }
}

module.exports = { updateUpvote, updateDownvote, assignVoteObject, assignPostBy };