import jwt from "jsonwebtoken";
import config from "../config/config.js";
export function genertedRefreshToken(userId, role) {
  return jwt.sign({ userId, role }, config.refreshToken.secret, {
    expiresIn: config.refreshToken.expiresIn,
  });
}
