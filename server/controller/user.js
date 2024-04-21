const express = require("express");
const User = require("../models/users");


const { preprocessing } = require("../utils/textpreprocess");

const { authorization } = require("../middleware/authorization");
const sanitizeParams = require("../middleware/sanitizeParams");

const { getQuestionsByUser, getAnswersByUser, getCommentsByUser } = require("../utils/user");

const router = express.Router();

/**
 * Retrieves a list of users with selected information.
 * 
 * This function retrieves a list of users from the database and formats the data to avoid leaking sensitve
 * information.
 * 
 * The callback function for the POST route user/getUsersList.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object used to send the user list.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getUsersList = async (req, res) => {
  try {
    let usersList = await User.find({});
    usersList = usersList.map((user) => {
      return {
        username: user.username,
        name: user.firstname + " " + user.lastname,
        profilePic: user.profilePic,
        location: user.location,
        technologies: user.technologies,
      };
    });
    res.status(200).json(usersList);
  }
  catch (err) {
    res.status(500).json({ error: `Error in fetching user list : ${err}` });
  }

};

/**
 * Retrieves details of a specific user.
 * 
 * This function retrieves detailed information about a specific user based on their username.
 * 
 * This is the callback function for the GET route user/getUserDetails.
 * 
 * @param {Object} req - The HTTP request object containing the username in the URL parameters.
 * @param {Object} res - The HTTP response object used to send the user details.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getUserDetails = async (req, res) => {
  try {
    let user = await User.findOne({
      username: preprocessing(req.params.username),
    });
    let questions = await getQuestionsByUser(user._id.toString());
    let answers = await getAnswersByUser(user._id.toString());
    let comments = await getCommentsByUser(user._id.toString());
    let udetails = {
      username: user["username"],
      firstname: user["firstname"],
      lastname: user["lastname"],
      joiningDate: user["joiningDate"],
      profilePic: user["profilePic"],
      userRole: user["userRole"],
      reputation: user["reputation"],
      location: user["location"],
      technologies: user["technologies"],
      questions: questions,
      answers: answers,
      comments: comments,
    };
    res.status(200).json({ userDetails: udetails });
  } catch (err) {
    res.status(500).json({ error: `Error in fetching user details : ${err}` });
  }
};

/**
 * Retrieves posts contributed by a specific user.
 * 
 * This function retrieves posts contributed by a specific user, including questions asked,
 * answers provided, and comments made by the user. The user ID is extracted from the request
 * parameter set while logging in.
 * 
 * The callback function for the GET route user/getUserPosts.
 * 
 * @param {Object} req - The HTTP request object containing the user's ID.
 * @param {Object} res - The HTTP response object used to send the user's posts.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the retrieval process.
 */
const getUserPosts = async (req, res) => {
  try {
    let uid = preprocessing(req.userId);
    let questions = await getQuestionsByUser(uid);
    let answers = await getAnswersByUser(uid);
    let comments = await getCommentsByUser(uid);

    res
      .status(200)
      .send({ questions: questions, answers: answers, comments: comments });
  } catch (err) {
    res.status(500).send(`Error in fetching user contributed posts: ${err}`);
  }
};
// have to make route to update user details.

router.post("/getUsersList", authorization, sanitizeParams, getUsersList);
router.get("/getUserDetails/:username", authorization, sanitizeParams, getUserDetails);
router.get("/getUserPosts", authorization, sanitizeParams, getUserPosts);

module.exports = router;
