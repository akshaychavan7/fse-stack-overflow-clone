// Unit tests for addAnswer in contoller/answer.js

const supertest = require("supertest")
const { default: mongoose } = require("mongoose");

const Answer = require("../models/answers");
const Question = require("../models/questions");
const Comment = require("../models/comments");

// Mock the Comment model
jest.mock("../models/comments");

jest.mock("../utils/validator");
let validate = require('../utils/validator');

validate.validateId = jest.fn((id) => {
  return true;
})

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

let server;
describe("Add Question Comment and Answer Comment", () => {

  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async() => {
    server.close();
    await mongoose.disconnect()
  });

  it("should add a new comment to the question", async () => {
    // Mocking the request body
    const mockReqBody = {
      parentId: "dummyQuestionId",
      parentType: "question",
      description: "This is a test question comment"
    };

    const mockComment = {
      _id: "dummyCommentId",
      description: "This is a test question comment",
      commented_by: "dummyUserId",
      comment_date_time: "2024-05-22T16:08:22.613Z"
    }

    
    // Mock the create method of the Comment model
    Comment.create.mockResolvedValueOnce(mockComment);

    Question.exists = jest.fn().mockResolvedValueOnce(true);
    // Mocking the Question.findOneAndUpdate method
    Question.findByIdAndUpdate = jest.fn().mockResolvedValueOnce({
      _id: "dummyQuestionId",
      comments: ["dummyCommentId"]
    });

    // Making the request
    const response = await supertest(server)
      .post("/comment/addComment")
      .send(mockReqBody);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body.body).toEqual(mockComment);

    // Verifying that Comment.create method was called with the correct arguments
    expect(Comment.create).toHaveBeenCalledWith({
        description: "This is a test question comment",
        commented_by: "dummyUserId",
    });

    // Verifying that Question.findOneAndUpdate method was called with the correct arguments
    expect(Question.findByIdAndUpdate).toHaveBeenCalledWith(
      "dummyQuestionId",
      { $push: { comments: { $each: ["dummyCommentId"], $position: 0 } } },
      { new: true }
    );
  });


  it("should add a new comment to the answer", async () => {
    // Mocking the request body
    const mockReqBody = {
      parentId: "dummyAnswerId",
      parentType: "answer",
      description: "This is a test answer comment"
    };

    const mockComment = {
      _id: "dummyCommentId",
      description: "This is a test answer comment",
      commented_by: "dummyUserId",
      comment_date_time: "2024-05-22T16:08:22.613Z"
    }
    // Mock the create method of the Comment model
    Comment.create.mockResolvedValueOnce(mockComment);

    Answer.exists = jest.fn().mockResolvedValueOnce(true);

    // Mocking the Answer.findOneAndUpdate method
    Answer.findByIdAndUpdate = jest.fn().mockResolvedValueOnce({
      _id: "dummyAnswerId",
      comments: ["dummyCommentId"]
    });

    // Making the request
    const response = await supertest(server)
      .post("/comment/addComment")
      .send(mockReqBody);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body.body).toEqual(mockComment);

    // Verifying that Comment.create method was called with the correct arguments
    expect(Comment.create).toHaveBeenCalledWith({
        description: "This is a test answer comment",
        commented_by: "dummyUserId",
    });

    // Verifying that Answer.findOneAndUpdate method was called with the correct arguments
    expect(Answer.findByIdAndUpdate).toHaveBeenCalledWith(
      "dummyAnswerId",
      { $push: { comments: { $each: ["dummyCommentId"], $position: 0 } } },
      { new: true }
    );
  });
});
