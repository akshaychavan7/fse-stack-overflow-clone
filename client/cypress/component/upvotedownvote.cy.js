import UpvoteDownvote from "../../src/components/Main/UpvoteDownvote/UpvoteDownvote";
import { AlertContextProvider } from "../../src/context/AlertContext";

describe("Upvote of the UpvoteDownvote Component", () => {
    it("clicks on upvote and it gets upvoted", () => {
        cy.intercept(
            {
                method: "POST",
                url: "/vote/upvote",
            },
            {
                status: 200,
                upvote: true,
                downvote: false,
                vote_count: 1,
                message: "Upvoted successfully."
            }
        ).as("upvote");
        cy.mount(
            
                <UpvoteDownvote
                    voteCount={0}
                    isUpvoted={false}
                    isDownvoted={false}
                    isFlagged={false}
                    postType={"question"}
                    id={"dummyQuestionId"}
                />
        );

        cy.get('[aria-label="Upvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Upvote"]').click();
        cy.get('.vote-count').should('have.text', '1');
        cy.get('[aria-label="Upvote"]').should('have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
    });

    it("clicks on upvote and undo upvote", () => {
        cy.intercept(
            {
                method: "POST",
                url: "/vote/upvote",
            },
            {
                status: 200,
                upvote: false,
                downvote: false,
                vote_count: 0,
                message: "Removed previous upvote."
            }
        ).as("upvote");
        cy.mount(
            <UpvoteDownvote
                voteCount={1}
                isUpvoted={true}
                isDownvoted={false}
                isFlagged={false}
                postType={"question"}
                id={"dummyQuestionId"}
            />
        );

        cy.get('[aria-label="Upvote"]').should('have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Upvote"]').click();
        cy.get('.vote-count').should('have.text', '0');
        cy.get('[aria-label="Upvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
    });
});

describe("Downvote of the UpvoteDownvote Component", () => {
    it("clicks on downvote and it gets downvoted", () => {
        cy.intercept(
            {
                method: "POST",
                url: "/vote/downvote",
            },
            {
                status: 200,
                upvote: false,
                downvote: true,
                vote_count: -1,
                message: "Downvoted successfully."
            }
        ).as("upvote");
        cy.mount(
            <UpvoteDownvote
                voteCount={0}
                isUpvoted={false}
                isDownvoted={false}
                isFlagged={false}
                postType={"question"}
                id={"dummyQuestionId"}
            />
        );

        cy.get('[aria-label="Upvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').click();
        cy.get('.vote-count').should('have.text', '-1');
        cy.get('[aria-label="Upvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').should('have.class', 'MuiIconButton-colorPrimary');
    });

    it("clicks on downvote and undo downvote", () => {
        cy.intercept(
            {
                method: "POST",
                url: "/vote/downvote",
            },
            {
                status: 200,
                upvote: false,
                downvote: false,
                vote_count: 0,
                message: "Removed previous downvote."
            }
        ).as("upvote");
        cy.mount(
            <UpvoteDownvote
                voteCount={-1}
                isUpvoted={false}
                isDownvoted={true}
                isFlagged={false}
                postType={"question"}
                id={"dummyQuestionId"}
            />
        );

        cy.get('[aria-label="Upvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').should('have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').click();
        cy.get('.vote-count').should('have.text', '0');
        cy.get('[aria-label="Upvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
        cy.get('[aria-label="Downvote"]').should('not.have.class', 'MuiIconButton-colorPrimary');
    });
});


// Add report test case

describe("Report flag of the UpvoteDownvote Component", () => {
    it("clicks on flag and it gets reported", () => {
        cy.intercept(
            {
                method: "POST",
                url: "/question/reportQuestion",
            },
            {
                status: 200,
                reportBool: true,
                message: "Question reported successfully."
            }
        ).as("reportQuestion");
        cy.mount(
            <AlertContextProvider>
                <UpvoteDownvote
                voteCount={0}
                isUpvoted={false}
                isDownvoted={false}
                isFlagged={false}
                postType={"question"}
                id={"dummyQuestionId"}
            />
            </AlertContextProvider>
        );

        cy.get('[aria-label="Flag this post/comment"]').click();
        cy.wait("@reportQuestion");
        cy.get(".MuiAlert-message").should("contain", "Post has been flagged for review");
    });

    it("clicks on flag but it was already reported", () => {
        cy.mount(
            <AlertContextProvider>
                <UpvoteDownvote
                voteCount={0}
                isUpvoted={false}
                isDownvoted={false}
                isFlagged={true}
                postType={"question"}
                id={"dummyQuestionId"}
            />
            </AlertContextProvider>
        );

        cy.get('[aria-label="This post/comment has been flagged for a review"]').click();
        cy.get(".MuiAlert-message").should("contain", "This post/comment has already been flagged");
    });
});