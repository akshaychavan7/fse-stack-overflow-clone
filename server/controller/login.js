const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const User = require("../models/users");

const { SECRET_KEY } = require("../config");
const sanitizeParams = require("../middleware/sanitizeParams");

const router = express.Router();

/**
 * Authenticates user credentials and generates JWT token upon successful authentication.
 * 
 * If the credentials are invalid, appropriate message is sent back.
 * If the credentials are valid, an access token is created for the cookie. The user
 * can use this as gateway to other parts of the application.
 * 
 * The callback function for the POST route /login/authenticate.
 * 
 * @param {Object} req - The HTTP request object containing user credentials in the body.
 * @param {Object} res - The HTTP response object used to send the authentication result.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the authentication process.
 */
const authenticateCredentials = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    // Check if credentials are correct.
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, userRole: user.userRole },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 90000000), // expires after 1 day
      })
      .status(200)
      .json({
        status: 200,
        message: "Logged In Successfully",
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          profilePic: user.profilePic,
        },
      });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Registers a new user with the provided user information.
 * 
 * This route adds a user to the database of the application. 
 * If the user data exists, then a response mentioning the existence of the user is sent back.
 * 
 * The callback function for the POST route /login/register.
 * 
 * @param {Object} req - The HTTP request object containing user registration data in the body.
 * @param {Object} res - The HTTP response object used to send the registration result.
 * @returns {Promise<void>} - The function does not return a value directly, but sends an HTTP response.
 * 
 * @throws {Error} - If an unexpected error occurs during the registration process.
 */
const registerUser = async (req, res) => {
  try {
    const { username, password, firstname, lastname, profilePic } = req.body;
    const existing = await User.findOne({ username });
    if (existing) {
      return res
        .status(400)
        .json({ status: 400, message: "User already exists" });
    } else {
      await User.create({
        username: username,
        password: password,
        firstname: firstname,
        lastname: lastname,
        profilePic: profilePic,
      });
      return res
        .status(200)
        .json({ status: 200, message: "User registered successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// add appropriate HTTP verbs and their endpoints to the router

router.post("/authenticate", sanitizeParams, authenticateCredentials);
router.post("/register", sanitizeParams, registerUser);
module.exports = router;
