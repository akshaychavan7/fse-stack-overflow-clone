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

jest.mock("../utils/user")
const userutil = require("../utils/user");


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

    Question.exists = jest.fn().mockResolvedValue(true);
    // Mocking the Question.findOneAndUpdate method
    Question.findByIdAndUpdate = jest.fn().mockResolvedValue({
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
        flag: false
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

    Answer.exists = jest.fn().mockResolvedValue(true);

    // Mocking the Answer.findOneAndUpdate method
    Answer.findByIdAndUpdate = jest.fn().mockResolvedValue({
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
        flag: false
    });

    // Verifying that Answer.findOneAndUpdate method was called with the correct arguments
    expect(Answer.findByIdAndUpdate).toHaveBeenCalledWith(
      "dummyAnswerId",
      { $push: { comments: { $each: ["dummyCommentId"], $position: 0 } } },
      { new: true }
    );
  });
});

describe("Flag comment, view flagged comments and delete flagged comments", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async() => {
    server.close();
    await mongoose.disconnect()
  });

  // Note: find how to test .save()
  it("should flag a comment", async () => {
    const mockReqBody = {
      cid: "dummyCommentId"
    };

    const mockResponse = {
      status: 200,
      message: "Comment reported successfully.",
      reportBool: true
    }

    userutil.reportPost.mockResolvedValue(true);

    Comment.exists = jest.fn().mockResolvedValue(true);

    const response = await supertest(server)
      .post("/comment/reportComment")
      .send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  // Note: Check how to logically get comments based on flag
  it("Get reported comments", async () => {
    const user1 = {
      _id: "dummyUserId",
      username: "user1",
      firstname: "name1",
      lastname: "name2",
      profilePic: ""
    }
    const mockComment1 = {
      _id: "dummyCommentId",
      description: "This is a test answer comment",
      comment_date_time: "2024-05-22T16:08:22.613Z",
      flag: true,
      commented_by: user1 
    }
    const mockComments = [mockComment1];
    Comment.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockComments),
    }));

    const response = await supertest(server)
      .get("/comment/getReportedComments");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockComments);

  });

  it("Delete comment", async () => {

    const mockResponse = "Comment deleted successfully";

    Comment.exists = jest.fn().mockResolvedValue(true);
    Comment.findByIdAndDelete = jest.fn()

    const response = await supertest(server)
      .delete("/comment/deleteComment/dummyCommentId");

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("Resolve comment", async () => {

    const mockResponse = "Comment resolved successfully";

    Comment.exists = jest.fn().mockResolvedValue(true);
    Comment.findByIdAndUpdate = jest.fn()

    const response = await supertest(server)
      .post("/comment/resolveComment/dummyCommentId");

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });
});