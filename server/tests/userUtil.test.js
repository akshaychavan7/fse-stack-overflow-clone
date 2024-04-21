const { updateReputation, 
    reportPost, 
    getQuestionsByUser, 
    getAnswersByUser, 
    getCommentsByUser } = require('../utils/user');
const User = require('../models/users');
const Question = require('../models/questions');
const Answer = require('../models/answers');
const Comment = require('../models/comments');
const mockingoose = require("mockingoose");

const {_questions, _answers, _comments, _users, _tags} = require('./constantdb')


User.prototype.save = jest.fn().mockImplementation(function() {
    return Promise.resolve(this);
  });

describe('test on updateReputation of user utils', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

  test('should increase reputation by 10 when upvoteBool is true', async () => {
    const id = 'some_id';
    const mockUser = { _id: id, reputation: 50 };
    mockingoose(User).toReturn(mockUser, "findOne");

    let userrep = await updateReputation(true, false, id, 'upvote');
    expect(userrep.reputation).toBe(60); // Reputation increased by 10
  });

  test('should increase reputation by 10 when downvoteBool is false and type is downvote', async () => {
    const id = 'some_id';
    const mockUser = { _id: id, reputation: 50 };
    mockingoose(User).toReturn(mockUser, "findOne");

    let userrep = await updateReputation(false, false, id, 'downvote');
    expect(userrep.reputation).toBe(60); // Reputation increased by 10
  });

  test('should decrease reputation by 10 when upvoteBool is false and type upvote', async () => {
    const id = 'some_id';
    const mockUser = { _id: id, reputation: 50 };
    mockingoose(User).toReturn(mockUser, "findOne");

    let userrep = await updateReputation(false, false, id, 'upvote');
    expect(userrep.reputation).toBe(40); // Reputation increased by 10
  });

  test('should decrease reputation by 10 when downvoteBool is true and type downvote', async () => {
    const id = 'some_id';
    const mockUser = { _id: id, reputation: 50 };
    mockingoose(User).toReturn(mockUser, "findOne");

    let userrep = await updateReputation(false, true, id, 'downvote');
    expect(userrep.reputation).toBe(40); // Reputation increased by 10
  });

  test('should decrease reputation to 0 when downvoteBool is true and type downvote and reputation was 10', async () => {
    const id = 'some_id';
    const mockUser = { _id: id, reputation: 10 };
    mockingoose(User).toReturn(mockUser, "findOne");

    let userrep = await updateReputation(false, true, id, 'downvote');
    expect(userrep.reputation).toBe(0); // Reputation increased by 10
  });

  test('should throw error', async () => {
    const id = 'some_id';
    mockingoose(User).toReturn(new Error('Error'), "findOne");

    let userrep = await updateReputation(false, true, id, 'downvote');
    expect(userrep).toBeInstanceOf(Error); // Reputation increased by 10
  });


});

describe('test on reportPost of user utils', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    test('should toggle the flag of a question to true', async () => {

        const mockQuestion = _questions[1];
        mockingoose(Question).toReturn(mockQuestion, 'findOne');
    
        const result = await reportPost(mockQuestion._id, "question");
    
        expect(result).toBe(true);
      });

      test('should toggle the flag of a question to false', async () => {
        const mockQuestion = _questions[0];
        mockingoose(Question).toReturn(mockQuestion, 'findOne');
    
        const result = await reportPost(mockQuestion._id, "question");
    
        expect(result).toBe(false);
      });

      test('should toggle the flag of answer to true', async () => {
        const mockAnswer = _answers[1];
        mockingoose(Answer).toReturn(mockAnswer, 'findOne');
    
        const result = await reportPost(mockAnswer._id, "answer");
    
        expect(result).toBe(true);
      });

      test('should toggle the flag of answer to false', async () => {
        const mockAnswer = _answers[0];
        mockingoose(Answer).toReturn(mockAnswer, 'findOne');
    
        const result = await reportPost(mockAnswer._id, "answer");
    
        expect(result).toBe(false);
      });

      test('should toggle the flag of comment to true', async () => {
        const mockComment = _comments[0];
        mockingoose(Comment).toReturn(mockComment, 'findOne');
    
        const result = await reportPost(mockComment._id, "comment");
    
        expect(result).toBe(true);
      });

      test('should toggle the flag of comment to false', async () => {
        const mockComment = _comments[1];
        mockingoose(Comment).toReturn(mockComment, 'findOne');
    
        const result = await reportPost(mockComment._id, "comment");
    
        expect(result).toBe(false);
      });

      test('should throw error for invalid type', async () => {
    
        const result = await reportPost("invalidId", "invalid type");
    
        expect(result).toBeInstanceOf(Error);
      });

      test('throw error for reportPost', async () => {
        const mockComment = _comments[1];
        mockingoose(Comment).toReturn(new Error('Error'), 'findOne');
    
        const result = await reportPost(mockComment._id, "comment");
    
        expect(result).toBeInstanceOf(Error);
      });
});

describe('test on getQuestionsByUser of user utils', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    test('should return questions asked by a user', async () => {
        const uid = _users[2]._id;
        const mockQuestions = [
            _questions[2]
        ];
        
        jest.mock('../models/questions');
        Question.find = jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValueOnce(mockQuestions)
        }));
        // mockingoose(Question).toReturn(mockQuestions, 'find');
    
        const result = await getQuestionsByUser(uid);
    
        expect(result).toEqual(mockQuestions); // Verify if the function returns the expected questions
      });

      test('should throw error', async () => {
        const uid = _users[2]._id;
        const mockQuestions = [
            _questions[2]
        ];
        
        jest.mock('../models/questions');
        Question.find = jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockImplementation(() => {
                throw new Error("Random!");
              })
        }));
    
        const result = await getQuestionsByUser(uid);
    
        expect(result).toBeInstanceOf(Error);
      });
});


describe('test on getAnswersByUser of user utils', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    test('should return questions asked by a user', async () => {
        const uid = _users[2]._id;
        const mockAnswers = [
            _answers[0]
        ];
        
        jest.mock('../models/answers');
        Answer.find = jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValueOnce(mockAnswers)
        }));
        // mockingoose(Question).toReturn(mockQuestions, 'find');
    
        const result = await getAnswersByUser(uid);
    
        expect(result).toEqual(mockAnswers); // Verify if the function returns the expected questions
      });

      test('should throw error', async () => {
        const uid = _users[2]._id;
        const mockAnswers = [
            _answers[0]
        ];
        
        jest.mock('../models/answers');
        Answer.find = jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockImplementation(() => {
                throw new Error("Random!");
              })
        }));
        // mockingoose(Question).toReturn(mockQuestions, 'find');
    
        const result = await getAnswersByUser(uid);
    
        expect(result).toBeInstanceOf(Error);
      });
});


describe('test on getCommentsByUser of user utils', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    test('should return questions asked by a user', async () => {
        const uid = _users[0]._id;
        const mockComments = [
            _comments[0]
        ];
        
        jest.mock('../models/comments');
        Comment.find = jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValueOnce(mockComments)
        }));
        // mockingoose(Question).toReturn(mockQuestions, 'find');
    
        const result = await getCommentsByUser(uid);
    
        expect(result).toEqual(mockComments); // Verify if the function returns the expected questions
      });

      test('should throw error', async () => {
        const uid = _users[0]._id;
        const mockComments = [
            _comments[0]
        ];
        
        jest.mock('../models/comments');
        Comment.find = jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockImplementation(() => {
                throw new Error("Random!");
              })
        }));
    
        const result = await getCommentsByUser(uid);
    
        expect(result).toBeInstanceOf(Error);
      });
});