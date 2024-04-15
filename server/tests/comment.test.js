// Unit tests for addAnswer in contoller/answer.js

const supertest = require("supertest")
const { default: mongoose } = require("mongoose");

const Answer = require("../models/answers");
const Question = require("../models/questions");
const Comment = require("../models/comments");

// Mock the Comment model
jest.mock("../models/comments");

// Mock the authorization
jest.mock('../middleware/authorization', () => (req, res, next) => {
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
      qid: "dummyQuestionId",
      comment: {
        description: "This is a test question comment",
        commented_by: "dummyUserId",
        comment_date_time: "2024-05-22T16:08:22.613Z"
      }
    };

    const mockComment = {
      _id: "dummyCommentId",
      description: "This is a test question comment",
      commented_by: "dummyUserId",
      comment_date_time: "2024-05-22T16:08:22.613Z"
    }
    // Mock the create method of the Comment model
    Comment.create.mockResolvedValueOnce(mockComment);

    // Mocking the Question.findOneAndUpdate method
    Question.findOneAndUpdate = jest.fn().mockResolvedValueOnce({
      _id: "dummyQuestionId",
      comments: ["dummyCommentId"]
    });

    // Making the request
    const response = await supertest(server)
      .post("/comment/addQuestionComment")
      .send(mockReqBody);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockComment);

    // Verifying that Comment.create method was called with the correct arguments
    expect(Comment.create).toHaveBeenCalledWith({
        description: "This is a test question comment",
        commented_by: "dummyUserId",
        comment_date_time: "2024-05-22T16:08:22.613Z"
    });

    // Verifying that Question.findOneAndUpdate method was called with the correct arguments
    expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "dummyQuestionId" },
      { $push: { comments: { $each: ["dummyCommentId"], $position: 0 } } },
      { new: true }
    );
  });


  it("should add a new comment to the answer", async () => {
    // Mocking the request body
    const mockReqBody = {
      aid: "dummyAnswerId",
      comment: {
        description: "This is a test answer comment",
        commented_by: "dummyUserId",
        comment_date_time: "2024-05-22T16:08:22.613Z"
      }
    };

    const mockComment = {
      _id: "dummyCommentId",
      description: "This is a test answer comment",
      commented_by: "dummyUserId",
      comment_date_time: "2024-05-22T16:08:22.613Z"
    }
    // Mock the create method of the Comment model
    Comment.create.mockResolvedValueOnce(mockComment);

    // Mocking the Answer.findOneAndUpdate method
    Answer.findOneAndUpdate = jest.fn().mockResolvedValueOnce({
      _id: "dummyAnswerId",
      comments: ["dummyCommentId"]
    });

    // Making the request
    const response = await supertest(server)
      .post("/comment/addAnswerComment")
      .send(mockReqBody);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockComment);

    // Verifying that Comment.create method was called with the correct arguments
    expect(Comment.create).toHaveBeenCalledWith({
        description: "This is a test answer comment",
        commented_by: "dummyUserId",
        comment_date_time: "2024-05-22T16:08:22.613Z"
    });

    // Verifying that Answer.findOneAndUpdate method was called with the correct arguments
    expect(Answer.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "dummyAnswerId" },
      { $push: { comments: { $each: ["dummyCommentId"], $position: 0 } } },
      { new: true }
    );
  });
});
