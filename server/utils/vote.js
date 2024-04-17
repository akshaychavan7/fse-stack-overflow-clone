const updateUpvote = async (voteObject, obj, uid, id) => {
    if (obj.upvoted_by.includes(uid)) {
        await voteObject.findByIdAndUpdate(id, {
            $pull: { upvoted_by: uid },
            $inc: { vote_count: -1 },
          });
        return {upvote: false, downvote: false, message: "Removed previous upvote."}
      } else if (obj.downvoted_by.includes(uid)) {
        await voteObject.findByIdAndUpdate(id, {
          $pull: { downvoted_by: uid },
          $addToSet: { upvoted_by: uid },
          $inc: { vote_count: 2 },
        });
      } else {
        await voteObject.findByIdAndUpdate(id, {
          $addToSet: { upvoted_by: uid },
          $inc: { vote_count: 1 },
        });
      }
      return {upvote: true, downvote: false, message: "Upvoted successfully."}
}

const updateDownvote = async (voteObject, obj, uid, id) => {
    if (obj.downvoted_by.includes(uid)) {
        await voteObject.findByIdAndUpdate(id, {
            $pull: { downvoted_by: uid },
            $inc: { vote_count: 1 },
          });
        return {upvote: false, downvote: false, message: "Removed previous downvote."}
      } else if (obj.upvoted_by.includes(uid)) {
        await voteObject.findByIdAndUpdate(id, {
          $pull: { upvoted_by: uid},
          $addToSet: { downvoted_by: uid },
          $inc: { vote_count: -2 },
        });
      } else {
        await voteObject.findByIdAndUpdate(id, {
          $addToSet: { downvoted_by: uid },
          $inc: { vote_count: -1 },
        });
      }
      return {upvote: false, downvote: true, message: "Downvoted successfully."}
}

module.exports = {updateUpvote, updateDownvote};