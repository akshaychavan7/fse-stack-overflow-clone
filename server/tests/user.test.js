const supertest = require("supertest")
const { default: mongoose } = require("mongoose");

const Answer = require("../models/answers");
const Question = require("../models/questions");
const Comment = require("../models/comments");
const User = require("../models/users");

jest.mock("../models/answers");
jest.mock("../models/questions");
jest.mock("../models/comments");
jest.mock("../models/users");


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
  req.userId = "dummyUser1";
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
const comments = require("../models/comments");
userutil.updateReputation = jest.fn();
userutil.getQuestionsByUser = jest.fn();
userutil.getAnswersByUser = jest.fn();
userutil.getCommentsByUser = jest.fn();


const mockQuestion1 = {
    _id: "dummyQuestionId",
    title: "Demo question",
    description: "This is a test question",
    ask_date_time: "2024-05-22T16:08:22.613Z",
    flag: true,
    asked_by: "dummyUser1" 
  }

  const mockQuestion2 = {
    _id: "dummyQuestionId2",
    title: "Demo question 2",
    description: "This is a test question 2",
    ask_date_time: "2024-05-22T16:08:22.613Z",
    flag: false,
    asked_by: "dummyUser2"
  }

let user1 = {
    _id: "dummyUser1",
    username: "user1",
    firstname: "fn1",
    lastname: "ln1",
    profilePic: "",
    location: "Boston",
    technologies: ["React"],
    joiningDate:"2024-05-22T16:08:22.613Z",
    userRole: "general",
    reputation: 10,
    questions: [mockQuestion1],
    answers: [],
    comments: []
}

let user2 = {
    _id: "dummyUser2",
    username: "user2",
    firstname: "fn2",
    lastname: "ln2",
    profilePic: "",
    location: "Seattle",
    technologies: ["Javascript"],
    joiningDate:"2024-05-22T16:08:22.613Z",
    userRole: "moderator",
    reputation: 20,
    questions: [mockQuestion2],
    answers: [],
    comments: []
}

let users = [user1, user2];


let server;


describe("Get list of users.", () => {
    beforeEach(() => {
        server = require("../server");
      })
    
    afterEach(async() => {
        server.close();
        await mongoose.disconnect()
    });

    it("Get the list of users", async () => {
        let mockUsers = [
            {
                username: "user1",
                name: "fn1 ln1",
                profilePic: "",
                location: "Boston",
                technologies: ["React"],
            },
            {
                username: "user2",
                name: "fn2 ln2",
                profilePic: "",
                location: "Seattle",
                technologies: ["Javascript"],
            }
        ]
        User.find = jest.fn().mockResolvedValueOnce(users);

        const response = await supertest(server)
        .post("/user/getUsersList");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsers);
    });
});


describe("Get info of user", () => {
    beforeEach(() => {
        server = require("../server");
      })
    
    afterEach(async() => {
        server.close();
        await mongoose.disconnect()
    });

    it("Get information on one user", async () => {
        User.findOne = jest.fn().mockResolvedValueOnce(user1);

        userutil.getQuestionsByUser.mockResolvedValueOnce([mockQuestion1]);
        userutil.getAnswersByUser.mockResolvedValueOnce([]);
        userutil.getCommentsByUser.mockResolvedValueOnce([]);

        let mockResponse = {
            username: "user1",
            firstname: "fn1",
            lastname: "ln1",
            profilePic: "",
            location: "Boston",
            technologies: ["React"],
            joiningDate:"2024-05-22T16:08:22.613Z",
            userRole: "general",
            reputation: 10,
            questions: [mockQuestion1],
            answers: [],
            comments: []
        }

        const response = await supertest(server)
        .get("/user/getUserDetails/user1");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({userDetails: mockResponse});
    });
});

describe("Get posts of own user", () => {
    beforeEach(() => {
        server = require("../server");
      })
    
    afterEach(async() => {
        server.close();
        await mongoose.disconnect()
    });

    it("Get self contributed posts", async () => {

        userutil.getQuestionsByUser.mockResolvedValueOnce([mockQuestion1]);
        userutil.getAnswersByUser.mockResolvedValueOnce([]);
        userutil.getCommentsByUser.mockResolvedValueOnce([]);

        let mockResponse = {
            questions: [mockQuestion1],
            answers: [],
            comments: [],
        }

        const response = await supertest(server)
        .get("/user/getUserPosts");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponse);
    });
});