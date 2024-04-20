// Unit tests for getTagsWithQuestionNumber in controller/tags.js

const supertest = require("supertest");

const Tag = require("../models/tags");
const Question = require("../models/questions");
const { default: mongoose } = require("mongoose");

jest.mock("../models/questions");
jest.mock("../models/tags");

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

// Mock data for tags
const mockTags = [
  { name: "tag1" },
  { name: "tag2" },
  // Add more mock tags if needed
];

const mockQuestions = [
  { tags: [mockTags[0], mockTags[1]] },
  { tags: [mockTags[0]] },
];

let server;
describe("GET /getTagsWithQuestionNumber", () => {
  beforeEach(() => {
    server = require("../server");
  });

  afterEach(async () => {
    server.close();
    await mongoose.disconnect();
  });

  it("Throw error in fetching tag information", async () => {
    // Mocking Tag.find() and Question.find()
    Tag.find = jest.fn().mockResolvedValueOnce(mockTags);

    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValueOnce(mockQuestions),
    }));

    // Making the request
    const response = await supertest(server).get(
      "/tag/getTagsWithQuestionNumber"
    );

    // Asserting the response
    expect(response.status).toBe(200);

    // Asserting the response body
    expect(response.body).toEqual([
      { name: "tag1", qcnt: 2 },
      { name: "tag2", qcnt: 1 },
    ]);
    expect(Tag.find).toHaveBeenCalled();
    expect(Question.find).toHaveBeenCalled();
  });

  it("should return tags with question numbers", async () => {

    Question.find = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    // Making the request
    const response = await supertest(server).get(
      "/tag/getTagsWithQuestionNumber"
    );

    let mockResponse = {
      error: "Error in getting tags and associated question count."
    }
    // Asserting the response
    expect(response.status).toBe(500);

    // Asserting the response body
    expect(response.body).toEqual(mockResponse);
  });
});
