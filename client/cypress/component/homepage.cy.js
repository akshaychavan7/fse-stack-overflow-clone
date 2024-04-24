import HomePage from "../../src/components/Main/HomePage/HomePage";

describe("HomePage Component", () => {
    const q1 = {
        description: "trial desc",
        asked_by: {
            profilePic: "",
            firstname: "fn1",
            lastname: "ln1",
        },
        ask_date_time: "2024-04-20T16:08:22.613Z",
        vote_count: 10,
        upvote: true,
        downvote: false,
        flag: false,
        id: "dummyQuesId",
        tags: [{ name: "tag1" }, { name: "tag2" },],
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
        views: 12,
        title: "ques title",
        comments: []
    }
    const q2 = {
        description: "trial desc2",
        asked_by: {
            profilePic: "",
            firstname: "ln2",
            lastname: "fn2",
        },
        ask_date_time: "2024-04-21T16:08:22.613Z",
        vote_count: 12,
        upvote: false,
        downvote: true,
        flag: true,
        id: "dummyQuesId2",
        tags: [{ name: "tag3" }, { name: "tag4" },],
        answers: [{
            description: "desc trial2",
            ans_by: {
                profilePic: "",
                firstname: "b1",
                lastname: "c1",
            },
            ans_date_time: "2024-04-21T16:08:22.613Z",
            vote_count: 1,
            upvote: true,
            downvote: false,
            flag: false,
            _id: "dummyAnsId2",
            comments: []

        }],
        views: 10,
        title: "ques title",
        comments: []
    }
    const ques = [q1, q2];
    it('Home Page Component rendering', () => {
        const setQuestionOrder = cy.stub();
        const clickTag = cy.stub();
        const handleAnswer = cy.stub();
        const handleNewQuestion =cy.spy().as('handleNewQuestionSpy');
        const setViewUserProfile = cy.stub();
        const setSelected = cy.stub();
        const handleUsers = cy.stub();
        cy.mount(
            <HomePage
                order={"newest"}
                search={""}
                qlist={ques}
                setQuestionOrder={setQuestionOrder}
                clickTag={clickTag}
                handleAnswer={handleAnswer}
                handleNewQuestion={handleNewQuestion}
                setViewUserProfile={setViewUserProfile}
                setSelected={setSelected}
                handleUsers={handleUsers}
            />
        );
        cy.get('.bold_title').contains("Trending Questions");
        cy.get('#question_count').contains(ques.length + " questions");
        cy.get('#newest').should('have.attr', 'aria-pressed', 'true');
        cy.get('#active').should('have.attr', 'aria-pressed', 'false');
        cy.get('#unanswered').should('have.attr', 'aria-pressed', 'false');
        cy.get(':nth-child(1) > .postStats > :nth-child(1)').contains(q1.vote_count);
        cy.get(':nth-child(1) > .postStats > :nth-child(2)').contains(q1.answers.length);
        cy.get(':nth-child(1) > .postStats > :nth-child(3)').contains(q1.views);
        cy.get(':nth-child(1) > .question_mid > .postTitle').contains(q1.title);
        cy.contains(q1.tags[0].name);
        cy.contains(q1.tags[1].name);
        cy.contains(':nth-child(1) > .lastActivity > .css-jfdv4h-MuiStack-root >'+
        ' #profilePic > .MuiStack-root > .MuiAvatar-root', 'FL').should('be.visible');
        cy.get(':nth-child(1) > .lastActivity > .css-jfdv4h-MuiStack-root >'+
        ' #profilePic > .MuiStack-root > .question_author').contains(q1.asked_by.firstname + " " + q1.asked_by.lastname);
        cy.get(':nth-child(1) > .lastActivity > .css-jfdv4h-MuiStack-root > .question_meta').contains("Apr 20 at 12:08");

        cy.get(':nth-child(2) > .postStats > :nth-child(1)').contains(q2.vote_count);
        cy.get(':nth-child(2) > .postStats > :nth-child(2)').contains(q2.answers.length);
        cy.get(':nth-child(2) > .postStats > :nth-child(3)').contains(q2.views);
        cy.get(':nth-child(2) > .question_mid > .postTitle').contains(q2.title);
        cy.contains(q2.tags[0].name);
        cy.contains(q2.tags[1].name);
        cy.contains(':nth-child(2) > .lastActivity > .css-jfdv4h-MuiStack-root >'+
        ' #profilePic > .MuiStack-root > .MuiAvatar-root', 'LF').should('be.visible');
        cy.get(':nth-child(2) > .lastActivity > .css-jfdv4h-MuiStack-root >'+
        ' #profilePic > .MuiStack-root > .question_author').contains(q2.asked_by.firstname + " " + q2.asked_by.lastname);
        cy.get(':nth-child(2) > .lastActivity > .css-jfdv4h-MuiStack-root > .question_meta').contains("Apr 21 at 12:08");
        cy.get('#askQuestionButton').click();
        cy.get('@handleNewQuestionSpy').should('have.been.called');
    });
});