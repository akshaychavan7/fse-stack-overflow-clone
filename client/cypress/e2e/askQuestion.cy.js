describe("Ask Question", () => {
  beforeEach(() => {
    // Seed the database before each test
    cy.exec("node ../server/init.js mongodb://127.0.0.1:27017/fake_so");

    cy.visit("http://localhost:3000");
    cy.get("#email").type("general");
    cy.get("#password").type("test");
    cy.get("#signInButton").click();
  });

  afterEach(() => {
    // Clear the database after each test
    cy.exec("node ../server/destroy.js mongodb://127.0.0.1:27017/fake_so");
  });

  it("Ask a question should be succesful and lead back to home page", () => {
    // wait for the page to appear
    cy.get("#askQuestionButton").click();
    // focus on input field with id title
    cy.get("#title").focus();
    cy.get("#title").type("How to compare two double values in Java?");
    cy.get("#description").type(
      "A simple comparison of two double values in Java creates some problems. Let's consider the following simple code snippet in Java."
    );
    cy.get("#tags").type("tag1").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("All Questions");
    cy.contains("How to compare two double values in Java?");
  });

  it("Check if questions are displayed in descending order of dates.", () => {
    const qTitles = [
      "Object storage for a web application",
      "Quick question about storage on android",
      "android studio save string shared preference, start activity and load the saved string",
      "Programmatically navigate using React router",
    ];

    cy.get(".postTitle").each(($el, index, $list) => {
      cy.wrap($el).should("contain", qTitles[index]);
    });
  });

  it("successfully shows all questions in model in active order", () => {
    const qTitles = [
      "Object storage for a web application",
      "Quick question about storage on android",
      "android studio save string shared preference, start activity and load the saved string",
      "Programmatically navigate using React router",
    ];
    cy.get("#active").click();
    cy.get(".postTitle").each(($el, index, $list) => {
      // cy.wrap($el).should("contain", qTitles[index]);
      // check if el is there in UI
      cy.contains(qTitles[index]);
    });
  });

  it("Adds multiple questions one by one and displays them in All Questions", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type("How to compare two double values in Java?");
    cy.get("#description").type(
      "A simple comparison of two double values in Java creates some problems. Let's consider the following simple code snippet in Java."
    );
    cy.get("#tags").type("tag1").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("All Questions");
    cy.contains("How to compare two double values in Java?");

    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type(
      "New Focus Styles & Updated Styling for Button Groups"
    );
    cy.get("#description").type(
      "We’ve released a design update to focus styles across the many components within our design system and as well as a new design for our button group component."
    );
    cy.get("#tags").type("tag1").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("All Questions");

    const qTitles = [
      "How to compare two double values in Java?",
      "New Focus Styles & Updated Styling for Button Groups",
      "Object storage for a web application",
      "Quick question about storage on android",
      "android studio save string shared preference, start activity and load the saved string",
      "Programmatically navigate using React router",
    ];
  });

  it("Ask a Question creates and displays expected meta data", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type("How to compare two double values in Java?");
    cy.get("#description").type(
      "A simple comparison of two double values in Java creates some problems. Let's consider the following simple code snippet in Java."
    );
    cy.get("#tags").type("tag1").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("All Questions");
    cy.contains("How to compare two double values in Java?");

    const answers = [
      "0 answers",
      "1 answers",
      "2 answers",
      "3 answers",
      "2 answers",
    ];
    const views = ["0 views", "103 views", "200 views", "55 views", "23 views"];

    const votes = ["0 votes", "0 votes", "-1 votes", "2 votes", "1 votes"];
    cy.get(".postStats").each(($el, index, $list) => {
      cy.wrap($el).should("contain", answers[index]);
      cy.wrap($el).should("contain", views[index]);
      cy.wrap($el).should("contain", votes[index]);
    });
    cy.contains("Unanswered").click();
    cy.get(".postTitle").should("have.length", 1);
    cy.contains("1 question");
  });

  it("Ask a Question with empty title shows error", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#description").type(
      "A simple comparison of two double values in Java creates some problems."
    );
    cy.get("#tags").type("tag1").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("Question Title cannot be empty");
  });

  it("Ask a question with empty description shows error", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type("How to compare two double values in Java?");
    cy.get("#tags").type("tag1").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("Question Description cannot be empty");
  });

  it("Ask a question with empty tags shows error", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type("How to compare two double values in Java?");
    cy.get("#description").type(
      "A simple comparison of two double values in Java creates some problems."
    );

    cy.get("#postQuestionButton").click();

    cy.contains("Please add at least one tag");
  });
  it("Ask a question with more than 100 characters in title shows error", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type(
      "A simple comparison of two double values in Java creates some problems. Let's consider the following simple code snippet in Java."
    );
    cy.get("#description").type(
      "A simple comparison of two double values in Java creates some problems."
    );
    cy.get("#tags").type("tag1").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("Question Title should be less than 100 characters");
  });

  it("Ask a question with more than 500 characters in description shows error", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type("How to compare two double values in Java?");
    cy.get("#description").type(
      "In a Cypress test report, the percentages you provided typically refer to code coverage metrics. Here's what each of these metrics represents:Statements: This indicates the percentage of executable code statements that were executed during the test run. For example, if your codebase has 100 statements and during the test run, only 6 of them were executed, the statement coverage would be 6%.Branches: This represents the percentage of decision points or branches in your code that were executed during the test run. "
    );
    cy.get("#tags").type("tag1").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("Question Description should be less than 500 characters");
  });

  it("Ask a question with more than 5 tags shows error", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type("How to compare two double values in Java?");
    cy.get("#description").type(
      "A simple comparison of two double values in Java creates some problems."
    );
    cy.get("#tags").type("tag1").type("{enter}");
    cy.get("#tags").type("tag2").type("{enter}");
    cy.get("#tags").type("tag3").type("{enter}");
    cy.get("#tags").type("tag4").type("{enter}");
    cy.get("#tags").type("tag5").type("{enter}");
    cy.get("#tags").type("tag6").type("{enter}");

    cy.get("#postQuestionButton").click();

    cy.contains("Question Tags should be less than 5");
  });

  it("Aska a question and generate tags using suggest tags button", () => {
    cy.get("#askQuestionButton").click();
    cy.get("#title").focus();
    cy.get("#title").type("hello world");
    cy.get("#description").type("hello world in java?");

    cy.get("#suggestTagsButton").click();
    cy.contains("java");
    cy.contains("world");
  });
});
