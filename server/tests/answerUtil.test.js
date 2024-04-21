const {ansDelete} = require('../utils/answer');

const Question = require('../models/questions');
const Answer = require('../models/answers');
const Comment = require('../models/comments');


describe('test on ansDelete of answer utils', () => {
    test('Answer delete is successful', async () => {
        jest.mock('../models/questions');
        jest.mock('../models/answers');
        jest.mock('../models/comments');
        let question = {_id: "dummyQuesId", answers: ["dummyAnsId"]};
        let answer = {_id: "dummyAnsId", comments: ["dummyCommentId"]};
        let comment = {_id: "dummyCommentId"};

        Question.updateOne = jest.fn().mockResolvedValue(question);
        Answer.findOne = jest.fn().mockResolvedValue(answer);
        Comment.findByIdAndDelete = jest.fn().mockResolvedValue(comment);
        Answer.findByIdAndDelete = jest.fn().mockResolvedValue(answer);

        let result = await ansDelete(question._id, answer._id);

        expect(result).toEqual({
            status: 200,
            message: "Answer deleted successfully"
          });
    });

    test('Answer delete throws error', async () => {
        jest.mock('../models/questions');
        jest.mock('../models/answers');
        jest.mock('../models/comments');
        let question = {_id: "dummyQuesId", answers: ["dummyAnsId"]};
        let answer = {_id: "dummyAnsId", comments: ["dummyCommentId"]};

        Question.updateOne = jest.fn().mockImplementation(() => {
            throw new Error("Random!");
          });

        let result = await ansDelete(question._id, answer._id);

        expect(result).toBeInstanceOf(Error);
    });
});