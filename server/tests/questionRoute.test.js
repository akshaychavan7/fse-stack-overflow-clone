// unit tests for functions in controller/question.js

const supertest = require("supertest");
const { default: mongoose } = require("mongoose");

const Question = require("../models/questions");
const {
  addTag,
  getQuestionsByOrder,
  filterQuestionsBySearch,
  showQuesUpDown,
  getTop10Questions,
  questionDelete,
} = require("../utils/question");
const comments = require("../models/comments");

// Mocking the models
jest.mock("../models/questions");
jest.mock("../utils/question", () => ({
  addTag: jest.fn(),
  getQuestionsByOrder: jest.fn(),
  filterQuestionsBySearch: jest.fn(),
  showQuesUpDown: jest.fn(),
  getTop10Questions: jest.fn(),
  questionDelete: jest.fn(),
}));

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

jest.mock("../utils/user")
const userutil = require("../utils/user");
const question = require("../models/schema/question");

let server;

const tag1 = {
  _id: "507f191e810c19729de860ea",
  name: "tag1",
};
const tag2 = {
  _id: "65e9a5c2b26199dbcc3e6dc8",
  name: "tag2",
};

const ans1 = {
  _id: "65e9b58910afe6e94fc6e6dc",
  description: "Answer 1 Text",
  ans_by: "answer1_user",
};

const ans2 = {
  _id: "65e9b58910afe6e94fc6e6dd",
  description: "Answer 2 Text",
  ans_by: "answer2_user",
};

const mockQuestions = [
  {
    _id: "65e9b58910afe6e94fc6e6dc",
    title: "Question 1 Title",
    description: "Question 1 Text",
    tags: [tag1],
    answers: [ans1],
    views: 21,
    asked_by: "question1_user"
  },
  {
    _id: "65e9b5a995b6c7045a30d823",
    title: "Question 2 Title",
    description: "Question 2 Text",
    tags: [tag2],
    answers: [ans2],
    views: 99,
    asked_by: "question2_user"
  },
];

describe("GET /getQuestion", () => {
  beforeEach(() => {
    server = require("../server");
  });

  afterEach(async () => {
    server.close();
    await mongoose.disconnect();
  });

  it("should return questions by filter", async () => {
    // Mock request query parameters
    const mockReqQuery = {
      order: "someOrder",
      search: "someSearch",
    };

    getQuestionsByOrder.mockResolvedValueOnce(mockQuestions);
    filterQuestionsBySearch.mockReturnValueOnce(mockQuestions);
    // Making the request
    const response = await supertest(server)
      .get("/question/getQuestion")
      .query(mockReqQuery);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockQuestions);
  });

  it("should return error on questions by filter", async () => {
    // Mock request query parameters
    const mockReqQuery = {
      order: "someOrder",
      search: "someSearch",
    };

    getQuestionsByOrder.mockImplementation(() => {
      throw new Error("Random!");
    });
    // Making the request
    const response = await supertest(server)
      .get("/question/getQuestion")
      .query(mockReqQuery);
    const mockResponse = "Internal Server Error Error: Random!"
    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);
  });
});



// Note: Figure out getQuestionById mock
describe("GET /getQuestionById/:qid", () => {
  beforeEach(() => {
    server = require("../server");
  });

  afterEach(async () => {
    server.close();
    await mongoose.disconnect();
  });

  it("should return a question by id and increment its views by 1", async () => {
    // Mock request parameters
    const mockReqParams = {
      qid: "65e9b5a995b6c7045a30d823",
    };

    const mockQuestion = {
      answers: [
        mockQuestions.filter((q) => q._id == mockReqParams.qid)[0]["answers"],
      ], // Mock answers
      views: mockQuestions[1].views + 1,
    };

    const mockToJSON = jest.fn().mockReturnValue(mockQuestion);
    Question.findOneAndUpdate = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({ toJSON: mockToJSON }),
    }));

    showQuesUpDown.mockResolvedValueOnce(mockQuestion);

    // Making the request
    const response = await supertest(server).get(
      `/question/getQuestionById/${mockReqParams.qid}`
    );

    console.log(response.body);
    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockQuestion);
  });

  // Note Add Test case for getQuestionById

  it("should return status as 500 and empty object in the response", async () => {
    // Mock request parameters
    const mockReqParams = {
      qid: "65e9b5a995b6c7045a30d823",
    };

    // Provide mock question data
    Question.findOneAndUpdate = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    // Making the request
    const response = await supertest(server).get(
      `/question/getQuestionById/${mockReqParams.qid}`
    );

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Something went wrong", details: "Random!" });
  });
});

