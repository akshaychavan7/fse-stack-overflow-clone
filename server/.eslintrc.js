module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "max-lines-per-function": [
      "error",
      {
        skipBlankLines: true,
        skipComments: true,
      },
    ],
  },
  ignorePatterns: ["**/*.test.js", "**/*.spec.js"],
};
