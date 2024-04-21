// input must be a 24 character hex string, 12 byte Uint8Array, or an integer

/**
 * Validates whether an ID is in a valid format of MongoDB ID.
 * 
 * @param {string|Uint8Array} id - The ID to validate.
 * @returns {boolean} True if the ID is valid, false otherwise.
 * @throws {Error} If there is an error in validating the ID.
 */
const validateId = (id) => {
  try {
    if (typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)) {
      return true;
    } else if (id instanceof Uint8Array && id.length === 12) {
      return true;
    } else {
      return false;
    }
  }
  catch(err) {
    throw new Error("Error in validating ID.");
  }
};

module.exports = {
  validateId
};