describe("POST /addQuestion", () => {
  beforeEach(() => {
    server = require("../server");
  });

  afterEach(async () => {
    server.close();
    await mongoose.disconnect();
  });

  it("should add a new question", async () => {
    // Mock request body

    const mockTags = [tag1, tag2];

    const mockQuestion = {
      _id: "65e9b58910afe6e94fc6e6fe",
      title: "Question 3 Title",
      description: "Question 3 Text",
      asked_by: "question3_user",
      tags: ['tag1', 'tag2'],
      ask_date_time: "2024-05-22T16:08:22.613Z"
    };

    addTag.mockResolvedValueOnce(mockTags);
    Question.create.mockResolvedValueOnce(mockQuestion);

    // Making the request
    const response = await supertest(server)
      .post("/question/addQuestion")
      .send(mockQuestion);
    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockQuestion);
  });

  it("should add a new question with content flagged", async () => {
    // Mock request body

    const mockTags = [tag1, tag2];

    const mockQuestion = {
      _id: "65e9b58910afe6e94fc6e6fe",
      title: "Question 3 Title",
      description: "ass",
      asked_by: "question3_user",
      tags: ['tag1', 'tag2'],
      ask_date_time: "2024-05-22T16:08:22.613Z"
    };

    addTag.mockResolvedValueOnce(mockTags);
    Question.create.mockResolvedValueOnce(mockQuestion);

    // Making the request
    const response = await supertest(server)
      .post("/question/addQuestion")
      .send(mockQuestion);
    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockQuestion);
  });

  it("throw error while adding question", async () => {
    // Mock request body

    const mockTags = [tag1, tag2];

    const mockQuestion = {
      _id: "65e9b58910afe6e94fc6e6fe",
      title: "Question 3 Title",
      description: "Question 3 Text",
      asked_by: "question3_user",
      tags: ['tag1', 'tag2'],
      ask_date_time: "2024-05-22T16:08:22.613Z"
    };

    addTag.mockResolvedValueOnce(mockTags);
    Question.create.mockImplementation(() => {
      throw new Error("Random!");
    });

    // Making the request
    const response = await supertest(server)
      .post("/question/addQuestion")
      .send(mockQuestion);
    // Asserting the response
    const mockResponse = {error: "Internal server error."};
    expect(response.status).toBe(500);
    expect(response.body).toEqual(mockResponse);
  });
});

