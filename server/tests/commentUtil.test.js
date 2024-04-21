const {commentDelete} = require('../utils/comment');

const Question = require('../models/questions');
const Answer = require('../models/answers');
const Comment = require('../models/comments');


describe('test on commentDelete of answer utils', () => {
    test('Comment delete is successful from question', async () => {
        jest.mock('../models/questions');
        jest.mock('../models/comments');
        let question = {_id: "dummyQuesId", answers: ["dummyAnsId"], comments: ["dummyCommentId"] };
        let newquestion = {_id: "dummyQuesId", answers: ["dummyAnsId"], comments: [] };
        let comment = {_id: "dummyCommentId"};

        Question.exists = jest.fn().mockResolvedValue(true);
        Question.findByIdAndUpdate = jest.fn().mockResolvedValue(newquestion);
        Comment.findByIdAndDelete = jest.fn().mockResolvedValue(comment);

        let result = await commentDelete(question._id, "question", comment._id);

        expect(result).toEqual({
            status: 200,
            message: "Comment deleted successfully"
          });
    });

    test('Comment delete is successful from answer', async () => {
        jest.mock('../models/answers');
        jest.mock('../models/comments');
        let answer = {_id: "dummyAnsId", comments: ["dummyCommentId"]};
        let newanswer = {_id: "dummyAnsId", comments: []};
        let comment = {_id: "dummyCommentId"};

        Answer.exists = jest.fn().mockResolvedValue(true);
        Answer.findByIdAndUpdate = jest.fn().mockResolvedValue(newanswer);
        Comment.findByIdAndDelete = jest.fn().mockResolvedValue(comment);

        let result = await commentDelete(answer._id, "answer", comment._id);

        expect(result).toEqual({
            status: 200,
            message: "Comment deleted successfully"
          });
    });

    test('Comment delete invalid parent type', async () => {
        jest.mock('../models/comments');
        let comment = {_id: "dummyCommentId"};
        let result = await commentDelete("trialId", "trial", comment._id);

        expect(result).toEqual({
            status: 400,
            message: "Invalid parent"
          });
    });

    test('Comment delete throws error', async () => {
        jest.mock('../models/questions');
        jest.mock('../models/comments');
        let question = {_id: "dummyQuesId", answers: ["dummyAnsId"], comments: ["dummyCommentId"] };
        let newquestion = {_id: "dummyQuesId", answers: ["dummyAnsId"], comments: [] };
        let comment = {_id: "dummyCommentId"};

        Question.findByIdAndUpdate = jest.fn().mockImplementation(() => {
            throw new Error("Random!");
          });

        let result = await commentDelete(question._id, "question", comment._id);

        expect(result).toBeInstanceOf(Error);
    });
});