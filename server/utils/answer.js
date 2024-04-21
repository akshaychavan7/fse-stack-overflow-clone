const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");

const {showCommentUpDown} = require("../utils/comment");

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