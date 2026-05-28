import jwt from "jsonwebtoken";

/**
 * @function verifyJwt
 * @description Verifies a JSON Web Token (JWT) using the application's secret.
 * @param {string} token - The JWT string to be verified.
 * @returns {Object|null} The decoded token payload if verification is successful, otherwise null.
 */
export const verifyJwt = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
