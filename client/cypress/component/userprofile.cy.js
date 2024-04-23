import UserProfile from "../../src/components/Main/UserProfile/UserProfile";

describe("UserProfile Component", () => {
    it('Rendering the User Profile component', () => {
        const user = {
            firstname: "fn",
            lastname: "ln",
            joiningDate: "April 18, 2024",
            userRole: "general",
            technologies: ["React", "Javascript"],
            profilePic: "",
            username: "username@gmail.com",
            location: "Boston, MA"
        }
        cy.mount(
            <UserProfile
            user={user}
            />
        );
        cy.get('.MuiTypography-h4').contains(user.firstname + " " + user.lastname);
        cy.get('.css-1pnmrwp-MuiTypography-root').contains(user.username);
        cy.get('.MuiGrid-grid-md-9 > :nth-child(3)').contains(user.location);
        cy.get('.MuiGrid-grid-md-9 > :nth-child(4)').contains(user.joiningDate);
        cy.get('.MuiGrid-grid-md-9 > :nth-child(5)').contains(user.userRole);
        cy.get(':nth-child(1) > .MuiChip-root > .MuiChip-label').contains(user.technologies[0]);
        cy.get(':nth-child(2) > .MuiChip-root > .MuiChip-label').contains(user.technologies[1]);

    });
});