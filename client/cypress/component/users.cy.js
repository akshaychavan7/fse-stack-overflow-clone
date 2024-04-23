import Users from "../../src/components/Main/Users/Users";
import UserCard from "../../src/components/Main/Users/UserCard";

describe("UserCard Component", () => {
    it('User Card Component rendering', () => {
        const user = {
            username: "uname",
            name: "fn ln",
            profilePic: "",
            location: "Boston, MA",
            technologies: ["React", "Javascript"]
        };
        const setViewUserProfile = cy.spy().as('setViewUserProfile');
        cy.mount(
            <UserCard
            user = {user}
            setViewUserProfile={setViewUserProfile}
            />
        );
        cy.contains('.MuiAvatar-root', "FL").should('be.visible');
        cy.get('.MuiTypography-h6').contains(user.name);
        cy.get('.MuiTypography-body2').contains(user.location);
        cy.get(':nth-child(1) > .MuiChip-label').contains(user.technologies[0]);
        cy.get(':nth-child(2) > .MuiChip-label').contains(user.technologies[1]);
        cy.get('.MuiTypography-h6').click();
        cy.get('@setViewUserProfile').should('have.been.called');
    });
});

describe("Users Component", () => {
    it('Users Component rendering', () => {
        const user1 = {
            username: "uname1",
            name: "ln fn",
            profilePic: "",
            location: "New York, NY",
            technologies: ["Python"]
        };
        const user2 = {
            username: "uname2",
            name: "fn ln",
            profilePic: "",
            location: "Boston, MA",
            technologies: ["React", "Javascript"]
        };
        const users = [user1, user2];
        const viewUserProfile = cy.stub();
        const setViewUserProfile = cy.stub();
        cy.mount(
            <Users
            users = {users}
            viewUserProfile = {viewUserProfile}
            setViewUserProfile={setViewUserProfile}
            />
        );
        cy.contains('[data-username="uname1"] > .MuiGrid-container > :nth-child(1) > '+
        ' [style="margin-right: 16px;"] > .MuiAvatar-root', 'LF').should('be.visible');
        cy.get('[data-username="uname1"] > .MuiGrid-container > :nth-child(2) > .MuiTypography-h6').contains(user1.name);
        cy.get('[data-username="uname1"] > .MuiGrid-container > :nth-child(2) > .MuiTypography-body2').contains(user1.location);
        cy.get('[data-username="uname1"] > [style="margin-top: 15px;"] > .MuiChip-root >'+
        ' .MuiChip-label').contains(user1.technologies[0]);
        cy.contains('[data-username="uname2"] > .MuiGrid-container > :nth-child(1) >'+
        ' [style="margin-right: 16px;"] > .MuiAvatar-root', 'FL').should('be.visible');
        cy.get('[data-username="uname2"] > .MuiGrid-container > :nth-child(2) > .MuiTypography-h6').contains(user2.name);
        cy.get('[data-username="uname2"] > .MuiGrid-container > :nth-child(2) > .MuiTypography-body2').contains(user2.location);
        cy.get(':nth-child(1) > .MuiChip-label').contains(user2.technologies[0]);
        cy.get(':nth-child(2) > .MuiChip-label').contains(user2.technologies[1]);
    });

    it('Users Search Component rendering', () => {
        const user1 = {
            username: "uname1",
            name: "ln fn",
            profilePic: "",
            location: "New York, NY",
            technologies: ["Python"]
        };
        const user2 = {
            username: "uname2",
            name: "fn ln",
            profilePic: "",
            location: "Boston, MA",
            technologies: ["React", "Javascript"]
        };
        const users = [user1, user2];
        const viewUserProfile = cy.stub();
        const setViewUserProfile = cy.stub();
        cy.mount(
            <Users
            users = {users}
            viewUserProfile = {viewUserProfile}
            setViewUserProfile={setViewUserProfile}
            />
        );
        cy.get('#search').type("fn ln");
        cy.contains('.MuiAvatar-root', 'FL').should('be.visible');
        cy.get('.MuiTypography-h6').contains(user2.name);
        cy.get('.MuiTypography-body2').contains(user2.location);
        cy.get(':nth-child(1) > .MuiChip-label').contains(user2.technologies[0]);
        cy.get(':nth-child(2) > .MuiChip-label').contains(user2.technologies[1]);
    });
});