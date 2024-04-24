const supertest = require("supertest");
const { default: mongoose } = require("mongoose");

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

let server;
describe('Server js endpoints', () => {
    beforeEach(() => {
        server = require("../server");
      });
    
      afterEach(async () => {
        server.close();
        await mongoose.disconnect();
      });
    it('isauthenticated endpoint', async () => {
        const mockResp = { message: "User is authenticated" };
        const response = await supertest(server).get(
            "/isUserAuthenticated"
          );
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(mockResp);
    });

    it('isUserModeratorAuthenticated endpoint', async () => {
        const mockResp = { message: "User is authenticated" };
        const response = await supertest(server).get(
            "/isUserModeratorAuthenticated"
          );
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(mockResp);
    });

    it('logout endpoint', async () => {
        const mockResp = { status: 200, message: "Successfully logged out" };
        const response = await supertest(server).get(
            "/logout"
          );

        const cookie = response.headers['set-cookie'];
        const cookieKeyValuePairs = cookie.map(cookie => cookie.split(';')[0].trim().split('='));
        const cookieObject = Object.fromEntries(cookieKeyValuePairs);
        // Asserting the response
        expect(cookie).toBeDefined();
        expect(cookieObject.access_token).toEqual('');

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(mockResp);
    });
});