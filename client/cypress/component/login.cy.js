import { BrowserRouter } from "react-router-dom";
import Login from "../../src/components/Login/Login";
import { AlertContextProvider } from "../../src/context/AlertContext";
import { ApplicationContextProvider } from "../../src/context/ApplicationContext";

// Your Cypress test for the Login component
describe("Login Component", () => {
  beforeEach(() => {
    // // Mock login function
    cy.intercept(
      {
        method: "POST",
        url: "/login/authenticate",
      },
      {
        status: 200,
        message: "Logged In Successfully",
        user: {
          firstname: "Akshay",
          lastname: "Chavan",
          username: "akshay",
          profilePic:
            "https://media.licdn.com/dms/image/D4D03AQF9WmGdmqrJMQ/profile-displayphoto-shrink_800_800/0/1692618347676?e=1718236800&v=beta&t=hVfMg8BIwFp429SB8_fKtBGMsw4pppqNpoJQRPnUBVI",
        },
      }
    ).as("login");

    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );
  });

  it("allows user to login with correct credentials", () => {
    cy.get("#email").type("akshay");
    cy.get("#password").type("password");
    cy.get("button[type='submit']").click();
    cy.wait("@login");
    cy.url().should("include", "/home");
  });

  it("displays error message on failed login attempt", () => {
    cy.intercept(
      {
        method: "POST",
        url: "/login/authenticate",
      },
      { status: 401 }
    ).as("loginFailed");

    cy.get("#email").type("example@example.com");
    cy.get("#password").type("incorrectpassword");
    cy.get("button[type='submit']").click();
    cy.wait("@loginFailed");
    cy.get(".MuiAlert-message").should("contain", "Invalid credentials");
  });

  it("redirects user to home page if already authenticated", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/isUserAuthenticated",
      },
      {
        message: "User is authenticated",
      }
    ).as("checkAuth");

    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );
    cy.wait("@checkAuth");
    cy.url().should("include", "/home");
  });
});
