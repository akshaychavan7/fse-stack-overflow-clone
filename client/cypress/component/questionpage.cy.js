import QuestionHeader from "../../src/components/Main/questionPage/header/index";
import Question from "../../src/components/Main/questionPage/question/index";
import QuestionPage from "../../src/components/Main/questionPage/index";


describe("QuestionHeader Component", () => {
    it('Question Header Component rendering', () => {
        const setQuestionOrder = cy.stub();
        const handleNewQuestion = cy.spy().as('handleNewQuestionSpy');
        cy.mount(
            <QuestionHeader
                title_text={"Ques title"}
                qcnt={2}
                setQuestionOrder = {setQuestionOrder}
                handleNewQuestion = {handleNewQuestion}
            />
        );
        cy.get('.bold_title').contains("Ques title");
        cy.get('#question_count').contains("2 questions");
        cy.get('#newest').should('have.attr', 'aria-pressed', 'true');
        cy.get('#active').should('have.attr', 'aria-pressed', 'false');
        cy.get('#unanswered').should('have.attr', 'aria-pressed', 'false');
        cy.get('#askQuestionButton').click();
        cy.get('@handleNewQuestionSpy').should('have.been.called');
    });
});

describe("Question Component", () => {
    it('Question Component rendering', () => {
        const ques = {
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
            comments: [],
            views: 10
        }
        const clickTag = cy.stub()
        const handleAnswer = cy.stub();
        const setViewUserProfile = cy.stub();
        const setSelected = cy.stub();
        const handleUsers = cy.stub();
        cy.mount(
            <Question
                q={ques}
                clickTag= {clickTag}
                handleAnswer = {handleAnswer}
                setViewUserProfile = {setViewUserProfile}
                setSelected = {setSelected}
                handleUsers = {handleUsers}
            />
        );
        cy.get('.postStats > :nth-child(1)').contains(ques.vote_count);
        cy.get('.postStats > :nth-child(2)').contains(ques.answers.length);
        cy.get('.postStats > :nth-child(3)').contains(ques.views);
        cy.get('[aria-label="View tag1 tagged questions"]').contains(ques.tags[0].name);
        cy.get('[aria-label="View tag2 tagged questions"]').contains(ques.tags[1].name);
        cy.contains('.MuiAvatar-root', 'FL').should('be.visible');
        cy.get('.question_author').contains(ques.asked_by.firstname + " " + ques.asked_by.lastname);
        cy.get('.question_meta').contains("asked Apr 21 at 12:08");
    });
});

describe("Question Page Component", () => {
    it('Question Page Component rendering', () => {
        const setQuestionOrder = cy.stub();
        const clickTag = cy.stub();
        const handleAnswer = cy.stub();
        const handleNewQuestion = cy.spy().as('handleNewQuestionSpy');
        const setViewUserProfile = cy.stub();
        const setSelected = cy.stub();
        const handleUsers = cy.stub();
        const ques = {
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
            comments: [],
            views: 10
        }
        cy.intercept(
            {
                method: "GET",
                url: "/question/getQuestion?order=newest&search=",

            },
            [ques]
        ).as('getQuestion');
        cy.mount(
            <QuestionPage
                title_text = "Trial of component"
                order = {"newest"}
                search = {""}
                setQuestionOrder = {setQuestionOrder}
                clickTag= {clickTag}
                handleAnswer = {handleAnswer}
                handleNewQuestion = {handleNewQuestion}
                setViewUserProfile = {setViewUserProfile}
                setSelected = {setSelected}
                handleUsers = {handleUsers}
            />
        );
        cy.wait('@getQuestion');
        cy.get('.bold_title').contains("Trial of component");
        cy.get('#question_count').contains("1 questions");
        cy.get('#newest').should('have.attr', 'aria-pressed', 'true');
        cy.get('#active').should('have.attr', 'aria-pressed', 'false');
        cy.get('#unanswered').should('have.attr', 'aria-pressed', 'false');
        cy.get('.postStats > :nth-child(1)').contains(ques.vote_count);
        cy.get('.postStats > :nth-child(2)').contains(ques.answers.length);
        cy.get('.postStats > :nth-child(3)').contains(ques.views);
        cy.get('[aria-label="View tag1 tagged questions"]').contains(ques.tags[0].name);
        cy.get('[aria-label="View tag2 tagged questions"]').contains(ques.tags[1].name);
        cy.contains('.MuiAvatar-root', 'FL').should('be.visible');
        cy.get('.question_author').contains(ques.asked_by.firstname + " " + ques.asked_by.lastname);
        cy.get('.question_meta').contains("asked Apr 21 at 12:08");
        cy.get('#askQuestionButton').click();
        cy.get('@handleNewQuestionSpy').should('have.been.called');
    });
});