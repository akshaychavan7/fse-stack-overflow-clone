import NewQuestion from "../../src/components/Main/newQuestion/index";
import { AlertContextProvider } from "../../src/context/AlertContext";

describe("NewQuestion Component", () => {
    it('Rendering the New Answer component', () => {
        const addQuestion = cy.spy().as('addQuestion');
        cy.mount(
            <NewQuestion
            addQuestion={addQuestion}
            />
        );
        cy.get('.MuiTypography-root').contains("Add New Question");
        cy.get('#title').type("Trial Title");
        cy.get('#description').type("Trial Desc");
        cy.get('#tags').type("tag1{enter}");
        cy.get('#postQuestionButton').click();
        cy.get('@addQuestion').should('have.been.called');
    });

    it('Click without filling title', () => {
        const addQuestion = cy.spy().as('handleAddAnswer');
        cy.mount(
            <AlertContextProvider>
                <NewQuestion
            addQuestion={addQuestion}
            />
            </AlertContextProvider>
            
        );
        cy.get('#postQuestionButton').click();
        cy.get(".MuiAlert-message").should("contain", "Question Title cannot be empty");
    });

    it('Click without filling title', () => {
        const addQuestion = cy.spy().as('handleAddAnswer');
        cy.mount(
            <AlertContextProvider>
                <NewQuestion
            addQuestion={addQuestion}
            />
            </AlertContextProvider>
            
        );
        cy.get('#title').type("Trial Title");
        cy.get('#postQuestionButton').click();
        cy.get(".MuiAlert-message").should("contain", "Question Description cannot be empty");
    });

    it('Click without filling tag', () => {
        const addQuestion = cy.spy().as('handleAddAnswer');
        cy.mount(
            <AlertContextProvider>
                <NewQuestion
            addQuestion={addQuestion}
            />
            </AlertContextProvider>
            
        );
        cy.get('#title').type("Trial Title");
        cy.get('#description').type("Trial Desc");
        cy.get('#postQuestionButton').click();
        cy.get(".MuiAlert-message").should("contain", "Please add at least one tag");
    });

    it('Fill more than 100 char title', () => {
        let title = "a";
        for(let i = 0; i < 101; ++i) {
            title += "a";
        }
        const addQuestion = cy.spy().as('handleAddAnswer');
        cy.mount(
            <AlertContextProvider>
                <NewQuestion
            addQuestion={addQuestion}
            />
            </AlertContextProvider>
            
        );
        cy.get('#title').type(title);
        cy.get('#description').type("Trial Desc");
        cy.get('#tags').type("tag1{enter}");
        cy.get('#postQuestionButton').click();
        cy.get(".MuiAlert-message").should("contain", "Question Title should be less than 100 characters");
    });

    it('Fill more than 500 char desc', () => {
        let desc = "a";
        for(let i = 0; i < 501; ++i) {
            desc += "a";
        }
        const addQuestion = cy.spy().as('handleAddAnswer');
        cy.mount(
            <AlertContextProvider>
                <NewQuestion
            addQuestion={addQuestion}
            />
            </AlertContextProvider>
            
        );
        cy.get('#title').type("Trial Title");
        cy.get('#description').type(desc);
        cy.get('#tags').type("tag1{enter}");
        cy.get('#postQuestionButton').click();
        cy.get(".MuiAlert-message").should("contain", "Question Description should be less than 500 characters");
    });

    it('Fill more than 5 tags', () => {
        const addQuestion = cy.spy().as('handleAddAnswer');
        cy.mount(
            <AlertContextProvider>
                <NewQuestion
            addQuestion={addQuestion}
            />
            </AlertContextProvider>
            
        );
        cy.get('#title').type("Trial Title");
        cy.get('#description').type("Trial Desc");
        cy.get('#tags').type("tag1{enter}tag2{enter}tag3{enter}tag4{enter}tag5{enter}tag6{enter}");
        cy.get('#postQuestionButton').click();
        cy.get(".MuiAlert-message").should("contain", "Question Tags should be less than 5");
    });
});