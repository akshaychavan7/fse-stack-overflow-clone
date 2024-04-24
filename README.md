[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/37vDen4S)

# Final Team Project for CS5500

Login with your Northeastern credentials and read the project description [here](https://northeastern-my.sharepoint.com/:w:/g/personal/j_mitra_northeastern_edu/ETUqq9jqZolOr0U4v-gexHkBbCTAoYgTx7cUc34ds2wrTA?e=URQpeI).

## List of features

All the features you have implemented.

| Feature   | Description        | E2E Tests     | Component Tests | Jest Tests   |
| --------- | ------------------ | ------------- | --------------- | ------------ |
| View Posts | This feature enables us to view the posts available on the application | client\cypress\e2e\questionSequence.cy.js | client\cypress\component\homepage.cy.js <br> client\cypress\component\answerPage.cy.js <br> client\cypress\component\questionpage.cy.js <br> client\cypress\component\comments.cy.js <br> client\cypress\component\sidebar.cy.js   | /question/getQuestion - server\tests\questionRoute.test.js <br><br> /question/getQuestionById/:qid - server\tests\questionRoute.test.js |
| Create new posts | This feature allows us to create new Question and Answers. | client\cypress\e2e\askQuestion.cy.js <br> client\cypress\e2e\answerQuestion.cy.js | client\cypress\component\newquestion.cy.js <br>  client\cypress\component\newanswer.cy.js | /question/addQuestion - server\tests\questionRoute.test.js <br><br> /answer/addAnswer - server\tests\answerRoute.test.js |
| Commenting on post | This feature enables us to comment on a Question or an Answer. | client\cypress\e2e\comment.cy.js | client\cypress\component\comments.cy.js    | /comment/addComment - server\tests\commentRoute.test.js |
| Search for existing post | This feature allows us to search for existing posts such as questions/answers/comments. | client\cypress\e2e\search.cy.js | client\cypress\component\tag.cy.js    | /question/getQuestion?order=someOrder&search=someSearch - server\tests\questionRoute.test.js <br><br>server\tests\questionUtil.test.js |
| Vote on a post | This feature allows us to upvote or downvote on a post. | client\cypress\e2e\upvoteDownvote.cy.js | client\cypress\component\upvotedownvote.cy.js    | /vote/upvote - server\tests\voteRoute.test.js <br><br> /vote/downvote - server\tests\voteRoute.test.js|
|  Tagging Posts  | This feature allows us to view and assign tags to post. | client\cypress\e2e\tags.cy.js | client\cypress\component\tag.cy.js    | /getTagsWithQuestionNumber - server\tests\tagsRoute.test.js <br><br> /question/addQuestion - server\tests\questionRoute.test.js <br><br> python server autosuggest /tag/generateTags/ - server\python utils\testpyserver.py |
|  User Profiles | This is feature allows user to login/register and see own profile. | client\cypress\e2e\signIn.cy.js <br> client\cypress\e2e\signUp.cy.js <br> client\cypress\e2e\userProfile.cy.js | client\cypress\component\login.cy.js <br> client\cypress\component\signup.cy.js <br>  client\cypress\component\profilepage.cy.js <br> client\cypress\component\userprofile.cy.js <br> client\cypress\component\avatar.cy.js   | /login/authenticate - server\tests\loginRoute.test.js <br><br> /login/register - server\tests\loginRoute.test.js <br><br> /user/getUsersList - server\tests\userRoute.test.js <br><br> /user/getUserDetails/:userId - server\tests\userRoute.test.js <br><br> /user/getUserPosts - server\tests\userRoute.test.js|
|  Post Moderation | This feature allows moderators to resolve or delete a flagged post. | client\cypress\e2e\moderatorIgnore.cy.js <br> client\cypress\e2e\moderatorDelete.cy.js | client\cypress\component\moderator.cy.js    | /isUserModeratorAuthenticated - server\tests\serverRoute.test.js <br><br> /question/resolveQuestion server\tests\questionRoute.test.js <br><br> /question/deleteQuestion - server\tests\questionRoute.test.js <br><br> /question/getReportedQuestions - server\tests\questionRoute.test.js <br><br> /answer/resolveAnswer server\tests\answerRoute.test.js <br><br> /answer/deleteResolve - server\tests\answerRoute.test.js <br><br> /answer/getReportedAnswers - server\tests\answerRoute.test.js <br><br> /comment/resolveComment server\tests\commentRoute.test.js <br><br> /comment/deleteComment - server\tests\commentRoute.test.js <br><br> /comment/getReportedComments - server\tests\commentRoute.test.js |


. . .

## Instructions to generate and view coverage report
```console
cd server
```
```console
npm install jest
```
```console
jest --coverage --runInBand
```

## Extra Credit Section (if applicable)
1. Implemented auto-generated tags using YAKE, an unsupervised keyword extractor model.
2. Implemented a separate Python server to run the auto-generated tags feature.
3. Profanity check for user input for posts. Uses javascript's BadWords package.


### Note
- eslint on the server will report issues for init.js and server.js. We are ignoring init.js as it is a database setup file. For server.js the 'process' is same as previous soa assignment.
- Cypress E2E test cases, although working well in local scenario, seems to be facing issue on github workflow. So we are omitting the cypress test cases from github workflows. Jest cases still exist.
- For all the components, there are util functions whose test cases are also defined. We have decided not to list them on the feature table as the requirement was for test for routes.
- server/models/schema user.js has a low coverage due to most of its functionality being mocked for user routes.
- sanitizeParams branch coverage is below 80 due to no coverage on the error case.

### Application run note -
- Moderator credentials:
username: moderator
password: test

- General credentials -
username: akshay
password: password

