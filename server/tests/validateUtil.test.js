const {validateId} = require("../utils/validator");

describe('validateId', () => {
    test('should return true for valid string id', () => {
      const validStringId = '5f2b672f04c9be0568245fb1';
      expect(validateId(validStringId)).toBe(true);
    });
  
    test('should return true for valid Uint8Array id', () => {
      const validUint8ArrayId = new Uint8Array(12);
      expect(validateId(validUint8ArrayId)).toBe(true);
    });
  
    test('should return false for invalid string id', () => {
      const invalidStringId = 'invalid_id';
      expect(validateId(invalidStringId)).toBe(false);
    });
  
    test('should return false for invalid Uint8Array id', () => {
      const invalidUint8ArrayId = new Uint8Array(10);
      expect(validateId(invalidUint8ArrayId)).toBe(false);
    });
  
    test('should return false for null id', () => {
      const nullId = null;
      expect(validateId(nullId)).toBe(false);
    });
  
    test('should return false for undefined id', () => {
      const undefinedId = undefined;
      expect(validateId(undefinedId)).toBe(false);
    });
});