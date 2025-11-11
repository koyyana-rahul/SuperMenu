import jwt from "jsonwebtoken";
export function genertedRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.SECRET_KEY_REFRESH_TOKEN, {
    expiresIn: "7d",
  });
}
