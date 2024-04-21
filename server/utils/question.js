const Tag = require("../models/tags");
const Question = require("../models/questions");
const Comment = require("../models/comments");
const { constants } = require("./constants");

const { ansDelete, showAnsUpDown } = require("./answer");
const { showCommentUpDown } = require("../utils/comment");

/**
 * Extracts tags from a search query string.
 * 
 * @param {string} search - The search query string.
 * @returns {Array} An array of extracted tags.
 * @throws {Error} If there's an error during the process.
 */
const parseTags = (search) => {
  try {
    return (search.match(/\[([^\]]+)\]/g) || []).map((word) => word.slice(1, -1));
  }
  catch(err) {
    throw new Error("Error in parsing tags.");
  }
};

/**
 * Parses keywords from a search query string.
 * 
 * @param {string} search - The search query string.
 * @returns {Array} An array of extracted keywords.
 * @throws {Error} If there's an error during the process.
 */
const parseKeyword = (search) => {
  try {
    return search.replace(/\[([^\]]+)\]/g, " ").match(/\b\w+\b/g) || [];
  }
  catch(err) {
    throw new Error("Error in parsing keywords.");
  }
  
};

/**
 * Checks if any of the keywords from a given list are present in the title or description of a question.
 * 
 * @param {object} q - The question object.
 * @param {Array} keywordlist - An array of keywords to check.
 * @returns {boolean} True if any keyword is found in the question, otherwise false.
 * @throws {Error} If there's an error during the process.
 */
const checkKeywordInQuestion = (q, keywordlist) => {
  try {
    for (let w of keywordlist) {
      if (
        q.title.toLocaleLowerCase().includes(w.toLocaleLowerCase()) ||
        q.description.toLocaleLowerCase().includes(w.toLocaleLowerCase())
      ) {
        return true;
      }
    }
    return false;
  }
  catch(err) {
    throw new Error("Error in finding keywords in question");
  }
};

/**
 * Checks if any of the tags from a given list are present in the tags of a question.
 * 
 * @param {object} q - The question object.
 * @param {Array} taglist - An array of tags to check.
 * @returns {boolean} True if any tag is found in the question, otherwise false.
 * @throws {Error} If there's an error during the process.
 */
const checkTagInQuestion = (q, taglist) => {
  try {
    for (let tag of taglist) {
      for (let t of q.tags) {
        //   let tagName = await getTagById(t._id.toString());
        if (tag.toLocaleLowerCase() == t.name) {
          return true;
        }
      }
    }
  
    return false;
  }
  catch(err) {
    throw new Error("Error in finding tags in question");
  }
};

/**
 * Adds a new tag to the database or retrieves the ID of an existing tag.
 * 
 * @param {string} tname - The name of the tag.
 * @returns {string} The ID of the tag.
 * @throws {Error} If there's an error during the process.
 */
const addTag = async (tname) => {
  try {
    let tag = await Tag.findOne({ name: tname });
    if (tag != null) {
      return tag._id;
    } else {
      const newTag = new Tag({ name: tname });
      return (await newTag.save())._id;
    }
  } catch (err) {
    return Error("Could not add tag. ");
  }
};

/**
 * Sorts a list of questions based on activity.
 * 
 * @param {Array} qList - An array of question objects.
 * @returns {Array} The sorted array of question objects.
 * @throws {Error} If there is an error in sorting by active order.
 */
const sortByActiveOrder = (qList) => {
  try {
    // sort each questions answers so that newest answer is at 0th position
    qList = qList.map((question) => {
      question.answers.sort((a, b) => {
        const dateA = new Date(a.ans_date_time);
        const dateB = new Date(b.ans_date_time);
        return dateB - dateA;
      });
      return question;
    });

    // finally sort based on most recent answer
    qList.sort((a, b) => {
      if (a.answers.length == 0) return 1;
      if (b.answers.length == 0) return -1;
      const dateA = new Date(a.answers[0]?.ans_date_time);
      const dateB = new Date(b.answers[0]?.ans_date_time);
      return dateB - dateA;
    });

    return qList;
  }
  catch (err) {
    throw new Error("Error in sorting by active order.");
  }
};

/**
 * Retrieves questions from the database and sorts them based on the specified order.
 * 
 * @param {string} order - The order in which to sort the questions. Default is "active".
 * @returns {Array} The array of sorted question objects.
 * @throws {Error} If there is an error in getting questions by order.
 */
