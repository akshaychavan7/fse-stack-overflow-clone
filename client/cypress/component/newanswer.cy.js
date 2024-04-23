import NewAnswer from "../../src/components/Main/newAnswer/index";
import { AlertContextProvider } from "../../src/context/AlertContext";

describe("NewAnswer Component", () => {
    it('Rendering the New Answer component', () => {
        const handleAddAnswer = cy.spy().as('handleAddAnswer');
        cy.mount(
            <NewAnswer
            handleAddAnswer={handleAddAnswer}
            />
        );
        cy.get('#description').type("Trial description");
        cy.get('#postAnswerBtn').click();
        cy.get('@handleAddAnswer').should('have.been.called');
    });

    it('Click without filling', () => {
        const handleAddAnswer = cy.spy().as('handleAddAnswer');
        cy.mount(
            <AlertContextProvider>
                <NewAnswer
            handleAddAnswer={handleAddAnswer}
            />
            </AlertContextProvider>
            
        );
        cy.get('#postAnswerBtn').click();
        cy.get(".MuiAlert-message").should("contain", "Answer Description cannot be empty");
    });
});