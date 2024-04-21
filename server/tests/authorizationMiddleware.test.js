const jwt = require('jsonwebtoken');
const {authorization, adminAuthorization} = require('../middleware/authorization');

jest.mock('jsonwebtoken');

describe('authorization middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {} };
    res = { sendStatus: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('valid token scenario', () => {
    const token = 'valid_token';
    req.cookies.access_token = token;
    const decodedToken = { userId: 'dummyUserId', userRole: 'user_role' };
    jwt.verify.mockReturnValue(decodedToken);

    authorization(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
    expect(req.userId).toBe(decodedToken.userId); 
    expect(req.userRole).toBe(decodedToken.userRole); 
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  test('missing token scenario', () => {
    authorization(req, res, next);

    expect(jwt.verify).not.toHaveBeenCalled(); 
    expect(req.userId).toBeUndefined();
    expect(req.userRole).toBeUndefined(); 
    expect(next).not.toHaveBeenCalled(); 
    expect(res.sendStatus).toHaveBeenCalledWith(403); 
  });

  test('invalid token scenario', () => {
    const token = 'invalid_token';
    req.cookies.access_token = token;
    jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

    authorization(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
    expect(req.userId).toBeUndefined();
    expect(req.userRole).toBeUndefined();
    expect(next).not.toHaveBeenCalled(); 
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });
});

describe('admin authorization middleware', () => {
    let req, res, next;
  
    beforeEach(() => {
      req = { cookies: {} };
      res = { sendStatus: jest.fn() };
      next = jest.fn();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('valid token scenario', () => {
        const token = 'valid_token';
        req.cookies.access_token = token;
        const decodedToken = { userId: 'dummyUserId', userRole: 'moderator' };
        jwt.verify.mockReturnValue(decodedToken);
    
        adminAuthorization(req, res, next);
    
        expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String)); 
        expect(req.userId).toBe(decodedToken.userId); 
        expect(req.userRole).toBe(decodedToken.userRole);
        expect(next).toHaveBeenCalled();
        expect(res.sendStatus).not.toHaveBeenCalled();
    });

    test('valid token scenario but not a moderator', () => {
        const token = 'valid_token';
        req.cookies.access_token = token;
        const decodedToken = { userId: 'dummyUserId', userRole: 'general' };
        jwt.verify.mockReturnValue(decodedToken);
    
        adminAuthorization(req, res, next);
    
        expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
        expect(req.userId).toBeUndefined();
        expect(req.userRole).toBeUndefined(); 
        expect(next).not.toHaveBeenCalled(); 
        expect(res.sendStatus).toHaveBeenCalledWith(403);
    });
  
    test('missing token scenario', () => {
      authorization(req, res, next);
  
      expect(jwt.verify).not.toHaveBeenCalled(); 
      expect(req.userId).toBeUndefined();
      expect(req.userRole).toBeUndefined(); 
      expect(next).not.toHaveBeenCalled(); 
      expect(res.sendStatus).toHaveBeenCalledWith(403); 
    });
  
    test('invalid token scenario', () => {
      const token = 'invalid_token';
      req.cookies.access_token = token;
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
  
      authorization(req, res, next);
  
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(req.userId).toBeUndefined();
      expect(req.userRole).toBeUndefined();
      expect(next).not.toHaveBeenCalled(); 
      expect(res.sendStatus).toHaveBeenCalledWith(403);
    });
  });
