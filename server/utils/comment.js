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
          let parentObject = await parentModel.exists({ _id: parentId });
          if (!parentObject) {
            return {status: 404, message: "Parent not found"};
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

module.exports = {
    commentDelete
}