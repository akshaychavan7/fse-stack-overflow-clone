import { BrowserRouter } from "react-router-dom";
import UnauthorizedAccess from "../../src/components/Login/UnauthorizedAccess";

describe("UnauthorizedAccess Component", () => {
  beforeEach(() => {
    cy.mount(
      <BrowserRouter>
        <UnauthorizedAccess />
      </BrowserRouter>
    );
  });

  it("renders UnauthorizedAccess component correctly", () => {
    cy.contains("Unauthorized Access").should("exist");
    cy.contains(
      "You are not authorized to view this page. Please log in or contact the administrator for assistance."
    ).should("exist");
    cy.get("#login-btn").contains("Log In").should("exist");
  });

  it("redirects to login page when Log In button is clicked", () => {
    cy.intercept("GET", "/login", {
      message: "Sample Login Page",
    }).as("getData");
    cy.get("#login-btn").contains("Log In").click();
    // check if url contains /login
    cy.url().should("include", "/login");
  });
});
