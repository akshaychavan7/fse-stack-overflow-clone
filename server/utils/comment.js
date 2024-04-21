const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");
const {
    constants
  } = require("../utils/constants");


/**
 * Deletes a comment and updates the parents comments field.
 * 
 * Using the parentId and parentType, the parent is found and then the comment is deleted from it's comments list.
 * Then the comment is deleted.
 * 
 * @param {string} parentId - The ID of the parent post (question or answer) from which the comment will be deleted.
 * @param {string} parentType - The type of the parent post. It can be either "question" or "answer".
 * @param {string} cid - The ID of the comment to be deleted.
 * @returns {Object} An object containing the status and message of the operation.
 * @throws {Error} If there's an error during the deletion process.
 */
const commentDelete = async(parentId, parentType, cid) => {
    try {
      
          let parentModel;
          if (parentType === constants.QUESTIONTYPE) {
            parentModel = await Question;
          } else if (parentType === constants.ANSWERTYPE) {
            parentModel = await Answer;
          } else {
            return {status: 400, message: "Invalid parent"};
          }
      
          await parentModel.findByIdAndUpdate(
            parentId,
            { $pull: { comments: {$eq: cid} } },
            { new: true }
          );
      
          await Comment.findByIdAndDelete(cid);
          return {status: 200, message: "Comment deleted successfully"};
    }
    catch(err) {
        return Error(err);
    }
    
}
/**
 * Sets the upvote and downvote status for each comment based on the user ID.
 * 
 * For all comments in the list, the upvote/downvote visibility is updated based on
 * the given user ID.
 * 
 * @param {string} uid - The ID of the user.
 * @param {Array} comments - An array of comments.
 * @returns {Array} An array of comments with upvote and downvote status.
 * @throws {Error} If there's an error during the process.
 */
const showCommentUpDown = (uid, comments) => {
  try {
    for (let comment in comments) {
      comments[comment].upvote = false;
      comments[comment].downvote = false;
      let com_upvoteBy = comments[comment]["upvoted_by"].map((objectId) =>
        objectId.toString()
      );
      let com_downvoteBy = comments[comment]["downvoted_by"].map((objectId) =>
        objectId.toString()
      );
      if (com_upvoteBy.includes(uid)) {
        comments[comment].upvote = true;
      }
      else if (com_downvoteBy.includes(uid)) {
        comments[comment].downvote = true;
      }
    }
    return comments;
  }
  catch (err) {
    return new Error("Error in setting upvote downvote of comment.");
  }

};

module.exports = {
    commentDelete,
    showCommentUpDown
}