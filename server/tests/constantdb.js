const _user1 = {
    _id: "507f191e810c19729de860ab",
    username: "user1",
    password: "password",
    firstname: "fn1",
    lastname: "ln1",
    joiningDate: new Date("2023-11-20T09:24:00"),
    profilePic: "",
    userRole: "moderator",
    technologies: ["React"],
    location: "Boston, MA",
    reputation: 0,
  };
  const _user2 = {
    _id: "65e9a5c2b26199dbcc3e6dcd",
    username: "user2",
    password: "password",
    firstname: "fn2",
    lastname: "ln2",
    joiningDate: new Date("2023-11-20T09:24:00"),
    profilePic: "",
    userRole: "general",
    technologies: ["Javascript"],
    location: "Boston, MA",
    reputation: 0,
  };
  const _user3 = {
    _id: "65e9b4b1766fca9451cba6ef",
    username: "user3",
    password: "password",
    firstname: "fn3",
    lastname: "ln3",
    joiningDate: new Date("2023-11-20T09:24:00"),
    profilePic: "",
    userRole: "general",
    technologies: ["Javascript"],
    location: "Boston, MA",
    reputation: 0,
  };
  
  const _users = [_user1, _user2, _user3];
  
  const _tag1 = {
    _id: "507f191e810c19729de860ea",
    name: "react",
  };
  const _tag2 = {
    _id: "65e9a5c2b26199dbcc3e6dc8",
    name: "javascript",
  };
  const _tag3 = {
    _id: "65e9b4b1766fca9451cba653",
    name: "android",
  };
  
  const _tags = [_tag1, _tag2, _tag3];
  
  
  const _quescomm1 = {
    _id: "65e9b58910afe6e94fc6e63a",
    description: "quescomm1",
    commented_by: _user1,
    comment_date_time: new Date("2023-11-18T09:24:00"),
    vote_count: 0,
    upvoted_by: [_user3],
    downvoted_by: [_user2],
    flag: false
  };
  
  const _quescomm2 = {
    _id: "65e9b58910afe6e94fc6e63b",
    description: "quescomm2",
    commented_by: _user2,
    comment_date_time: new Date("2023-12-18T09:24:00"),
    vote_count: 1,
    upvoted_by: [_user1],
    downvoted_by: [],
    flag: true
  };
  
  const _quescomm3 = {
    _id: "65e9b58910afe6e94fc6e63c",
    description: "quescomm3",
    commented_by: _user3,
    comment_date_time: new Date("2023-11-19T09:24:00"),
    vote_count: -1,
    upvoted_by: [],
    downvoted_by: [_user2],
    flag: false
  };
  
  const _anscomm1 = {
    _id: "65e9b58910afe6e94fc6e6a3",
    description: "anscomm1",
    commented_by: _user3,
    comment_date_time: new Date("2023-11-18T09:24:00"),
    vote_count: 0,
    upvoted_by: [_user1],
    downvoted_by: [_user2],
    flag: true
  };
  
  const _anscomm2 = {
    _id: "65e9b58910afe6e94fc6e6b3",
    description: "anscomm2",
    commented_by: _user2,
    comment_date_time: new Date("2023-12-18T09:24:00"),
    vote_count: 1,
    upvoted_by: [_user1],
    downvoted_by: [],
    flag: true
  };
  
  const _anscomm3 = {
    _id: "65e9b58910afe6e94fc6e6c3",
    description: "anscomm3",
    commented_by: _user3,
    comment_date_time: new Date("2023-11-19T09:24:00"),
    vote_count: -1,
    upvoted_by: [],
    downvoted_by: [_user2],
    flag: false
  };
  
  const _comments = [_quescomm1, _quescomm2, _quescomm3, _anscomm1, _anscomm2, _anscomm3];
  
  const _ans1 = {
    _id: "65e9b58910afe6e94fc6e6dc",
    description: "ans1",
    ans_by: _user3,
    ans_date_time: new Date("2023-11-18T09:24:00"),
    comments: [_anscomm1, _anscomm2],
    vote_count: 1,
    upvoted_by: [_user1, _user3],
    downvoted_by: [_user2],
    flag: true
  };
  
  const _ans2 = {
    _id: "65e9b58910afe6e94fc6e6dd",
    description: "ans2",
    ans_by: _user2,
    ans_date_time: new Date("2023-11-20T09:24:00"),
    comments: [],
    vote_count: 2,
    upvoted_by: [_user1, _user3],
    downvoted_by: [],
    flag: false,
  };
  
  const _ans3 = {
    _id: "65e9b58910afe6e94fc6e6de",
    description: "ans3",
    ans_by: _user1,
    ans_date_time: new Date("2023-11-19T09:24:00"),
    comments: [_anscomm3],
    vote_count: -2,
    upvoted_by: [],
    downvoted_by: [_user3, _user2],
    flag: true,
  };
  
  const _ans4 = {
    _id: "65e9b58910afe6e94fc6e6df",
    description: "ans4",
    ans_by: _user1,
    ans_date_time: new Date("2023-11-19T09:23:00"),
    comments: [],
    vote_count: -1,
    upvoted_by: [_user1],
    downvoted_by: [_user3, _user2],
    flag: true,
  };
  
  const _answers = [_ans1, _ans2, _ans3, _ans4];
  
  const _question1 = {
    _id: "65e9b58910afe6e94fc6e6dc",
    title: "Quick question about storage on android",
    description: "I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains",
    asked_by: _user1,
    tags: [_tag3, _tag2],
    answers: [_ans1, _ans2],
    comments: [_quescomm1, _quescomm2],
    ask_date_time: new Date("2023-11-16T09:24:00"),
    views: 120,
    vote_count: 1,
    upvoted_by: [_user1, _user2],
    downvoted_by: [_user3],
    flag: true
  
  };
  
  const _question2 = {
    _id: "65e9b5a995b6c7045a30d823",
    title: "Object storage for a web application",
    description: "I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.",
    asked_by: _user2,
    tags: [_tag1],
    answers: [],
    comments: [_quescomm3],
    ask_date_time: new Date("2023-11-17T09:24:00"),
    views: 130,
    vote_count: 0,
    upvoted_by: [_user1],
    downvoted_by: [_user3],
    flag: false
  };
  
  const _question3 = {
    _id: "65e9b9b44c052f0a08ecade0",
    title: "Is there a language to write programmes by pictures?",
    description: "Does something like that exist?",
    asked_by: _user3,
    tags: [_tag3, _tag2],
    answers: [_ans3],
    comments: [],
    ask_date_time: new Date("2023-11-19T09:24:00"),
    views: 111,
    vote_count: -1,
    upvoted_by: [],
    downvoted_by: [_user1],
    flag: false
  }
  
  const _question4 = {
    _id: "65e9b716ff0e892116b2de09",
    title: "Unanswered Question #2",
    description: "Does something like that exist?",
    asked_by: _user1,
    tags: [_tag2],
    answers: [],
    comments: [],
    ask_date_time: new Date("2023-11-20T09:24:00"),
    views: 99,
    vote_count: 0,
    upvoted_by: [],
    downvoted_by: [],
    flag: false
  }
  const _questions = [_question1, _question2, _question3, _question4];

  module.exports = {
    _users,
    _tags,
    _comments,
    _answers,
    _questions
  }