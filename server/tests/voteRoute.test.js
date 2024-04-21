const supertest = require("supertest")
const { default: mongoose } = require("mongoose");

const Answer = require("../models/answers");
const Question = require("../models/questions");
const Comment = require("../models/comments");

jest.mock("../models/answers");
jest.mock("../models/questions");
jest.mock("../models/comments");


jest.mock("../utils/vote");
let vote = require('../utils/vote');

vote.updateUpvote = jest.fn();
vote.updateDownvote = jest.fn();
vote.assignVoteObject = jest.fn();
vote.assignPostBy = jest.fn();

jest.mock("../utils/validator");
let validate = require('../utils/validator');

validate.validateId = jest.fn();

// Mock authorization
jest.mock("../middleware/authorization");
let auth = require('../middleware/authorization');

// Mock the authorization
auth.authorization = jest.fn((req, res, next) => {
  req.userId = "dummyUserId";
  next();
});

auth.adminAuthorization = jest.fn((req, res, next) => {
  next();
});


jest.mock('../middleware/sanitizeParams', () => (req, res, next) => {
  next();
});

jest.mock("../utils/user")
const userutil = require("../utils/user");
userutil.updateReputation = jest.fn();

let server;

describe("Upvote question", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async () => {
    server.close();
    await mongoose.disconnect()
  });

  it("should upvote a question", async () => {
    const mockQuestion = {
      _id: "dummyQuestionID",
      title: "dummy title",
      description: "dummy description",
      asked_by: "dummyUserID"
    }

    const mockResult = {
      upvote: true,
      downvote: false,
      vote_count: 1,
      message: "Upvoted successfully."
    }
    validate.validateId.mockReturnValueOnce(true);
    Question.findById = jest.fn().mockResolvedValueOnce(mockQuestion);
    vote.updateUpvote.mockResolvedValueOnce(mockResult);
    vote.assignVoteObject.mockResolvedValueOnce(Question);
    vote.assignPostBy.mockResolvedValueOnce(mockQuestion.asked_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":true,\"downvote\":false,\"vote_count\":1,\"message\":\"Upvoted successfully.\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockQuestion._id, type: "question" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("should remove upvote of question", async () => {
    const mockQuestion = {
      _id: "dummyQuestionID",
      title: "dummy title",
      description: "dummy description",
      asked_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: false,
      vote_count: 0,
      message: "Removed previous upvote."
    }
    validate.validateId.mockReturnValueOnce(true);
    Question.findById = jest.fn().mockResolvedValueOnce(mockQuestion);
    vote.updateUpvote.mockResolvedValueOnce(mockResult);
    vote.assignVoteObject.mockResolvedValueOnce(Question);
    vote.assignPostBy.mockResolvedValueOnce(mockQuestion.asked_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":false,\"vote_count\":0,\"message\":\"Removed previous upvote.\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockQuestion._id, type: "question" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("id not validated for question", async () => {
    const mockQuestion = {
      _id: "dummyQuestionID",
      title: "dummy title",
      description: "dummy description",
      asked_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(false);

    const mockResponse =
      "{\"status\":400,\"message\":\"Invalid id\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockQuestion._id, type: "question" });

    expect(response.status).toBe(400);
    expect(response.text).toEqual(mockResponse);

  });

  it("object not found for question", async () => {
    const mockQuestion = {
      _id: "dummyQuestionID",
      title: "dummy title",
      description: "dummy description",
      asked_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Question);
    Question.findById = jest.fn().mockResolvedValueOnce(null);

    const mockResponse =
      "{\"status\":404,\"message\":\"Object not found\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockQuestion._id, type: "question" });

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);

  });
});

describe("Upvote answer", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async () => {
    server.close();
    await mongoose.disconnect()
  });

  it("should upvote an answer", async () => {
    const mockAnswer = {
      _id: "dummyAnswerID",
      description: "dummy description",
      ans_by: "dummyUserID"
    }

    const mockResult = {
      upvote: true,
      downvote: false,
      vote_count: 1,
      message: "Upvoted successfully."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Answer);
    Answer.findById = jest.fn().mockResolvedValueOnce(mockAnswer);
    vote.updateUpvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockAnswer.ans_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":true,\"downvote\":false,\"vote_count\":1,\"message\":\"Upvoted successfully.\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockAnswer._id, type: "answer" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("should remove upvote of answer", async () => {
    const mockAnswer = {
      _id: "dummyAnswerID",
      description: "dummy description",
      ans_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: false,
      vote_count: 0,
      message: "Removed previous upvote."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Answer);
    Answer.findById = jest.fn().mockResolvedValueOnce(mockAnswer);
    vote.updateUpvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockAnswer.ans_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":false,\"vote_count\":0,\"message\":\"Removed previous upvote.\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockAnswer._id, type: "answer" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("id not validated for answer", async () => {
    const mockAnswer = {
      _id: "dummyAnswerID",
      description: "dummy description",
      ans_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(false);

    const mockResponse =
      "{\"status\":400,\"message\":\"Invalid id\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockAnswer._id, type: "answer" });

    expect(response.status).toBe(400);
    expect(response.text).toEqual(mockResponse);

  });

  it("object not found for answer", async () => {
    const mockAnswer = {
      _id: "dummyAnswerID",
      description: "dummy description",
      ans_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Answer);
    Answer.findById = jest.fn().mockResolvedValueOnce(null);

    const mockResponse =
      "{\"status\":404,\"message\":\"Object not found\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockAnswer._id, type: "answer" });

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);

  });
});

