import UserResponse from "../../src/components/Main/UserResponse/UserResponse";

describe("User response component", () => {
    it("User response component for question post type", () => {
        cy.mount(
            
            <UserResponse
                description={"trial description"}
                author= "user1"
                profilePic = ""
                date = {"2024-03-22T16:08:22.613Z"}
                voteCount = {1}
                isUpvoted={true}
                isDownvoted={false}
                isFlagged={false}
                postType={"question"}
                id={"dummyQuestionId"}
            />
    );
    cy.contains('.response-description > div', "trial description");
    cy.contains('.MuiTypography-root', "1");
    cy.contains('.question_author', "user1");
    cy.contains('.answer_question_meta', "Mar 22 at 12:08");
    cy.get('[aria-label="Upvote"]').should('have.class', 'MuiIconButton-colorPrimary');
    });
});