const getQuestionsByOrder = async (order = "active") => {
  try {
    let query = Question.find({})
      .populate("answers")
      .populate({ path: "tags" })
      .populate({
        path: "asked_by",
      });

    let questions = await query.exec();

    // default sort order will always be "newest"
    questions.sort((a, b) => {
      const dateA = new Date(a.ask_date_time);
      const dateB = new Date(b.ask_date_time);
      return dateB - dateA;
    });

    switch (order) {
      case constants.ORDER_NEWEST:
        return questions;
      case constants.ORDER_ACTIVE:
        return sortByActiveOrder(questions);
      case constants.ORDER_UNANSWERED:
        questions = questions.filter(
          (question) => question.answers.length == 0
        );
        return questions;
    }
  } catch (err) {
    return Error("Error in getting questions by order.");
  }
};


/**
 * Filters a list of questions based on a search query.
 * 
 * @param {Array} qlist - The list of questions to filter.
 * @param {string} search - The search query.
 * @returns {Array} The filtered list of questions.
 * @throws {Error} If there is an error in filtering questions by search.
 */
const filterQuestionsBySearch = (qlist = [], search = "") => {
  try {
    let searchTags = parseTags(search);
    let searchKeyword = parseKeyword(search);
    const res = qlist.filter((q) => {
      if (searchKeyword.length == 0 && searchTags.length == 0) {
        return true;
      } else if (searchKeyword.length == 0) {
        return checkTagInQuestion(q, searchTags);
      } else if (searchTags.length == 0) {
        return checkKeywordInQuestion(q, searchKeyword);
      } else {
        return (
          checkKeywordInQuestion(q, searchKeyword) ||
          checkTagInQuestion(q, searchTags)
        );
      }
    });

    return res;
  }
  catch (err) {
    return Error("Error in filtering questions by search");
  }

};


/**
 * Retrieves the top 10 questions based on the number of views.
 * 
 * @returns {Array} The top 10 questions.
 * @throws {Error} If unable to retrieve questions.
 */
const getTop10Questions = async () => {
  try {
    return await Question.find()
      .populate("tags")
      .populate("asked_by")
      .populate("answers")
      .sort({ views: -1 })
      .limit(10)
      .exec();
  }
  catch (err) {
    return Error("Unable to get questions")
  }

};

/**
 * Updates the upvote and downvote status of a question based on the user's interaction.
 * 
 * The specified quetion's upvote/downvote status for the user is updated. Following this
 * the answers and comments within the question are also updated for their upvote/downvote
 * status based on user ID.
 * 
 * @param {string} uid - The user ID.
 * @param {Object} question - The question object.
 * @returns {Object} The updated question object.
 * @throws {Error} If there is an error in setting upvote/downvote of question.
 */
const showQuesUpDown = (uid, question) => {
  try {
    question.upvote = false;
    question.downvote = false;
    let ques_upvoteBy = question["upvoted_by"].map((objectId) =>
      objectId.toString()
    );
    let ques_downvoteBy = question["downvoted_by"].map((objectId) =>
      objectId.toString()
    );
    if (ques_upvoteBy.includes(uid)) {
      question.upvote = true;
    } else if (ques_downvoteBy.includes(uid)) {
      question.downvote = true;
    }
    question["answers"] = showAnsUpDown(uid, question["answers"]);
    question["comments"] = showCommentUpDown(uid, question["comments"]);
    return question;
  }
  catch (err) {
    return new Error("Error in setting upvote downvote of question.");
  }
};

/**
 * Deletes a flagged question along with its associated answers and comments.
 * 
 * @param {string} qid - The ID of the question to be deleted.
 * @returns {Object} An object containing the status and message of the deletion process.
 * @throws {Error} If there is an error in deleting the question.
 */
const questionDelete = async (qid) => {
  try {
    let question = await Question.findOne({ _id: qid });
    for (let answer in question['answers']) {
      await ansDelete(qid, question['answers'][answer]);
    }
    for (let comment in question['comments']) {
      await Comment.deleteOne({ _id: question['comments'][comment] });
    }
    await Question.findByIdAndDelete(qid);
    return { status: 200, message: "Deleted flagged question." }
  }
  catch (err) {
    return new Error("Error in deleting question.");
  }

}

module.exports = {
  addTag,
  getQuestionsByOrder,
  filterQuestionsBySearch,
  getTop10Questions,
  showQuesUpDown,
  questionDelete
};
