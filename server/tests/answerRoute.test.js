// Unit tests for addAnswer in contoller/answer.js

const supertest = require("supertest")
const { default: mongoose } = require("mongoose");

const Answer = require("../models/answers");
const Question = require("../models/questions");

// Mock the Answer model
jest.mock("../models/answers");

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

jest.mock("../utils/answer")
const answerUtil = require("../utils/answer");
answerUtil.ansDelete = jest.fn();

let server;
describe("POST /addAnswer", () => {

  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async() => {
    server.close();
    await mongoose.disconnect()
  });

  it("should add a new answer to the question", async () => {
    // Mocking the request body
    const mockReqBody = {
      qid: "dummyQuestionId",
      ans: {
        description: "This is a test answer",
        ans_by: "dummyUserId"
      }
    };

    const mockAnswer = {
      _id: "dummyAnswerId",
      description: "This is a test answer",
      ans_by: "dummyUserId"
    }
    // Mock the create method of the Answer model
    Answer.create.mockResolvedValueOnce(mockAnswer);

    // Mocking the Question.findOneAndUpdate method
    Question.findOneAndUpdate = jest.fn().mockResolvedValueOnce({
      _id: "dummyQuestionId",
      answers: ["dummyAnswerId"]
    });

    // Making the request
    const response = await supertest(server)
      .post("/answer/addAnswer")
      .send(mockReqBody);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAnswer);

    // Verifying that Answer.create method was called with the correct arguments
    expect(Answer.create).toHaveBeenCalledWith({
      description: "This is a test answer",
      ans_by: "dummyUserId",
      flag: false
    });

    // Verifying that Question.findOneAndUpdate method was called with the correct arguments
    expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "dummyQuestionId" },
      { $push: { answers: { $each: ["dummyAnswerId"], $position: 0 } } },
      { new: true }
    );
  });

  it("should throw an error while adding answer", async () => {
    const mockReqBody = {
      qid: "dummyQuestionId",
      ans: {
        description: "This is a test answer",
        ans_by: "dummyUserId"
      }
    };

    Answer.create.mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .post("/answer/addAnswer")
      .send(mockReqBody);
    
    const mockResponse = {
      message: "Internal Server Error"
    }

    expect(response.status).toBe(500);
    expect(response.body).toEqual(mockResponse);

  });
});

describe("Flag answer", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async() => {
    server.close();
    await mongoose.disconnect()
  })

  it("should flag an answer", async () => {
    const mockReqBody = {
      aid: "dummyAnswerId"
    };

    const mockResponse = {
      status: 200,
      message: "Answer reported successfully.",
      reportBool: true
    }

    userutil.reportPost.mockResolvedValue(true);

    Answer.exists = jest.fn().mockResolvedValue(true);

    const response = await supertest(server)
      .post("/answer/reportAnswer")
      .send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  it("throw error on flagging answer", async () => {
    const mockReqBody = {
      aid: "dummyAnswerId"
    };

    const mockResponse = { 
      status: 500, message: "Internal Server Error" 
    }

    Answer.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .post("/answer/reportAnswer")
      .send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.body).toEqual(mockResponse);
  });
});

describe("View flagged answers", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async() => {
    server.close();
    await mongoose.disconnect()
  });

  it("Get reported answers", async () => {
    const user1 = {
      _id: "dummyUserId",
      username: "user1",
      firstname: "name1",
      lastname: "name2",
      profilePic: ""
    }
    const mockAnswer1 = {
      _id: "dummyAnswerId",
      description: "This is a test answer",
      ans_date_time: "2024-05-22T16:08:22.613Z",
      flag: true,
      ans_by: user1 
    }
    const mockAnswers = [mockAnswer1];
    Answer.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockAnswers),
    }));

    const response = await supertest(server)
      .get("/answer/getReportedAnswers");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAnswers);

  });

  it("Error on getting reported answers", async () => {
    Answer.find = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .get("/answer/getReportedAnswers");


    const mockResponse = {
      status: 500, message: "Internal Server Error"
    }
    expect(response.status).toBe(500);
    expect(response.body).toEqual(mockResponse);

  });
});
describe("Delete flagged answers", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async() => {
    server.close();
    await mongoose.disconnect()
  });

  it("Delete answer", async () => {

    const mockResponse = {status: 200, message:"Answer deleted successfully"};
    let question = {_id: "dummyQuesId", answers: ["dummyAnsId"]};
    Question.exists = jest.fn().mockResolvedValueOnce(true);
    Question.findOne = jest.fn().mockResolvedValueOnce(question);
    Answer.exists = jest.fn().mockResolvedValue(true);
    answerUtil.ansDelete.mockResolvedValueOnce(mockResponse);
    

    const response = await supertest(server)
      .delete("/answer/deleteAnswer/dummyAnswerId")
      .send({qid: "dummyQuestionId"});


    expect(response.status).toBe(mockResponse.status);
    expect(response.text).toEqual(mockResponse.message);

  });

  it("Error in deleting answer", async () => {

    const mockResponse = "Internal Server Error";

    Question.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });
    

    const response = await supertest(server)
      .delete("/answer/deleteAnswer/dummyAnswerId");

    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);

  });

});

describe("Resolve flagged answers", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async() => {
    server.close();
    await mongoose.disconnect()
  });


  it("Resolve answer", async () => {

    const mockResponse = "Answer resolved successfully";

    Answer.exists = jest.fn().mockResolvedValue(true);
    Answer.findByIdAndUpdate = jest.fn()

    const response = await supertest(server)
      .post("/answer/resolveAnswer/dummyAnswerId");

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("Resolve answer", async () => {

    const mockResponse = "Internal Server Error";

    Answer.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .post("/answer/resolveAnswer/dummyAnswerId");

    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);

  });

  
});
