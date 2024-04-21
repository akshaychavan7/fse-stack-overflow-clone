import { BrowserRouter } from "react-router-dom";
import { AlertContextProvider } from "../../src/context/AlertContext";
import { ApplicationContextProvider } from "../../src/context/ApplicationContext";
import SignUp from "../../src/components/Login/SignUp/SignUp";
import citiesList from "../../src/assets/images/citiesList";
import "cypress-file-upload";

describe("SignUp Component", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "POST",
        url: "/login/register",
      },
      {
        status: 200,
        message: "User registered successfully",
      }
    ).as("register");

    cy.intercept(
      {
        method: "GET",
        url: "/cities",
      },
      citiesList
    ).as("getCities");

    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <SignUp />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );
  });

  it("allows user to sign up with correct credentials", () => {
    cy.get("#firstName").type("Akshay");
    cy.get("#lastName").type("Chavan");
    cy.get("#email").type("akshay@test.com");
    cy.get("#password").type("password");
    cy.get("input[type='file']").attachFile("profile_pic.png");
    cy.get(".MuiAutocomplete-input").type("New York");
    cy.get("button[type='submit']").click();
    cy.wait("@register");
    cy.url().should("include", "/login");
  });

  it("displays error message on failed sign up attempt", () => {
    cy.intercept(
      {
        method: "POST",
        url: "/login/register",
      },
      {
        status: 400,
        message: "User already exists",
      }
    ).as("registerFailed");

    cy.get("#firstName").type("Akshay");
    cy.get("#lastName").type("Chavan");
    cy.get("#email").type("akshay@test.com");
    cy.get("#password").type("password");
    cy.get("input[type='file']").attachFile("profile_pic.png");
    cy.get(".MuiAutocomplete-input").type("New York");
    cy.get("button[type='submit']").click();
    cy.wait("@registerFailed");
    cy.get(".MuiAlert-message").should("contain", "User already exists");
  });

  it("displays error message when required fields are missing", () => {
    cy.get("#firstName").type("Akshay");
    cy.get("#email").type("akshay@test.com");
    cy.get("#password").type("password");
    cy.get(".MuiAutocomplete-input").type("New York");
    cy.get("button[type='submit']").click();
    cy.get(".MuiAlert-message").should(
      "contain",
      "Make sure you fill all the required fields!"
    );
  });

  it("displays error message for invalid email format", () => {
    cy.get("#firstName").type("Akshay");
    cy.get("#lastName").type("Chavan");
    cy.get("#email").type("invalid-email");
    cy.get("#password").type("password");
    cy.get(".MuiAutocomplete-input").type("New York");
    cy.get("button[type='submit']").click();
    cy.get(".MuiAlert-message").should("contain", "Invalid email address");
  });

  it("displays error message when image size is too large", () => {
    cy.fixture("large_image.jpeg").then((fileContent) => {
      cy.get("input[type='file']").attachFile({
        fileContent: fileContent.toString(),
        fileName: "large_image.jpeg",
        mimeType: "image/jpeg",
      });
    });
    cy.get(".MuiButton-startIcon").click();
    cy.get(".MuiAlert-message").should(
      "contain",
      "Image size should be less than 1MB"
    );
  });

  it("displays success message after uploading profile picture", () => {
    cy.fixture("profile_pic.png").then((fileContent) => {
      cy.get("input[type='file']").attachFile({
        fileContent: fileContent.toString(),
        fileName: "profile_pic.png",
        mimeType: "image/png",
      });
    });
    cy.get(".MuiButton-startIcon").click();
    cy.get(".MuiAlert-message").should(
      "contain",
      "Image uploaded successfully"
    );
  });

  it("allows user to select a location from autocomplete", () => {
    cy.get(".MuiAutocomplete-input").type("New");
    cy.contains(".MuiAutocomplete-option", "New York").click();
    cy.get(".MuiAutocomplete-input").should("have.value", "New York, NY");
  });
});
