import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function generatedAccessToken(userId, role) {
  return jwt.sign({ userId, role }, config.accessToken.secret, {
    expiresIn: config.accessToken.expiresIn,
  });
}
