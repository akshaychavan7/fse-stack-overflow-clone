const User = require("../models/users");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");

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
  } catch (err) {
    return new Error(`Error in updating reputation of user: ${err}`);
  }
};

const reportPost = async (id, type) => {
  let postType;
  switch (type) {
    case constants.QUESTION:
      postType = await Question;
      break;
    case constants.ANSWER:
      postType = await Answer;
      break;
    case constants.COMMENT:
      postType = await Comment;
      break;
    default:
      return Error("Invalid type");
  }

  let post = await postType.findOne({ _id: id });
  post["flag"] = !post["flag"];
  post.save();
  return post["flag"];
};

module.exports = { updateReputation, reportPost };
