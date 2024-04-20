const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");


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

module.exports = {
    ansDelete
}