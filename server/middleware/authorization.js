const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");

// Middleware to authorize JWT token - ref: https://dev.to/franciscomendes10866/using-cookies-with-jwt-in-node-js-8fn

/**
 * Middleware function for user authorization.
 * 
 * This middleware function checks whether the request contains a valid access token
 * in the cookies. If the token is missing or invalid, it sends a 403 Forbidden status
 * in the response. If the token is valid, it extracts the user ID and role from the token
 * payload and attaches them to the request object for further processing. The middleware
 * then passes control to the next middleware function in the chain.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the chain.
 * @returns {void} - This middleware does not return a value directly.
 */
const authorization = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, SECRET_KEY);
    req.userId = data.userId;
    req.userRole = data.userRole;
    next();
  } catch (e) {
    return res.sendStatus(403);
  }
};

/**
 * Middleware function for admin(moderator) authorization.
 * 
 * This middleware function checks whether the request contains a valid access token
 * in the cookies. If the token is missing or invalid, it sends a 403 Forbidden status
 * in the response. If the token is valid, it extracts the user ID and role from the token
 * payload. If the user role is not 'moderator', it sends a 403 Forbidden status in the
 * response. Otherwise, it attaches the user ID and role to the request object for further
 * processing and passes control to the next middleware function in the chain.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the chain.
 * @returns {void} - This middleware does not return a value directly.
 */
const adminAuthorization = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, SECRET_KEY);
    if (data.userRole !== "moderator") {
      return res.sendStatus(403);
    }
    req.userId = data.userId;
    req.userRole = data.userRole;
    next();
  } catch (e) {
    return res.sendStatus(403);
  }
};

module.exports = { authorization, adminAuthorization };
