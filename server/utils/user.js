const User = require("../models/users");

const updateReputation = async (upvoteBool, downvoteBool, uid, typeVote) => {
    try {
        let user = await User.findOne({_id: uid});
        if(upvoteBool || (typeVote == "downvote" && !downvoteBool)) {
            user['reputation'] = user['reputation'] + 10;
        }
        else {
            user['reputation'] = user['reputation'] <= 10? 0: user['reputation'] - 10;
        }
        await user.save();
    }
    catch (err) {
        return new Error(`Error in updating reputation of user: ${err}`);
    }
}

module.exports = {updateReputation};