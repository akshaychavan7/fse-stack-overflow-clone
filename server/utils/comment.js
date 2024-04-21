const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");
const {
    constants
  } = require("../utils/constants");


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