describe("Flag question, view flagged question and delete flagged question", () => {
  beforeEach(() => {
    server = require("../server");
  })

  afterEach(async() => {
    server.close();
    await mongoose.disconnect()
  });

  it("should flag a question", async () => {
    const mockReqBody = {
      qid: "dummyQuestionId"
    };

    const mockResponse = {
      status: 200,
      message: "Question reported successfully.",
      reportBool: true
    }

    userutil.reportPost.mockResolvedValue(true);

    Question.exists = jest.fn().mockResolvedValue(true);

    const response = await supertest(server)
      .post("/question/reportQuestion")
      .send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  it("should remove flag of a question", async () => {
    const mockReqBody = {
      qid: "dummyQuestionId"
    };

    const mockResponse = {
      status: 200,
      message: "Successfully removed report from question.",
      reportBool: false
    }

    userutil.reportPost.mockResolvedValue(false);

    Question.exists = jest.fn().mockResolvedValue(true);

    const response = await supertest(server)
      .post("/question/reportQuestion")
      .send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  it("reportQuestion question not found", async () => {
    const mockReqBody = {
      qid: "dummyQuestionId"
    };

    const mockResponse = "Question not found";

    Question.exists = jest.fn().mockResolvedValue(false);

    const response = await supertest(server)
      .post("/question/reportQuestion")
      .send(mockReqBody);

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);
  });

  it("reportQuestion error", async () => {
    const mockReqBody = {
      qid: "dummyQuestionId"
    };

    const mockResponse = "{\"status\":500,\"message\":\"Internal Server Error Error: Random!\"}";

    Question.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .post("/question/reportQuestion")
      .send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);
  });

  it("Get reported questions", async () => {
    const user1 = {
      _id: "dummyUserId",
      username: "user1",
      firstname: "name1",
      lastname: "name2",
      profilePic: ""
    }
    const mockQuestion1 = {
      _id: "dummyQuestionId",
      title: "Demo question",
      description: "This is a test question",
      ask_date_time: "2024-05-22T16:08:22.613Z",
      flag: true,
      asked_by: user1 
    }
    const mockQuestions = [mockQuestion1];
    Question.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockQuestions),
    }));
    
    const mockResponse = 
    "[{\"_id\":\"dummyQuestionId\",\"title\":\"Demo question\","+
    "\"description\":\"This is a test question\",\"ask_date_time\":"+
    "\"2024-05-22T16:08:22.613Z\",\"flag\":true,\"asked_by\":{\"_id\":"+
    "\"dummyUserId\",\"username\":\"user1\",\"firstname\":\"name1\","+
    "\"lastname\":\"name2\",\"profilePic\":\"\"}}]"

    const response = await supertest(server)
      .get("/question/getReportedQuestions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockQuestions);

  });

  it("Get reported questions server error", async () => {

    Question.find = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });
    
    const mockResponse = "{\"status\":500,\"message\":\"Internal Server Error\"}";

    const response = await supertest(server)
      .get("/question/getReportedQuestions");

    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);

  });

  it("Delete question", async () => {

    const mockResponse = {status: 200, message: "Question deleted successfully"};

    questionDelete.mockResolvedValueOnce(mockResponse);

    Question.exists = jest.fn().mockResolvedValue(true);

    const response = await supertest(server)
      .delete("/question/deleteQuestion/dummyQuestionId");

    expect(response.status).toBe(mockResponse.status);
    expect(response.text).toEqual(mockResponse.message);

  });

  it("Delete question, question not found", async () => {

    const mockResponse = {status: 404, message: "Question not found"};

    Question.exists = jest.fn().mockResolvedValue(false);

    const response = await supertest(server)
      .delete("/question/deleteQuestion/dummyQuestionId");

    expect(response.status).toBe(mockResponse.status);
    expect(response.text).toEqual(mockResponse.message);

  });

  it("Error in deleting question", async () => {

    const mockResponse = {status: 500, message: "Internal Server Error"};

    questionDelete.mockResolvedValueOnce(mockResponse);

    Question.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .delete("/question/deleteQuestion/dummyQuestionId");

    expect(response.status).toBe(mockResponse.status);
    expect(response.text).toEqual(mockResponse.message);

  });

  it("Resolve question", async () => {

    const mockResponse = "Question resolved successfully";

    Question.exists = jest.fn().mockResolvedValue(true);
    Question.findByIdAndUpdate = jest.fn()

    const response = await supertest(server)
      .post("/question/resolveQuestion/dummyQuestionId");

    expect(response.status).toBe(200);
    expect(response.text).toEqual(mockResponse);

  });

  it("Resolve question, question not found", async () => {

    const mockResponse = "Question not found";

    Question.exists = jest.fn().mockResolvedValue(false);

    const response = await supertest(server)
      .post("/question/resolveQuestion/dummyQuestionId");

    expect(response.status).toBe(404);
    expect(response.text).toEqual(mockResponse);

  });

  it("Resolve question server error", async () => {

    const mockResponse = "Internal Server Error";

    Question.exists = jest.fn().mockImplementation(() => {
      throw new Error("Random!");
    });

    const response = await supertest(server)
      .post("/question/resolveQuestion/dummyQuestionId");

    expect(response.status).toBe(500);
    expect(response.text).toEqual(mockResponse);

  });
});

describe("View trending questions", () => {
  it("Get trending questions", async () => {
    const user1 = {
      _id: "dummyUserId",
      username: "user1",
      firstname: "name1",
      lastname: "name2",
      profilePic: ""
    }
    const user2 = {
      _id: "dummyUserId2",
      username: "user2",
      firstname: "name3",
      lastname: "name4",
      profilePic: ""
    }
    const mockQuestion1 = {
      _id: "dummyQuestionId",
      title: "Demo question",
      description: "This is a test question",
      ask_date_time: "2024-05-22T16:08:22.613Z",
      flag: true,
      asked_by: user1 
    }
    const mockQuestion2 = {
      _id: "dummyQuestionId2",
      title: "Demo question 2",
      description: "This is a test question 2",
      ask_date_time: "2024-05-22T16:08:22.613Z",
      flag: false,
      asked_by: user2
    }

    let questions = [mockQuestion1,mockQuestion2];
    getTop10Questions.mockResolvedValueOnce(questions);

    const response = await supertest(server)
      .get("/question/getTrendingQuestions");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(questions);
  });

  it("Get trending questions error", async () => {
    getTop10Questions.mockImplementation(() => {
      throw new Error("Random!");
    });;

    let mockResponse =  { error: `Cannot fetch trending questions: Error: Random!` }

    const response = await supertest(server)
      .get("/question/getTrendingQuestions");
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual(mockResponse);
  });
});
