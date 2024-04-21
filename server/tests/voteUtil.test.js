const mockingoose = require("mockingoose");
const Tag = require("../models/tags");
const Question = require("../models/questions");
const Answer = require("../models/answers");

const {updateUpvote, updateDownvote} = require("../utils/vote");


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