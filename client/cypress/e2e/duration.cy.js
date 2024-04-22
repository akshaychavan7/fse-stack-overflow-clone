describe("Test duration", () => {
  beforeEach(() => {
    // Seed the database before each test
    cy.exec("node ../server/destroy.js mongodb://127.0.0.1:27017/fake_so");
    cy.exec("node ../server/init.js mongodb://127.0.0.1:27017/fake_so");
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("#email").type("general");
    cy.get("#password").type("test");
    cy.get("#signInButton").click();
  });

  it("Test duration", () => {
    const qTitles = [
      "Quick question about storage on android",
      "Object storage for a web application",
      "android studio save string shared preference, start activity and load the saved string",
      "Programmatically navigate using React router",
    ];

    const durations = [
      "Mar 10, 2023 at 14:28",
      "Feb 18, 2023 at 01:02",
      "Jan 10, 2023 at 11:24",
      "Jan 20, 2022 at 03:00",
    ];

    qTitles.forEach((title, index) => {
      cy.contains(title).click();
      cy.contains(durations[index]);
      cy.get("#sideBarHome").click();
    });
  });
});
