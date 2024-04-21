const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");

const {showCommentUpDown} = require("../utils/comment");

/**
 * Function to delete an answer and its associated comments from a question.
 * 
 * This function deletes the specified answer and removes its reference from
 * the corresponding question's list of answers. It also deletes all comments
 * associated with the answer.
 * 
 * @param {string} qid - The ID of the question containing the answer.
 * @param {string} aid - The ID of the answer to be deleted.
 * @returns {Object} - An object containing the status and message of the deletion operation.
 *                    - If an error occurs during the deletion process, it returns an Error object.
 */
const ansDelete = async(qid, aid) => {
    try {
        await Question.updateOne(
            {_id: qid},
            { $pull: { answers: {$eq: aid} } },
            {new: true}
        );
      
        let answer = await Answer.findOne({_id: {$eq: aid}});
        for(let comment in answer['comments']) {
            await Comment.findByIdAndDelete(answer['comments'][comment].toString());
        }
    
        await Answer.findByIdAndDelete(aid);
        return {status: 200, message: "Answer deleted successfully"};
    }
    catch(err) {
        return Error("Error in deleting answer");
    }
    
}

/**
 * Function to set upvote and downvote status for each answer in a list.
 * 
 * This function iterates through each answer in the provided list and sets the upvote
 * and downvote status based on the given user ID. It also calls the `showCommentUpDown`
 * function to set upvote and downvote status for comments within each answer.
 * 
 * @param {string} uid - The ID of the user for whom the upvote/downvote status is to be determined.
 * @param {Array} answers - An array containing answers for which the upvote/downvote status needs to be set.
 * @returns {Array} - An array containing the updated answers with upvote/downvote status set for each answer.
 *                    - If an error occurs during the process, it returns an Error object.
 */
const showAnsUpDown = (uid, answers) => {
    try {
      for (let answer in answers) {
        answers[answer].upvote = false;
        answers[answer].downvote = false;
        let ans_upvoteBy = answers[answer]["upvoted_by"].map((objectId) =>
          objectId.toString()
        );
        let ans_downvoteBy = answers[answer]["downvoted_by"].map((objectId) =>
          objectId.toString()
        );
        if (ans_upvoteBy.includes(uid)) {
          answers[answer].upvote = true;
        } else if (ans_downvoteBy.includes(uid)) {
          answers[answer].downvote = true;
        }
        answers[answer]["comments"] = showCommentUpDown(
          uid,
          answers[answer]["comments"]
        );
      }
      return answers;
    }
    catch (err) {
      return new Error("Error in setting upvote downvote of answer.");
    }
  
  };

module.exports = {
    ansDelete,
    showAnsUpDown
}