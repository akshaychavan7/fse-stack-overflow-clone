const { defineConfig } = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
});

// const { defineConfig } = require("cypress");
// module.exports = {
//   component: {
//     devServer: {
//       framework: "create-react-app",
//       bundler: "webpack",
//     },
//   },

//   e2e: {
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//   },
// };

// module.exports = defineConfig({
//   chromeWebSecurity: false,

//   e2e: {
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//   },
// });
