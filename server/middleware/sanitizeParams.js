const { preprocessing } = require("../utils/textpreprocess");

// middleware to sanitize params
function sanitizeParams(req, res, next) {
  console.log("Before Sanitizing body:", req.body);
  req.body = sanitizer(req.body);
  console.log("Sanitized body:", req.body);
  next();
}

function sanitizer(params) {
  if (!params) return params;

  for (const key in params) {
    if (typeof params[key] === "object") {
      params[key] = sanitizer(params[key]);
    } else if (typeof params[key] === "string") {
      params[key] = preprocessing(params[key]);
    }
  }

  return params;
}

module.exports = sanitizeParams;
