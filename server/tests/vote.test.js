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
userutil.updateReputation = jest.fn();

let server;

describe("Upvote question, answer and comment", () => {
    beforeEach(() => {
        server = require("../server");
      })
    
      afterEach(async() => {
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
        Question.findById = jest.fn().mockResolvedValueOnce(mockQuestion);
        vote.updateUpvote.mockResolvedValueOnce(mockResult);
        userutil.updateReputation.mockResolvedValueOnce(mockResult);

        const mockResponse = 
        "{\"status\":200,\"upvote\":true,\"downvote\":false,\"vote_count\":1,\"message\":\"Upvoted successfully.\"}";

        const response = await supertest(server)
        .post("/vote/upvote")
        .send({id: mockQuestion._id, type: "question"});

        expect(response.status).toBe(200);
        expect(response.text).toEqual(mockResponse);

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
        Answer.findById = jest.fn().mockResolvedValueOnce(mockAnswer);
        vote.updateUpvote.mockResolvedValueOnce(mockResult);
        userutil.updateReputation.mockResolvedValueOnce(mockResult);

        const mockResponse = 
        "{\"status\":200,\"upvote\":true,\"downvote\":false,\"vote_count\":1,\"message\":\"Upvoted successfully.\"}";

        const response = await supertest(server)
        .post("/vote/upvote")
        .send({id: mockAnswer._id, type: "answer"});

        expect(response.status).toBe(200);
        expect(response.text).toEqual(mockResponse);

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
        Comment.findById = jest.fn().mockResolvedValueOnce(mockComment);
        vote.updateUpvote.mockResolvedValueOnce(mockResult);
        userutil.updateReputation.mockResolvedValueOnce(mockResult);

        const mockResponse = 
        "{\"status\":200,\"upvote\":true,\"downvote\":false,\"vote_count\":1,\"message\":\"Upvoted successfully.\"}";

        const response = await supertest(server)
        .post("/vote/upvote")
        .send({id: mockComment._id, type: "comment"});

        expect(response.status).toBe(200);
        expect(response.text).toEqual(mockResponse);

      });
});

describe("Downvote question, answer and comment", () => {
    beforeEach(() => {
        server = require("../server");
      })
    
      afterEach(async() => {
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
        Question.findById = jest.fn().mockResolvedValueOnce(mockQuestion);
        vote.updateDownvote.mockResolvedValueOnce(mockResult);
        userutil.updateReputation.mockResolvedValueOnce(mockResult);

        const mockResponse = 
        "{\"status\":200,\"upvote\":false,\"downvote\":true,\"vote_count\":-1,\"message\":\"Downvoted successfully.\"}";

        const response = await supertest(server)
        .post("/vote/downvote")
        .send({id: mockQuestion._id, type: "question"});

        expect(response.status).toBe(200);
        expect(response.text).toEqual(mockResponse);

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
        Answer.findById = jest.fn().mockResolvedValueOnce(mockAnswer);
        vote.updateDownvote.mockResolvedValueOnce(mockResult);
        userutil.updateReputation.mockResolvedValueOnce(mockResult);

        const mockResponse = 
        "{\"status\":200,\"upvote\":false,\"downvote\":true,\"vote_count\":-1,\"message\":\"Downvoted successfully.\"}";

        const response = await supertest(server)
        .post("/vote/downvote")
        .send({id: mockAnswer._id, type: "answer"});

        expect(response.status).toBe(200);
        expect(response.text).toEqual(mockResponse);

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
        Comment.findById = jest.fn().mockResolvedValueOnce(mockComment);
        vote.updateDownvote.mockResolvedValueOnce(mockResult);
        userutil.updateReputation.mockResolvedValueOnce(mockResult);

        const mockResponse = 
        "{\"status\":200,\"upvote\":false,\"downvote\":true,\"vote_count\":-1,\"message\":\"Downvoted successfully.\"}";

        const response = await supertest(server)
        .post("/vote/downvote")
        .send({id: mockComment._id, type: "comment"});

        expect(response.status).toBe(200);
        expect(response.text).toEqual(mockResponse);

      });
});