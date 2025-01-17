// Unit tests for utils/question.js
const mockingoose = require("mockingoose");
const Tag = require("../models/tags");
const Question = require("../models/questions");
const Comment = require("../models/comments");
const {
  addTag,
  getQuestionsByOrder,
  filterQuestionsBySearch,
  getTop10Questions,
  showQuesUpDown,
  questionDelete,
} = require("../utils/question");

const {
  _users,
  _tags,
  _comments,
  _answers,
  _questions
} = require("./constantdb");

Question.schema.path("answers", Array);

// Mock authorization
jest.mock("../middleware/authorization");
let auth = require('../middleware/authorization');

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




describe("question util module", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  // addTag
  test("addTag return tag id if the tag already exists", async () => {
    mockingoose(Tag).toReturn(_tags[0], "findOne");

    const result = await addTag("react");
    expect(result.toString()).toEqual(_tags[0]._id);
  });

  test("addTag return tag id of new tag if does not exist in database", async () => {
    mockingoose(Tag).toReturn(null, "findOne");
    mockingoose(Tag).toReturn(_tags[1], "save");

    const result = await addTag("javascript");
    expect(result.toString()).toEqual(_tags[1]._id);
  });

  test("addTag returns error", async () => {
    mockingoose(Tag).toReturn(new Error(), "findOne");

    const result = await addTag("error tag");
    expect(result).toBeInstanceOf(Error);
  });

  // filterQuestionsBySearch
  test("filter question empty string", () => {
    const result = filterQuestionsBySearch(_questions, "");

    expect(result.length).toEqual(4);
  });

  test("filter question by one tag", () => {
    const result = filterQuestionsBySearch(_questions, "[android]");
    expect(result.length).toEqual(2);
    expect(result[0]._id).toEqual("65e9b58910afe6e94fc6e6dc");
    expect(result[1]._id).toEqual("65e9b9b44c052f0a08ecade0");
  });

  test("filter question by multiple tags", () => {
    const result = filterQuestionsBySearch(_questions, "[android] [react]");

    expect(result.length).toEqual(3);
    expect(result[0]._id).toEqual("65e9b58910afe6e94fc6e6dc");
    expect(result[1]._id).toEqual("65e9b5a995b6c7045a30d823");
    expect(result[2]._id).toEqual("65e9b9b44c052f0a08ecade0");
  });

  test("filter question by one keyword", () => {
    const result = filterQuestionsBySearch(_questions, "website");

    expect(result.length).toEqual(1);
    expect(result[0]._id).toEqual("65e9b5a995b6c7045a30d823");
  });

  test("filter question by tag and keyword", () => {
    const result = filterQuestionsBySearch(_questions, "website [android]");

    expect(result.length).toEqual(3);
    expect(result[0]._id).toEqual("65e9b58910afe6e94fc6e6dc");
    expect(result[1]._id).toEqual("65e9b5a995b6c7045a30d823");
    expect(result[2]._id).toEqual("65e9b9b44c052f0a08ecade0");
  });

  // getQuestionsByOrder
  test("get active questions, newest questions sorted by most recently answered 1", async () => {
    mockingoose(Question).toReturn(_questions.slice(0, 3), "find");

    const result = await getQuestionsByOrder("active");
    expect(result.length).toEqual(3);
    expect(result[0]._id.toString()).toEqual("65e9b58910afe6e94fc6e6dc");
    expect(result[1]._id.toString()).toEqual("65e9b9b44c052f0a08ecade0");
    expect(result[2]._id.toString()).toEqual("65e9b5a995b6c7045a30d823");
  });

  test("get active questions, newest questions sorted by most recently answered 2", async () => {
    const questions = [
      {
        _id: "65e9b716ff0e892116b2de01",
        answers: [_answers[0], _answers[2]], // 18, 19 => 19
        ask_date_time: new Date("2023-11-20T09:24:00"),
      },
      {
        _id: "65e9b716ff0e892116b2de02",
        answers: [_answers[0], _answers[1], _answers[2], _answers[3]], // 18, 20, 19, 19 => 20
        ask_date_time: new Date("2023-11-20T09:24:00"),
      },
      {
        _id: "65e9b716ff0e892116b2de03",
        answers: [_answers[0]], // 18 => 18
        ask_date_time: new Date("2023-11-19T09:24:00"),
      },
      {
        _id: "65e9b716ff0e892116b2de04",
        answers: [_answers[3]], // 19 => 19
        ask_date_time: new Date("2023-11-21T09:24:00"),
      },
      {
        _id: "65e9b716ff0e892116b2de05",
        answers: [],
        ask_date_time: new Date("2023-11-19T10:24:00"),
      },
    ];
    mockingoose(Question).toReturn(questions, "find");

    const result = await getQuestionsByOrder("active");

    expect(result.length).toEqual(5);
    expect(result[0]._id.toString()).toEqual("65e9b716ff0e892116b2de02");
    expect(result[1]._id.toString()).toEqual("65e9b716ff0e892116b2de01");
    expect(result[2]._id.toString()).toEqual("65e9b716ff0e892116b2de04");
    expect(result[3]._id.toString()).toEqual("65e9b716ff0e892116b2de03");
    expect(result[4]._id.toString()).toEqual("65e9b716ff0e892116b2de05");
  });

  test("get newest unanswered questions", async () => {
    mockingoose(Question).toReturn(_questions, "find");

    const result = await getQuestionsByOrder("unanswered");
    expect(result.length).toEqual(2);
    expect(result[0]._id.toString()).toEqual("65e9b716ff0e892116b2de09");
    expect(result[1]._id.toString()).toEqual("65e9b5a995b6c7045a30d823");
  });

  test("get newest questions", async () => {
    const questions = [
      {
        _id: "65e9b716ff0e892116b2de01",
        ask_date_time: new Date("2023-11-20T09:24:00"),
      },
      {
        _id: "65e9b716ff0e892116b2de04",
        ask_date_time: new Date("2023-11-21T09:24:00"),
      },
      {
        _id: "65e9b716ff0e892116b2de05",
        ask_date_time: new Date("2023-11-19T10:24:00"),
      },
    ];
    mockingoose(Question).toReturn(questions, "find");

    const result = await getQuestionsByOrder("newest");
    expect(result.length).toEqual(3);
    expect(result[0]._id.toString()).toEqual("65e9b716ff0e892116b2de04");
    expect(result[1]._id.toString()).toEqual("65e9b716ff0e892116b2de01");
    expect(result[2]._id.toString()).toEqual("65e9b716ff0e892116b2de05");
  });

  test("getQuestionsByOrder returns error", async () => {
    mockingoose(Question).toReturn(new Error("Error"), "find");

    const result = await getQuestionsByOrder("newest");
    expect(result).toBeInstanceOf(Error);
  });

  test("getTop10Questions", async () => {

    let questions = _questions;
    jest.mock("../models/questions");
    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(questions),
    }));

    let result = await getTop10Questions();
    expect(result).toEqual(questions);
  });

  test("getTop10Questions error", async () => {

    jest.mock("../models/questions");
    Question.find = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    let result = await getTop10Questions();
    expect(result).toBeInstanceOf(Error);
  });

  test("showQuesUpDown uid in upvote", async () => {
    let question1 = {
      upvote: false,
      downvote: false,
      upvoted_by: ["dummyUser1", "dummyUser2"],
      downvoted_by: ["dummyUser3"],
      answers: [],
      comments: []
    }

    uid = "dummyUser1";

    let result = showQuesUpDown(uid, question1);
    expect(result.upvote).toBe(true);
    expect(result.downvote).toBe(false);
  });

  test("showQuesUpDown uid in downvote", async () => {
    let question1 = {
      upvote: false,
      downvote: false,
      upvoted_by: ["dummyUser1", "dummyUser2"],
      downvoted_by: ["dummyUser3"],
      answers: [],
      comments: []
    }

    uid = "dummyUser3";

    let result = showQuesUpDown(uid, question1);
    expect(result.upvote).toBe(false);
    expect(result.downvote).toBe(true);
  });

  test("showQuesUpDown uid in none of them", async () => {
    let question1 = {
      upvote: false,
      downvote: false,
      upvoted_by: ["dummyUser1", "dummyUser2"],
      downvoted_by: ["dummyUser3"],
      answers: [],
      comments: []
    }

    uid = "dummyUser4";

    let result = showQuesUpDown(uid, question1);
    expect(result.upvote).toBe(false);
    expect(result.downvote).toBe(false);
  });

  test("showQuesUpDown error", async () => {
    let question1 = {
    }

    uid = "dummyUser4";

    let result = showQuesUpDown(uid, question1);
    expect(result).toBeInstanceOf(Error);
  });

  test("questionDelete to delete a question", async () => {
    mockingoose(Question).toReturn(_questions[3], 'findOne');
    mockingoose(Comment).toReturn(null, 'deleteOne');
    mockingoose(Question).toReturn(null, 'findByIdAndDelete')
    let result = await questionDelete(_questions[3]._id);
    expect(result.status).toBe(200);
    expect(result.message).toBe("Deleted flagged question.");
  });

  test("questionDelete encounters error", async () => {
    mockingoose(Question).toReturn(new Error("Error"), 'findOne');
    let result = await questionDelete(_questions[3]._id);
    expect(result).toBeInstanceOf(Error);
  });

});
