const supertest = require("supertest");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

const User = require("../models/users");

const user1 = {
    _id: "65e9b58910afe6e94fc6e6dc",
    username: "user1",
    password: bcrypt.hashSync("password", 10),
    firstname: "fn1",
    lastname: "ln1",
    joiningDate: new Date("2023-11-16T09:24:00"),
    profilePic: "",
    userRole: "general",
    technologies: ["React"],
    location: "Boston, MA",
    reputation: 0
}

const user2 = {
    _id: "65e9b5a995b6c7045a30d823",
    username: "user2",
    password: bcrypt.hashSync("password", 10),
    firstname: "fn2",
    lastname: "ln2",
    joiningDate: new Date("2023-12-16T09:24:00"),
    profilePic: "",
    userRole: "general",
    technologies: ["React"],
    location: "Boston, MA",
    reputation: 0
}

const users = [
    user1,
    user2
]

jest.mock("../models/users");

let server;

describe("POST /authenticate", () => {
    beforeEach(() => {
      server = require("../server");
    });
  
    afterEach(async () => {
      server.close();
      await mongoose.disconnect();
    });
  
    it("should login the user", async () => {
      // Mock request query parameters
      const mockReqResponse = {
        status: 200,
        message: "Logged In Successfully",
        user: {
          firstname: "fn1",
          lastname: "ln1",
          profilePic: "",
          username: "user1",
          }
      };

      const mockReq = {
        username: "user1",
        password: "password"
      }
      

      User.findOne = jest.fn().mockResolvedValueOnce(user1);

      const response = await supertest(server).post(
        '/login/authenticate'
      ).send(mockReq);

      const cookie = response.headers['set-cookie'];
      // Asserting the response
      expect(cookie).toBeDefined();
      expect(cookie.toString().includes('HttpOnly')).toBeTruthy();
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReqResponse);
    });

    it("should deny login due to incorrect credentials", async () => {
      // Mock request query parameter
      const mockReq = {
        username: "user1",
        password: "password"
      }
      

      User.findOne = jest.fn().mockResolvedValueOnce(false);

      const response = await supertest(server).post(
        '/login/authenticate'
      ).send(mockReq);

      const mockResponse = {
        status: 401, message: "Invalid username or password"
      }

      expect(response.status).toBe(401);
      expect(response.body).toEqual(mockResponse);
    });

    it("should throw error on login", async () => {
      // Mock request query parameter
      const mockReq = {
        username: "user1",
        password: "password"
      }
      

      User.findOne = jest.fn().mockImplementation(() => {
        throw new Error("Random!");
      });

      const response = await supertest(server).post(
        '/login/authenticate'
      ).send(mockReq);

      const mockResponse = {
        message: "Internal Server Error"
      }

      expect(response.status).toBe(500);
      expect(response.body).toEqual(mockResponse);
    });

    
  });

  describe("POST /register", () => {
    beforeEach(() => {
      server = require("../server");
    });
  
    afterEach(async () => {
      server.close();
      await mongoose.disconnect();
    });
  
    it("should register the user", async () => {
      // Mock request query parameters
      const mockReq = {
        firstname: "fn1",
        lastname: "ln1",
        password: "password",
        profilePic: "",
        username: "user1",
      };
      

      User.findOne = jest.fn().mockResolvedValueOnce(false);
      User.create = jest.fn().mockResolvedValueOnce(mockReq);

      const response = await supertest(server).post(
        '/login/register'
      ).send(mockReq);

      const mockResponse = {
        status: 200, message: "User registered successfully"
      }

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);

    });

    it("stop a pre-registered user from registering", async () => {
      // Mock request query parameters
      const mockReq = {
        firstname: "fn1",
        lastname: "ln1",
        password: "password",
        profilePic: "",
        username: "user1",
      };
      

      User.findOne = jest.fn().mockResolvedValueOnce(true);

      const response = await supertest(server).post(
        '/login/register'
      ).send(mockReq);

      const mockResponse = {
        status: 400, message: "User already exists"
      }

      expect(response.status).toBe(400);
      expect(response.body).toEqual(mockResponse);

    });

    it("throw an error while registering", async () => {
      // Mock request query parameters
      const mockReq = {
        firstname: "fn1",
        lastname: "ln1",
        password: "password",
        profilePic: "",
        username: "user1",
      };
      

      User.findOne = jest.fn().mockImplementation(() => {
        throw new Error("Random!");
      });

      const response = await supertest(server).post(
        '/login/register'
      ).send(mockReq);

      const mockResponse = {
        message: "Internal Server Error"
      }

      expect(response.status).toBe(500);
      expect(response.body).toEqual(mockResponse);

    });
  });