import { BrowserRouter } from "react-router-dom";
import ProfilePage from "../../src/components/ProfilePage/ProfilePage";
import { ApplicationContextProvider } from "../../src/context/ApplicationContext";
import { AlertContextProvider } from "../../src/context/AlertContext";
import user_details from "../fixtures/user_details.json";

describe("ProfilePage Component", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "GET",
        url: "/user/getUserDetails/*",
      },
      { userDetails: user_details }
    );

    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <ProfilePage username="akshay" setViewUserProfile={() => {}} />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );
  });

  it("displays user's profile information", () => {
    cy.contains("Akshay Chavan").should("be.visible");
    cy.contains("Reputation: 0").should("be.visible");
    cy.contains("Location: Boston, MA").should("be.visible");
    cy.contains("React").should("be.visible");
    cy.contains("JavaScript").should("be.visible");
    cy.contains("TypeScript").should("be.visible");
  });

  it("displays user's profile picture", () => {
    cy.get("img").should("have.attr", "src", user_details.profilePic);
  });

  it("displays loader while fetching data", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/user/getUserDetails/*",
      },
      { userDetails: null }
    );
    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <ProfilePage username="akshay" setViewUserProfile={() => {}} />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );

    // page should have loading text
    cy.contains("Loading").should("be.visible");
  });

  it("redirects to home page when 'Close' button is clicked", () => {
    cy.get('[aria-label="Close"]').click();
    cy.url().should("not.include", "/profile/akshay");
  });
});
