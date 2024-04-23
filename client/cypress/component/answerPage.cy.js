import AnswerPage from "../../src/components/Main/answerPage/AnwerPage";
import AnswerHeader from "../../src/components/Main/answerPage/header/AnswerHeader";
import QuestionBody from "../../src/components/Main/answerPage/QuestionBody/QuestionBody";
import { downvote, upvote } from "../../src/services/voteService";
import { getDurationPassed } from "../../src/util/utils";
import Answer from '../../src/models/answer';

describe("AnswerHeader Component", () => {
    it('Answer Header component shows question title, answer count and onclick function', () => {
        const handleNewQuestion = cy.spy().as('handleNewQuestionSpy');
        cy.mount(<AnswerHeader 
        ansCount={3} 
        title={"title trial"}
        handleNewQuestion={handleNewQuestion}
        views={10}
        askDateTime = {"2024-04-21T16:08:22.613Z"}
        />);
        cy.get('.MuiTypography-root').contains("title trial");
        cy.get('.question-meta > :nth-child(1)').contains("1 days ago");
        cy.get('.question-meta > :nth-child(2)').contains("10");
        cy.get('.question-meta > :nth-child(3)').contains("3");
        cy.get('#askQuestionButton').click();
        cy.get('@handleNewQuestionSpy').should('have.been.called');
    }); 
});

describe("QuestionBody Component", () => {
    it('Rendering the Question Body component', () => {
        const question = {
            description: "trial desc",
            asked_by: {
                profilePic: "",
                firstname: "fn1",
                lastname:"ln1",
            },
            ask_date_time: "2024-04-21T16:08:22.613Z",
            vote_count: 10,
            upvote: true,
            downvote: false,
            flag: false,
            id: "dummyQuesId",
            tags: [{name: "tag1"}, {name: "tag2"},],
            answers: [],
            comments: []
        }
        const clickTag = cy.stub();
        const setUpdateState = cy.stub();
        cy.mount(<QuestionBody 
            question={question} 
            clickTag={clickTag}
            setUpdateState={setUpdateState}
            />);
        cy.get('.response-description > div').contains(question.description);
        cy.get('#upvoteBtn-question').should('have.class', 'MuiIconButton-colorPrimary');
        cy.get('#downvoteBtn-question').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('#voteCount-question').contains(question.vote_count);
        cy.get('.answer_question_meta').contains("Apr 21 at 12:08");
        cy.get('.question_author').contains(question.asked_by.firstname + " " + question.asked_by.lastname);
        cy.contains('.MuiAvatar-root', 'FL').should('be.visible');
        cy.get('.MuiAccordionSummary-content').contains("Comments (0)");
        cy.get('.MuiAccordionSummary-content').click();
        cy.get('#comment-input-question').type("comm desc");
        cy.get('#comment-input-question').contains("comm desc");
        // commenting already tested in comments.cy.js
    });
});

describe("AnswerPage Component", () => {
    it('Rendering the Answer Page component', () => {
        cy.intercept(
            {
                method: "GET",
                url: "/question/getQuestionById/dummyQID",
            },
            {
                description: "trial desc",
            asked_by: {
                profilePic: "",
                firstname: "fn1",
                lastname:"ln1",
            },
            ask_date_time: "2024-04-20T16:08:22.613Z",
            vote_count: 10,
            upvote: true,
            downvote: false,
            flag: false,
            id: "dummyQuesId",
            tags: [{name: "tag1"}, {name: "tag2"},],
            answers: [{
                description: "desc trial",
                ans_by: {
                    profilePic: "",
                    firstname: "a1",
                    lastname: "l1",  
                },
                ans_date_time: "2024-04-21T16:08:22.613Z",
                    vote_count: 1,
                    upvote: false,
                    downvote: false,
                    flag: false,
                    _id: "dummyAnsId",
                    comments: []
                
            }],
            views: 10,
            title: "ques title",
            comments: []
            }
        ).as("getQuesById");
        const handleNewQuestion = cy.stub();
        const handleNewAnswer = cy.stub();
        const clickTag = cy.stub();
        cy.mount(<AnswerPage 
            qid={"dummyQID"} 
            handleNewQuestion={handleNewQuestion}
            handleNewAnswer={handleNewAnswer}
            clickTag={clickTag}
            />);
        cy.wait('@getQuesById');
        cy.get('#answersHeader > .MuiTypography-root').contains("ques title");
        cy.get('.question-meta > :nth-child(1)').contains("2 days ago");
        cy.get('.question-meta > :nth-child(2)').contains("10");
        cy.get('.question-meta > :nth-child(3)').contains("1");
        cy.get(':nth-child(2) > .user-response-body > .response-description > div').contains("trial desc")
        cy.get('#upvoteBtn-question').should('have.class', 'MuiIconButton-colorPrimary');
        cy.get('#downvoteBtn-question').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('#voteCount-question').contains("10");
        cy.get(':nth-child(2) > .user-response-body '+
        '> .user-response-meta > .css-jfdv4h-MuiStack-root > .MuiStack-root > .question_author').contains("fn1 ln1");
        cy.get(':nth-child(2) > .user-response-body > .user-response-meta >'+
        ' .css-jfdv4h-MuiStack-root > .answer_question_meta').contains("Apr 20 at 12:08");
        cy.get('.answers-count').contains("1");
        cy.get(':nth-child(1) > .user-response-body > .response-description > div').contains("desc trial");
        cy.get(':nth-child(1) > .user-response-body > '+
        '.user-response-meta > .css-jfdv4h-MuiStack-root > .MuiStack-root > .question_author').contains("a1 l1");
        cy.get(':nth-child(1) > .user-response-body > .user-response-meta > .css-jfdv4h-MuiStack-root'+
        ' > .answer_question_meta').contains("Apr 21 at 12:08");
        cy.get('[aria-label="View tag1 tagged questions"]').contains("tag1");
        cy.get('[aria-label="View tag2 tagged questions"]').contains("tag2");

    });
});