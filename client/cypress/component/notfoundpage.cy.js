import { BrowserRouter } from "react-router-dom";
import NotFoundPage from "../../src/components/NotFoundPage/NotFoundPage";

describe("NotFoundPage Component", () => {
  beforeEach(() => {
    cy.mount(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );
  });

  it("displays 'Page Not Found' message", () => {
    cy.contains("Oops! Page Not Found").should("be.visible");
  });

  it("displays the explanatory text", () => {
    cy.contains(
      "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
    ).should("be.visible");
  });

  it("contains a 'Go to Home' button", () => {
    cy.contains("Go to Home").should("be.visible");
  });

  it("redirects to home page when 'Go to Home' button is clicked", () => {
    cy.intercept("GET", "/home", {
      message: "Sample Home Page",
    });
    cy.contains("Go to Home").click();
    cy.url().should("include", "/home");
  });
});
