const mockingoose = require("mockingoose");
const Tag = require("../models/tags");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const {constants} = require("../utils/constants");

const {updateUpvote, updateDownvote, assignVoteObject, assignPostBy} = require("../utils/vote");


jest.mock("../middleware/authorization");
let auth = require('../middleware/authorization');
const question = require("../models/schema/question");

// Mock the authorization
auth.authorization = jest.fn((req, res, next) => {
  next();
});

auth.adminAuthorization = jest.fn((req, res, next) => {
  next();
});


jest.mock('../middleware/sanitizeParams', () => (req, res, next) => {
  next();
});

describe("updateUpvote of the vote util module", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  test("upvote question", async () => {
    const id = 'question_id';
    const uid = 'user_id';
    const obj = { _id: id, upvoted_by: [], downvoted_by: [], vote_count: 0 };
    const newobj = { _id: id, upvoted_by: [uid], downvoted_by: [], vote_count: 1 };

    mockingoose(Question).toReturn(newobj, 'findOneAndUpdate');

    const result = await updateUpvote(Question, obj, uid, id);
    expect(result).toEqual({
      upvote: true,
      downvote: false,
      vote_count: 1,
      message: "Upvoted successfully."
    });

  });

  test("remove upvote of question", async () => {
    const id = 'question_id';
    const uid = 'user_id';
    const obj = { _id: id, upvoted_by: [uid], downvoted_by: [], vote_count: 1 };
    const newobj = { _id: id, upvoted_by: [], downvoted_by: [], vote_count: 0 };

    mockingoose(Question).toReturn(newobj, 'findOneAndUpdate');

    const result = await updateUpvote(Question, obj, uid, id);
    expect(result).toEqual({
      upvote: false,
      downvote: false,
      vote_count: 0,
      message: "Removed previous upvote."
    });

  });

  test("remove downvote and then upvote question", async () => {
    const id = 'question_id';
    const uid = 'user_id';
    const obj = { _id: id, upvoted_by: [], downvoted_by: [uid], vote_count: -1 };
    const newobj = { _id: id, upvoted_by: [uid], downvoted_by: [], vote_count: 1 };

    mockingoose(Question).toReturn(newobj, 'findOneAndUpdate');

    const result = await updateUpvote(Question, obj, uid, id);
    expect(result).toEqual({
      upvote: true,
      downvote: false,
      vote_count: 1,
      message: "Upvoted successfully."
    });

  });
});


describe("updateDownvote of the vote util module", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  test("downvote question", async () => {
    const id = 'question_id';
    const uid = 'user_id';
    const obj = { _id: id, upvoted_by: [], downvoted_by: [], vote_count: 0 };
    const newobj = { _id: id, upvoted_by: [], downvoted_by: [uid], vote_count: -1 };

    mockingoose(Question).toReturn(newobj, 'findOneAndUpdate');

    const result = await updateDownvote(Question, obj, uid, id);
    expect(result).toEqual({
      upvote: false,
      downvote: true,
      vote_count: -1,
      message: "Downvoted successfully."
    });

  });

  test("remove downvote of question", async () => {
    const id = 'question_id';
    const uid = 'user_id';
    const obj = { _id: id, upvoted_by: [], downvoted_by: [uid], vote_count: -1 };
    const newobj = { _id: id, upvoted_by: [], downvoted_by: [], vote_count: 0 };

    mockingoose(Question).toReturn(newobj, 'findOneAndUpdate');

    const result = await updateDownvote(Question, obj, uid, id);
    expect(result).toEqual({
      upvote: false,
      downvote: false,
      vote_count: 0,
      message: "Removed previous downvote."
    });

  });

  test("remove upvote and then downvote question", async () => {
    const id = 'question_id';
    const uid = 'user_id';
    const obj = { _id: id, upvoted_by: [uid], downvoted_by: [], vote_count: 1 };
    const newobj = { _id: id, upvoted_by: [], downvoted_by: [uid], vote_count: -1 };

    mockingoose(Question).toReturn(newobj, 'findOneAndUpdate');

    const result = await updateDownvote(Question, obj, uid, id);
    expect(result).toEqual({
      upvote: false,
      downvote: true,
      vote_count: -1,
      message: "Downvoted successfully."
    });

  });
});

describe("assignVoteObject of the vote util module", () => {
  test('should return Question model for voteType QUESTIONTYPE', async () => {
    const voteType = constants.QUESTIONTYPE;
    const voteObj = await assignVoteObject(voteType);
    expect(voteObj.modelName).toBe('Question');
  });

  test('should return Answer model for voteType ANSWERTYPE', async () => {
    const voteType = constants.ANSWERTYPE;
    const voteObj = await assignVoteObject(voteType);
    expect(voteObj.modelName).toBe('Answer');
  });

  test('should return Comment model for voteType COMMENTTYPE', async () => {
    const voteType = constants.COMMENTTYPE;
    const voteObj = await assignVoteObject(voteType);
    expect(voteObj.modelName).toBe('Comment');
  });

  test('should throw an error for invalid voteType', async () => {
    const voteType = 'invalid vote';
    await expect(assignVoteObject(voteType)).rejects.toThrow('Invalid type');
  });
});

describe("assignPostBy of the vote util module", () => {
  test('should return the ID of the user who asked the question for QUESTIONTYPE', () => {
    const voteType = constants.QUESTIONTYPE;
    const obj = { asked_by: { toString: () => 'dummyUserId' } };
    const result = assignPostBy(voteType, obj);
    expect(result).toBe('dummyUserId');
  });

  test('should return the ID of the user who answered the question for ANSWERTYPE', () => {
    const voteType = constants.ANSWERTYPE;
    const obj = { ans_by: { toString: () => 'dummyUserId' } };
    const result = assignPostBy(voteType, obj);
    expect(result).toBe('dummyUserId');
  });

  test('should return the ID of the user who commented for COMMENTTYPE', () => {
    const voteType = constants.COMMENTTYPE;
    const obj = { commented_by: { toString: () => 'dummyUserId' } };
    const result = assignPostBy(voteType, obj);
    expect(result).toBe('dummyUserId');
  });
});