describe("Upvote comment", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async () => {
    server.close();
    await mongoose.disconnect()
  });


  it("should upvote a comment", async () => {
    const mockComment = {
      _id: "dummyCommentID",
      description: "dummy description",
      commented_by: "dummyUserID"
    }

    const mockResult = {
      upvote: true,
      downvote: false,
      vote_count: 1,
      message: "Upvoted successfully."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Comment);
    Comment.findById = jest.fn().mockResolvedValueOnce(mockComment);
    vote.updateUpvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockComment.commented_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":true,\"downvote\":false,\"vote_count\":1,\"message\":\"Upvoted successfully.\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockComment._id, type: "comment" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("should remove upvote of comment", async () => {
    const mockComment = {
      _id: "dummyCommentID",
      description: "dummy description",
      commented_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: false,
      vote_count: 0,
      message: "Removed previous upvote."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Comment);
    Comment.findById = jest.fn().mockResolvedValueOnce(mockComment);
    vote.updateUpvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockComment.commented_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":false,\"vote_count\":0,\"message\":\"Removed previous upvote.\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockComment._id, type: "comment" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("id not validated for comment", async () => {
    const mockComment = {
      _id: "dummyCommentID",
      description: "dummy description",
      commented_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(false);

    const mockResponse =
      "{\"status\":400,\"message\":\"Invalid id\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockComment._id, type: "comment" });

    expect(response.status).toBe(400);
    expect(response.text).toEqual(mockResponse);

  });

  it("object not found for comment", async () => {
    const mockComment = {
      _id: "dummyCommentID",
      description: "dummy description",
      commented_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Comment);
    Comment.findById = jest.fn().mockResolvedValueOnce(null);

    const mockResponse =
      "{\"status\":404,\"message\":\"Object not found\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({ id: mockComment._id, type: "comment" });

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);

  });
});

describe("Downvote question", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async () => {
    server.close();
    await mongoose.disconnect()
  });

  it("should downvote a question", async () => {
    const mockQuestion = {
      _id: "dummyQuestionID",
      title: "dummy title",
      description: "dummy description",
      asked_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: true,
      vote_count: -1,
      message: "Downvoted successfully."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Question);
    Question.findById = jest.fn().mockResolvedValueOnce(mockQuestion);
    vote.updateDownvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockQuestion.asked_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":true,\"vote_count\":-1,\"message\":\"Downvoted successfully.\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockQuestion._id, type: "question" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("should remove downvote of question", async () => {
    const mockQuestion = {
      _id: "dummyQuestionID",
      title: "dummy title",
      description: "dummy description",
      asked_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: false,
      vote_count: 0,
      message: "Removed previous downvote."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Question);
    Question.findById = jest.fn().mockResolvedValueOnce(mockQuestion);
    vote.updateDownvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockQuestion.asked_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":false,\"vote_count\":0,\"message\":\"Removed previous downvote.\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockQuestion._id, type: "question" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("id not validated for question", async () => {
    const mockQuestion = {
      _id: "dummyQuestionID",
      title: "dummy title",
      description: "dummy description",
      asked_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(false);

    const mockResponse =
      "{\"status\":400,\"message\":\"Invalid id\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockQuestion._id, type: "question" });

    expect(response.status).toBe(400);
    expect(response.text).toEqual(mockResponse);

  });

  it("object not found for question", async () => {
    const mockQuestion = {
      _id: "dummyQuestionID",
      title: "dummy title",
      description: "dummy description",
      asked_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Question);
    Question.findById = jest.fn().mockResolvedValueOnce(null);

    const mockResponse =
      "{\"status\":404,\"message\":\"Object not found\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockQuestion._id, type: "question" });

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);

  });
});

