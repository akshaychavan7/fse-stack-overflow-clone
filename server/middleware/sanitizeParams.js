const { preprocessing, textfiltering } = require("../utils/textpreprocess");

/**
 * Middleware function for sanitizing request parameters.
 * 
 * This middleware function sanitizes the request body using a sanitizer function.
 * If the sanitization process encounters an error, it sends a 404 Not Found status
 * in the response with an error message. Otherwise, it passes control to the next
 * middleware function in the chain.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the chain.
 * @returns {void} - This middleware does not return a value directly.
 */
function sanitizeParams(req, res, next) {
  try {
    req.body = sanitizer(req.body);
    next();
  }
  catch(err) {
    return res.status(404).json({error: `Error in sanitizing the input.`});
  }
}

/**
 * Function for sanitizing request parameters.
 * 
 * This function recursively sanitizes the input parameters by preprocessing
 * string values and checking for profanity in the string. It returns the sanitized parameters
 * along with a boolean flag indicating whether any profanity was detected.
 * 
 * @param {Object} params - The request parameters to be sanitized.
 * @returns {Object} - The sanitized parameters with a flag indicating profanity detection.
 */
function sanitizer(params) {
  if (!params) return params;
  let checkProfanity = false;
  for (const key in params) {
    if (typeof params[key] === "object") {
      params[key] = sanitizer(params[key]);
    } else if (typeof params[key] === "string") {
      params[key] = preprocessing(params[key]);
      if(textfiltering(params[key])) checkProfanity = true;
    }
  }
  params['isProfane'] = checkProfanity;

  return params;
}

module.exports = sanitizeParams;
