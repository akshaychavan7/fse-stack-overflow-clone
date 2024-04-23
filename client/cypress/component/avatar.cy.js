import ProfileAvatar from "../../src/components/Main/Avatar/AltAvatar";

describe("ProfileAvatar Component", () => {
    it("renders a profile avatar with initials", () => {
        cy.mount(
            <ProfileAvatar
            name = {"John Doe"}
            image = {""}
            width = {30}
            height= {30}
            />
          );
          cy.contains('.MuiAvatar-root', 'JD').should('be.visible');
    });
});