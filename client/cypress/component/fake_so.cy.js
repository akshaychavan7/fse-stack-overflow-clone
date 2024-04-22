import { ApplicationContextProvider } from "../../src/context/ApplicationContext";
import { AlertContextProvider } from "../../src/context/AlertContext";
import { BrowserRouter } from "react-router-dom";

import FakeStackOverflow from "../../src/components/fakestackoverflow";

describe("fakeStackOverflow Component", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user_details",
      '{"firstname":"Moderator","lastname":"M1","username":"moderator","profilePic":"https://media.licdn.com/dms/image/D4D03AQF9WmGdmqrJMQ/profile-displayphoto-shrink_800_800/0/1692618347676?e=1718236800&v=beta&t=hVfMg8BIwFp429SB8_fKtBGMsw4pppqNpoJQRPnUBVI"}'
    );
    cy.intercept(
      {
        method: "GET",
        url: "/isUserAuthenticated",
      },
      {
        statusCode: 200,
        message: "User is authenticated",
      }
    ).as("isUserAuthenticated");

    // return 403 for moderator authentication
    cy.intercept(
      {
        method: "GET",
        url: "/isUserModeratorAuthenticated",
      },
      {
        statusCode: 403,
      }
    ).as("isUserModeratorAuthenticated");
  });

  it("renders loader while authentication status is being checked", () => {
    // keep waiting till 5 seconds
    cy.intercept(
      {
        method: "GET",
        url: "/isUserAuthenticated",
      },
      {
        delay: 1000,
      }
    ).as("isUserAuthenticated");
    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <FakeStackOverflow />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );
    cy.contains("Loading").should("be.visible");
  });

  it("renders Main component for authenticated non-moderator users", () => {
    // intercept question/getTrendingQuestions
    cy.intercept(
      {
        method: "GET",
        url: "/question/getTrendingQuestions",
      },
      {
        fixture: "trendingQuestions.json",
      }
    ).as("getTrendingQuestions");
    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <FakeStackOverflow />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );

    cy.get("#main").should("exist");
  });

  it("renders Moderator component for authenticated moderator users", () => {
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
        url: "/isUserModeratorAuthenticated",
      },
      {
        statusCode: 200,
        message: "User is authenticated",
      }
    ).as("isUserAuthenticated");

    cy.mount(
      <ApplicationContextProvider>
        <AlertContextProvider>
          <BrowserRouter>
            <FakeStackOverflow />
          </BrowserRouter>
        </AlertContextProvider>
      </ApplicationContextProvider>
    );

    // Ensure Moderator component is rendered
    cy.contains("2 reported questions").should("be.visible");
  });

  // this works!
  it("renders UnauthorizedAccess component for unauthenticated users", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/isUserAuthenticated",
      },
      {
        statusCode: 403,
      }
    ).as("isUserAuthenticated");

    cy.mount(
      <ApplicationContextProvider>
        <BrowserRouter>
          <FakeStackOverflow />
        </BrowserRouter>
      </ApplicationContextProvider>
    );

    // Ensure UnauthorizedAccess component is rendered
    cy.contains("Unauthorized Access").should("be.visible");
  });
});
