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

module.exports = { updateUpvote, updateDownvote };