describe("Downvote answer", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async () => {
    server.close();
    await mongoose.disconnect()
  });

  it("should downvote an answer", async () => {
    const mockAnswer = {
      _id: "dummyAnswerID",
      description: "dummy description",
      ans_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: true,
      vote_count: -1,
      message: "Downvoted successfully."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Answer);
    Answer.findById = jest.fn().mockResolvedValueOnce(mockAnswer);
    vote.updateDownvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockAnswer.ans_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":true,\"vote_count\":-1,\"message\":\"Downvoted successfully.\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockAnswer._id, type: "answer" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("should remove downvote of answer", async () => {
    const mockAnswer = {
      _id: "dummyAnswerID",
      description: "dummy description",
      ans_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: false,
      vote_count: 0,
      message: "Removed previous downvote."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Answer);
    Answer.findById = jest.fn().mockResolvedValueOnce(mockAnswer);
    vote.updateDownvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockAnswer.ans_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":false,\"vote_count\":0,\"message\":\"Removed previous downvote.\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockAnswer._id, type: "answer" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("id not validated for answer", async () => {
    const mockAnswer = {
      _id: "dummyAnswerID",
      description: "dummy description",
      ans_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(false);

    const mockResponse =
      "{\"status\":400,\"message\":\"Invalid id\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockAnswer._id, type: "answer" });

    expect(response.status).toBe(400);
    expect(response.text).toEqual(mockResponse);

  });

  it("object not found for answer", async () => {
    const mockAnswer = {
      _id: "dummyAnswerID",
      description: "dummy description",
      ans_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Answer);
    Answer.findById = jest.fn().mockResolvedValueOnce(null);

    const mockResponse =
      "{\"status\":404,\"message\":\"Object not found\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockAnswer._id, type: "answer" });

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);

  });
});

describe("Downvote comment", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async () => {
    server.close();
    await mongoose.disconnect()
  });


  it("should downvote a comment", async () => {
    const mockComment = {
      _id: "dummyCommentID",
      description: "dummy description",
      commented_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: true,
      vote_count: -1,
      message: "Downvoted successfully."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Comment);
    Comment.findById = jest.fn().mockResolvedValueOnce(mockComment);
    vote.updateDownvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockComment.commented_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":true,\"vote_count\":-1,\"message\":\"Downvoted successfully.\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockComment._id, type: "comment" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("should remove downvote of comment", async () => {
    const mockComment = {
      _id: "dummyCommentID",
      description: "dummy description",
      commented_by: "dummyUserID"
    }

    const mockResult = {
      upvote: false,
      downvote: false,
      vote_count: 0,
      message: "Removed previous downvote."
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Comment);
    Comment.findById = jest.fn().mockResolvedValueOnce(mockComment);
    vote.updateDownvote.mockResolvedValueOnce(mockResult);
    vote.assignPostBy.mockResolvedValueOnce(mockComment.commented_by);
    userutil.updateReputation.mockResolvedValueOnce(mockResult);

    const mockResponse =
      "{\"status\":200,\"upvote\":false,\"downvote\":false,\"vote_count\":0,\"message\":\"Removed previous downvote.\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockComment._id, type: "comment" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("id not validated for comment", async () => {
    const mockComment = {
      _id: "dummyCommentID",
      description: "dummy description",
      commented_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(false);

    const mockResponse =
      "{\"status\":400,\"message\":\"Invalid id\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockComment._id, type: "comment" });

    expect(response.status).toBe(400);
    expect(response.text).toEqual(mockResponse);

  });

  it("object not found for comment", async () => {
    const mockComment = {
      _id: "dummyCommentID",
      description: "dummy description",
      commented_by: "dummyUserID"
    }
    validate.validateId.mockReturnValueOnce(true);
    vote.assignVoteObject.mockResolvedValueOnce(Comment);
    Comment.findById = jest.fn().mockResolvedValueOnce(null);

    const mockResponse =
      "{\"status\":404,\"message\":\"Object not found\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({ id: mockComment._id, type: "comment" });

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);

  });
});

describe("Internal server error", () => {

  it("Internal server error for upvote", async () => {

    validate.validateId.mockImplementation(() => {
      throw new Error("Random!");
    });
    const mockResponse =
      "{\"status\":500,\"message\":\"Internal Server Error\"}";

    const response = await supertest(server)
      .post("/vote/upvote")
      .send({});

    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);
  });

  it("Internal server error for downvote", async () => {

    validate.validateId.mockImplementation(() => {
      throw new Error("Random!");
    });
    const mockResponse =
      "{\"status\":500,\"message\":\"Internal Server Error\"}";

    const response = await supertest(server)
      .post("/vote/downvote")
      .send({});

    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);
  });
});

// Note: See about more test cases