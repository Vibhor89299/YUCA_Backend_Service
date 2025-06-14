import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Authentication Error" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ msg: "Admin access required" });
  }
};
