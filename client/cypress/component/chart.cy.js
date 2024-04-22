import Chart from "../../src/components/ProfilePage/Chart";

describe("Chart Component", () => {
  it("renders a bar chart with correct data", () => {
    const questionsCount = 10;
    const answersCount = 20;
    const commentsCount = 15;

    cy.mount(
      <Chart
        questionsCount={questionsCount}
        answersCount={answersCount}
        commentsCount={commentsCount}
      />
    );

    // Check if the chart component is rendered
    cy.get("svg").should("be.visible");

    // Check if the chart contains the correct data
    cy.contains("#Questions").should("be.visible");
    cy.contains("#Answers").should("be.visible");
    cy.contains("#Comments").should("be.visible");
  });
});
