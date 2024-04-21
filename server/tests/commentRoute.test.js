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

jest.mock("../utils/comment")
const commentUtil = require("../utils/comment");
commentUtil.commentDelete = jest.fn();


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

    validate.validateId.mockReturnValue(true);
    
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

    validate.validateId.mockReturnValue(true);
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

  it("invalid parent id entered", async () => {
    // Mocking the request body
    const mockReqBody = {
      parentId: "dummyQuestionId",
      parentType: "question",
      description: "This is a test question comment"
    };

    const mockComment = {
      _id: "dummyCommentId",
      description: "This is a test answer comment",
      commented_by: "dummyUserId",
      comment_date_time: "2024-05-22T16:08:22.613Z"
    }

    const mockResponse = "{\"status\":400,\"message\":\"Invalid parent id\"}";


    validate.validateId.mockReturnValue(false);
    
    // Mock the create method of the Comment model
    Comment.create.mockResolvedValueOnce(mockComment);

    // Making the request
    const response = await supertest(server)
      .post("/comment/addComment")
      .send(mockReqBody);

    // Asserting the response
    expect(response.status).toBe(400);
    expect(response.text).toEqual(mockResponse);
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

  it("should remove flag of a comment", async () => {
    const mockReqBody = {
      cid: "dummyCommentId"
    };

    const mockResponse = {
      status: 200,
      message: "Successfully removed report from comment.",
      reportBool: false
    }

    userutil.reportPost.mockResolvedValue(false);

    Comment.exists = jest.fn().mockResolvedValue(true);

    const response = await supertest(server)
      .post("/comment/reportComment")
      .send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  it("reportComment comment not found", async () => {
    const mockReqBody = {
      cid: "dummyCommentId"
    };

    const mockResponse = {"message": "Comment not found", "status": 404};

    Comment.exists = jest.fn().mockResolvedValue(false)

    const response = await supertest(server)
      .post("/comment/reportComment")
      .send(mockReqBody);

    expect(response.status).toBe(404);
    expect(response.body).toEqual(mockResponse);
  });

  it("reportComment gives error", async () => {
    const mockReqBody = {
      cid: "dummyCommentId"
    };

    const mockResponse = {"message": "Internal Server Error", "status": 500};

    Comment.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .post("/comment/reportComment")
      .send(mockReqBody);

    expect(response.status).toBe(500);
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

  it("getReportedComments server error", async () => {

    Comment.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => {
        throw new Error("Random!");
      })
    }));

    const response = await supertest(server)
      .get("/comment/getReportedComments");

    const mockResponse = "Internal Server Error";
    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);

  });

  it("Delete comment of a question", async () => {

    const mockResponse = {status: 200, message: "Comment deleted successfully"};
    let question = {_id: "dummyQuesId", comments: ["dummyCommentId"]};
    Question.exists = jest.fn().mockResolvedValue(true);
    Question.findOne = jest.fn().mockResolvedValue(question);
    Comment.exists = jest.fn().mockResolvedValue(true);
    commentUtil.commentDelete.mockResolvedValueOnce(mockResponse);

    const response = await supertest(server)
      .delete("/comment/deleteComment/dummyCommentId");

    expect(response.status).toBe(mockResponse.status);
    expect(response.text).toEqual(mockResponse.message);

  });

  it("Delete comment of an answer", async () => {

    const mockResponse = {status: 200, message: "Comment deleted successfully"};
    let answer = {_id: "dummyAnsId", comments: ["dummyCommentId"]};
    Answer.exists = jest.fn().mockResolvedValue(true);
    Answer.findOne = jest.fn().mockResolvedValue(answer);
    Comment.exists = jest.fn().mockResolvedValue(true);
    commentUtil.commentDelete.mockResolvedValueOnce(mockResponse);

    const response = await supertest(server)
      .delete("/comment/deleteComment/dummyCommentId");

    expect(response.status).toBe(mockResponse.status);
    expect(response.text).toEqual(mockResponse.message);

  });

  it("Delete comment invalid parent id", async () => {

    const mockResponse = {status: 404, message: "Invalid parent id"};
    let answer = {_id: "dummyAnsId", comments: ["dummyCommentId"]};
    Question.exists = jest.fn().mockResolvedValue(false);
    Answer.exists = jest.fn().mockResolvedValue(false);

    const response = await supertest(server)
      .delete("/comment/deleteComment/dummyCommentId");

    expect(response.status).toBe(mockResponse.status);
    expect(response.text).toEqual(mockResponse.message);

  });

  it("Delete comment throws error", async () => {

    const mockResponse = {status: 500, message: "Internal Server Error"};
    Question.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .delete("/comment/deleteComment/dummyCommentId");

    expect(response.status).toBe(mockResponse.status);
    expect(response.text).toEqual(mockResponse.message);

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

  it("Resolve comment not found", async () => {

    const mockResponse = "Comment not found";

    Comment.exists = jest.fn().mockResolvedValue(false);

    const response = await supertest(server)
      .post("/comment/resolveComment/dummyCommentId");

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);

  });

  it("Resolve comment not found", async () => {

    const mockResponse = "Internal Server Error";

    Comment.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .post("/comment/resolveComment/dummyCommentId");

    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);

  });
});