import AutoComplete from "../../src/components/AutoComplete/AutoComplete";

describe("AutoComplete Component", () => {
  let setValueStub;

  beforeEach(() => {
    setValueStub = cy.stub().as("setValue");
    const options = [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
    ];
    const value = "New York";
    cy.mount(
      <AutoComplete options={options} value={value} setValue={setValueStub} />
    );
  });

  it("renders Autocomplete with provided options", () => {
    cy.get(".MuiAutocomplete-input").should("exist");
    const options = [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
    ];
    options.forEach((option) => {
      cy.get(".MuiAutocomplete-input").clear();
      cy.get(".MuiAutocomplete-input").type(option);
      // Check if the input value is updated
      cy.get(".MuiAutocomplete-input").should("have.value", option);
    });
  });

  it("selects option from Autocomplete dropdown", () => {
    // focus on input
    cy.get(".MuiAutocomplete-input").clear();
    cy.get(".MuiAutocomplete-input").type("Los Angeles");
    cy.contains(".MuiAutocomplete-option", "Los Angeles").click();
    cy.get("@setValue").should("have.been.calledWith", "Los Angeles");
  });

  it("updates value when free text is entered", () => {
    cy.get(".MuiAutocomplete-input").clear();
    cy.get(".MuiAutocomplete-input").type("San Francisco");
    cy.get("@setValue").should("have.been.calledWith", "San Francisco");
  });
});
