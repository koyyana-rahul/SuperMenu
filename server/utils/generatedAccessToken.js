import jwt from "jsonwebtoken";

export function generatedAccessToken(userId) {
  return jwt.sign({ userId }, process.env.SECRET_KEY_ACCESS_TOKEN, {
    expiresIn: "15m",
  });
}
