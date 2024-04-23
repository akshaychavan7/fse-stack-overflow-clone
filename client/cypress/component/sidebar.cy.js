import Sidebar from "../../src/components/Main/sideBarNav/Sidebar";
import { BrowserRouter } from "react-router-dom";

describe("Sidebar Component", () => {
    it('Sidebar Component rendering with home selected', () => {
        const setSelected = cy.stub();
        const handleQuestions = cy.spy().as('handleQuestionsSpy');
        const handleTags = cy.spy().as('handleTagsSpy');
        const handleUsers = cy.spy().as('handleUsers');
        const handleHomePage = cy.spy().as('handleHomePageSpy');
        const setQuestionPage = cy.stub();
        const setViewUserProfile = cy.stub();
        const user = {
            username: "uname",
            firstname: "fn",
            lastname: "ln",
            profilePic: "",
            location: "Boston, MA",
            technologies: ["React", "Javascript"]
        }
        cy.window().then((win) => {
            cy.stub(win.localStorage, 'getItem').returns(JSON.stringify(user));
          });

        cy.mount(
            <BrowserRouter>
            <Sidebar
                selected="h"
                search={""}
                setSelected={setSelected}
                handleQuestions={handleQuestions}
                handleTags={handleTags}
                handleUsers={handleUsers}
                handleHomePage={handleHomePage}
                setQuestionPage={setQuestionPage}
                setViewUserProfile={setViewUserProfile}
            />
            </BrowserRouter>
        );
        cy.get('.MuiListItem-root').each(($el, index, $list) => {
            if ($el.hasClass('Mui-selected')) {
              expect(index).to.equal(0);
            }
          });
        cy.contains('.MuiAvatar-root', 'FL').should('be.visible');
        cy.get('#searchBar').should('have.attr', 'placeholder', 'Search ...');
        cy.get('.MuiToolbar-root > .MuiTypography-root').contains('Stack Overflow');
        cy.get('#sideBarQuestions').click();
        cy.get('@handleQuestionsSpy').should('have.been.called');
        cy.get('#sideBarTags').click();
        cy.get('@handleTagsSpy').should('have.been.called');
        cy.get('#sideBarUsers').click();
        cy.get('@handleUsers').should('have.been.called');
        cy.get('#sideBarHome').click();
        cy.get('@handleHomePageSpy').should('have.been.called');
    });
    
});