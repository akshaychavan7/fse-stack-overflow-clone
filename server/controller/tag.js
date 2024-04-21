const express = require("express");
const Tag = require("../models/tags");
const Question = require("../models/questions");
const { authorization } = require("../middleware/authorization");
const sanitizeParams = require("../middleware/sanitizeParams");

const router = express.Router();

/**
 * Retrieves tags along with the number of associated questions.
 * 
 * This function retrieves all tags along with the number of questions associated with each tag.
 * 
 * The callback function for the GET route tag/getTagsWithQuestionNumber.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object used to send the tags with question numbers.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getTagsWithQuestionNumber = async (req, res) => {
  try {
    let questions = await Question.find({}).populate("tags");
    let tags = await Tag.find({});

    let resp = [];
    for (let tag of tags) {
      let count = 0;
      for (let question of questions) {
        for (let t of question.tags) {
          if (tag.name === t.name) {
            count += 1;
            break;
          }
        }
      }
      resp.push({ name: tag.name, qcnt: count });
    }
    res.status(200).json(resp);
  }
  catch (err) {
    res.status(500).json({ error: "Error in getting tags and associated question count." });
  }
};


router.get("/getTagsWithQuestionNumber", authorization, sanitizeParams, getTagsWithQuestionNumber);

module.exports = router;
