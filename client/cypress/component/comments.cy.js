import Comments from "../../src/components/Comments/Comments";
import { AlertContextProvider } from "../../src/context/AlertContext";

// Mock comments list for testing
const commentsList = [
  {
    _id: "1",
    description: "This is a test comment",
    commented_by: {
      profilePic: "test-profile-pic",
      firstname: "John",
      lastname: "Doe",
    },
    comment_date_time: "2023-04-22T10:00:00",
    vote_count: 5,
    upvote: false,
    downvote: false,
    flag: false,
  },
  {
    _id: "2",
    description: "Another test comment",
    commented_by: {
      profilePic: "test-profile-pic-2",
      firstname: "Alice",
      lastname: "Smith",
    },
    comment_date_time: "2023-04-22T11:00:00",
    vote_count: 10,
    upvote: true,
    downvote: false,
    flag: false,
  },
];

// Mock functions for props

describe("Comments Component", () => {
  beforeEach(() => {
    const setUpdateState = cy.stub().as("setUpdateState");
    cy.mount(
      <AlertContextProvider>
        <Comments
          commentsList={commentsList}
          parentId="parent-id"
          parentType="parent-type"
          setUpdateState={setUpdateState}
        />
      </AlertContextProvider>
    );
    cy.get(".MuiPaper-root").click();
    cy.intercept(
      {
        method: "POST",
        url: "/comment/addComment",
      },
      { status: 200 }
    ).as("postComment");
  });

  it("renders comments with correct data", () => {
    const expectedDates = ["Apr 22, 2023 at 10:00", "Apr 22, 2023 at 11:00"];
    commentsList.forEach((comment, idx) => {
      cy.get(".vote-count").contains(comment.vote_count);
      cy.contains(".response-description", comment.description);
      cy.contains(
        ".question_author",
        `${comment.commented_by.firstname} ${comment.commented_by.lastname}`
      );
      cy.contains(".answer_question_meta", expectedDates[idx]);
    });
  });

  it("renders correct number of comments", () => {
    cy.get(".user-response-body").should("have.length", commentsList.length);
  });

  it("allows posting a new comment", () => {
    const newCommentText = "This is a new comment";
    cy.get("#comment-input").type(newCommentText);
    cy.get("button").contains("Post Comment").click();
    cy.wait(1000); // Wait for postComment promise to resolve
    cy.get("@setUpdateState").should("have.been.calledOnce");
    cy.get("@setUpdateState").should(
      "have.been.calledWithMatch",
      (prev) => prev + 1
    ); // Ensure setUpdateState is called with a numeric argument
  });

  it("displays success message on successful comment post", () => {
    cy.get("#comment-input").type("This is a new comment");
    cy.get("button").contains("Post Comment").click();
    cy.wait(1000); // Wait for postComment promise to resolve
    cy.get(".MuiAlert-message").should(
      "have.text",
      "Comment posted successfully"
    );
  });

  it("displays error message on failed comment post", () => {
    cy.intercept(
      {
        method: "POST",
        url: "/comment/addComment",
      },
      { status: 500 }
    ).as("postComment");
    cy.get("#comment-input").type("This is a new comment");
    cy.get("button").contains("Post Comment").click();
    cy.wait(1000); // Wait for postComment promise to resolve
    cy.get(".MuiAlert-message").should("have.text", "Failed to post comment");
  });
});
