import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Authentication Error" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT decoded:', decoded);
    req.user = await User.findById(decoded.id).select("-password");
    console.log('User found:', req.user ? 'Yes' : 'No');
    if (req.user) {
      console.log('User ID:', req.user._id);
    }
    next();
  } catch (err) {
    console.log('JWT verification error:', err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: "Admin access required" 
    });
  }
};
