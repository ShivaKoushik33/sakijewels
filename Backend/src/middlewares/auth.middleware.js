import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ code: "NO_TOKEN", message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      return res
        .status(401)
        .json({ code: "USER_INACTIVE", message: "User not authorized" });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ code: "TOKEN_EXPIRED", message: "Session expired, please login again" });
    }
    return res
      .status(401)
      .json({ code: "TOKEN_INVALID", message: "Token failed" });
  }
};

export default authMiddleware;
