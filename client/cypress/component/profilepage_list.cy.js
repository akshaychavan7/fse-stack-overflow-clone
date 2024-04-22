import List from "../../src/components/ProfilePage/List";

describe("List Component", () => {
  it("displays title and 'No items posted yet' message when list is empty", () => {
    const title = "Questions";
    const list = [];

    cy.mount(<List list={list} title={title} />);

    cy.contains("Questions").should("be.visible");
    cy.contains("No questions posted yet").should("be.visible");
  });

  it("displays list items when list is not empty", () => {
    const title = "Answers";
    const list = [
      { vote_count: 10, description: "Answer 1" },
      { vote_count: 5, description: "Answer 2" },
    ];

    cy.mount(<List list={list} title={title} type="answer" />);

    cy.contains("Answers").should("be.visible");
    cy.get(".list-item").should("have.length", 2);
    cy.contains("Answer 1").should("be.visible");
    cy.contains("Answer 2").should("be.visible");
  });

  it("displays vote count for each list item", () => {
    const title = "Questions";
    const list = [
      { vote_count: 15, title: "Question 1" },
      { vote_count: 8, title: "Question 2" },
    ];

    cy.mount(<List list={list} title={title} type="question" />);

    cy.get(".vote-count-box").should("have.length", 2);
    cy.contains("15").should("be.visible");
    cy.contains("8").should("be.visible");
  });
});
