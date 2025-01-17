import { BrowserRouter } from "react-router-dom";
import { AlertContextProvider } from "../../src/context/AlertContext";
import { ApplicationContextProvider } from "../../src/context/ApplicationContext";
import Moderator from "../../src/components/Moderator/Moderator";

describe("Moderator Component", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user_details",
      '{"firstname":"Moderator","lastname":"M1","username":"moderator","profilePic":"https://media.licdn.com/dms/image/D4D03AQF9WmGdmqrJMQ/profile-displayphoto-shrink_800_800/0/1692618347676?e=1718236800&v=beta&t=hVfMg8BIwFp429SB8_fKtBGMsw4pppqNpoJQRPnUBVI"}'
    );
    cy.intercept(
      {
        method: "GET",
        url: "/question/getReportedQuestions",
      },
      {
        statusCode: 200,
        fixture: "reportedQuestions.json",
      }
    ).as("getReportedQuestions");

    cy.intercept(
      {
        method: "GET",
        url: "/answer/getReportedAnswers",
      },
      {
        statusCode: 200,
        fixture: "reportedAnswers.json",
      }
    ).as("getReportedAnswers");

    cy.intercept(
      {
        method: "GET",
        url: "/comment/getReportedComments",
      },
      {
        statusCode: 200,
        fixture: "reportedComments.json",
      }
    ).as("getReportedComments");

    cy.intercept(
      {
        method: "DELETE",
        url: "/question/deleteQuestion/*",
      },
      "Deleted flagged question."
    ).as("deleteQuestion");

    cy.intercept(
      {
        method: "DELETE",
        url: "/answer/deleteAnswer/*",
      },
      {
        statusCode: 200,
      }
    ).as("deleteAnswer");

    cy.intercept(
      {
        method: "DELETE",
        url: "/comment/deleteComment/*",
      },
      {
        statusCode: 200,
      }
    ).as("deleteComment");

    cy.intercept(
      {
        method: "POST",
        url: "/question/resolveQuestion/*",
      },
      {
        statusCode: 200,
      }
    ).as("resolveQuestion");

    cy.intercept(
      {
        method: "POST",
        url: "/answer/resolveAnswer/*",
      },
      {
        statusCode: 200,
      }
    ).as("resolveAnswer");

    cy.intercept(
      {
        method: "POST",
        url: "/comment/resolveComment/*",
      },
      {
        statusCode: 200,
      }
    ).as("resolveComment");

    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <Moderator />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );
  });

  it("displays reported questions by default", () => {
    cy.wait("@getReportedQuestions");
    cy.get(".controls").contains("Questions").should("exist");
  });

  it("displays reported answers when clicked on Answers tab", () => {
    cy.wait("@getReportedQuestions");
    cy.get(".controls").contains("Answers").click();
    cy.wait("@getReportedAnswers");
    cy.get(".controls").contains("Answers").should("exist");
  });

  it("displays reported comments when clicked on Comments tab", () => {
    cy.wait("@getReportedQuestions");
    cy.get(".controls").contains("Comments").click();
    cy.wait("@getReportedComments");
    cy.get(".controls").contains("Comments").should("exist");
  });

  it("allows deleting reported questions", () => {
    cy.wait("@getReportedQuestions");
    cy.get(".icons").eq(0).find("button").eq(0).click();
    cy.wait("@deleteQuestion");
    cy.get(".icons").should("have.length", 1);
  });

  it("allows resolving reported answers", () => {
    cy.get(".controls").contains("Answers").click();
    cy.wait("@getReportedAnswers");
    cy.get(".icons").eq(0).find("button").eq(1).click();
    cy.wait("@resolveAnswer");
    cy.get(".icons").should("have.length", 3);
  });

  it("allows deleting reported comments", () => {
    cy.get(".controls").contains("Comments").click();
    cy.wait("@getReportedComments");
    cy.get(".icons").eq(0).find("button").eq(0).click();
    cy.wait("@deleteComment");
    cy.get(".icons").should("have.length", 3);
  });

  it("allows resolving reported questions", () => {
    cy.wait("@getReportedQuestions");
    cy.get(".icons").eq(0).find("button").eq(1).click();
    cy.wait("@resolveQuestion");
    cy.get(".icons").should("have.length", 1);
  });
});
